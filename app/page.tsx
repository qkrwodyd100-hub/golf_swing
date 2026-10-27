"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Flag,
  MapPin,
  Navigation,
  NotebookPen,
  Search,
  TableProperties,
} from "lucide-react";
import raw from "@/data/courses.json";

interface ConsensusSource {
  type: string | null;
  author: string | null;
  title: string | null;
  date: string | null;
  url: string | null;
}
interface HoleConsensus {
  fairway: string | null;
  green: string | null;
  strength: "strong" | "weak";
  sources: ConsensusSource[];
  note?: string | null;
}
interface HoleSingleNote {
  text: string;
  sources: ConsensusSource[];
}
interface Hole {
  par: number;
  handicap: number | null;
  tee: Record<string, number | null>;
  teeOrder: string[];
  hazards: string[] | null;
  verified: boolean;
  sourceUrl: string;
  imageUrl: string | null;
  memo: string | null;
  holeName?: string;
  tip?: string | null;
  tipSource?: string | null;
  consensus?: HoleConsensus | null;
  singleNote?: HoleSingleNote | null;
}
interface ClubLevelConsensus {
  text: string;
  sources: ConsensusSource[];
}
interface Club {
  id: string;
  name: string;
  region: string;
  courses: string[];
  courseLevelConsensus?: ClubLevelConsensus[];
}
interface Data {
  clubs: Club[];
  holes: Record<string, Record<string, Hole>>;
  meta: { totalHoles: number; verified: number; unverified: number };
}

const DATA = raw as unknown as Data;

const TEE_LABELS: Record<string, string> = {
  black: "블랙",
  blue: "블루",
  white: "화이트",
  yellow: "옐로우",
  red: "레드",
  gold: "골드",
  lady: "레이디",
  bt: "B/T",
  rt: "R/T",
  ft: "F/T",
  lt: "L/T",
};

function teeLabel(key: string): string {
  return TEE_LABELS[key] ?? key;
}

/** 기본 티: white 우선, 없으면 일반티(R/T → blue 순), 그 외 첫 티 */
const FALLBACK_TEES = ["white", "rt", "blue"];

function defaultTee(teeOrder: string[]): string {
  for (const t of FALLBACK_TEES) if (teeOrder.includes(t)) return t;
  return teeOrder[0] ?? "white";
}

/**
 * 공략 불릿: tip·consensus 원문의 부분문자열만으로 구성 (창작 추가 없음).
 * 각 불릿 20자 내외·최대 4개, 해저드 칩·서로 간의 중복 문구 제거.
 */
function buildBullets(hole: Hole): string[] {
  const srcs = [hole.tip, hole.consensus?.fairway, hole.consensus?.green].filter(
    (s): s is string => !!s
  );
  const norm = (x: string) => x.replace(/\s+/g, "");
  const hazardNorms = (hole.hazards ?? []).map(norm);
  const picked: string[] = [];
  const clauses: string[] = [];
  for (const s of srcs) {
    for (const part of s.split(/[.\n·;；。]+/)) {
      const t = part.replace(/\s+/g, " ").trim();
      if (t.length < 4) continue;
      clauses.push(t.length > 24 ? t.slice(0, 24).trimEnd() + "…" : t);
    }
  }
  for (const c of clauses) {
    if (picked.length >= 4) break;
    const n = norm(c);
    if (picked.some((p) => norm(p).includes(n) || n.includes(norm(p)))) continue;
    if (hazardNorms.some((h) => h === n)) continue;
    picked.push(c);
  }
  return picked;
}

/** 공략 포인트 통합: 라벨 불릿(해저드/티샷/그린) + 중복 제거된 추가 불릿. */
function buildPoints(hole: Hole): { label: string; text: string }[] {
  const labeled = buildDetail(hole);
  const norms = labeled.map((d) => d.text.replace(/\s+/g, ""));
  const extra = buildBullets(hole).filter((b) => {
    const n = b.replace(/\s+/g, "");
    return !norms.some((m) => m.includes(n) || n.includes(m));
  });
  const out = [...labeled];
  extra.slice(0, Math.max(0, 6 - out.length)).forEach((t) => out.push({ label: "공략", text: t }));
  return out;
}
function buildDetail(hole: Hole): { label: string; text: string }[] {
  const out: { label: string; text: string }[] = [];
  const cut = (s: string, n = 48) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);
  const norm = (x: string) => x.replace(/\s+/g, "");
  if (hole.hazards && hole.hazards.length > 0)
    out.push({ label: "해저드", text: cut(hole.hazards.join(" · ")) });
  const hazardNorm = norm(hole.hazards?.join(" · ") ?? "");
  const parts = (hole.singleNote?.text ?? "")
    .split("·")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const tee =
    hole.consensus?.fairway ?? parts.find((p) => !/그린/.test(p)) ?? hole.tip ?? null;
  const green =
    hole.consensus?.green ?? parts.find((p) => /그린/.test(p)) ?? null;
  if (tee && norm(tee) !== hazardNorm) out.push({ label: "티샷", text: cut(tee) });
  if (green && green !== tee) out.push({ label: "그린 공략", text: cut(green) });
  return out;
}

function StatusBadge({ verified }: { verified: boolean }) {
  if (verified)
    return (
      <span className="rounded-full border-2 border-emerald-300 px-3 py-0.5 text-base font-extrabold text-emerald-300">
        공식확인
      </span>
    );
  return (
    <span className="rounded-full border-2 border-neutral-400 px-3 py-0.5 text-base font-extrabold text-neutral-300">
      미입력
    </span>
  );
}

export default function YardageBookPage() {
  const [query, setQuery] = useState("");
  const [clubId, setClubId] = useState(DATA.clubs[0]?.id ?? "");
  const [course, setCourse] = useState(DATA.clubs[0]?.courses[0] ?? "");
  const [holeNo, setHoleNo] = useState(1);
  const [tee, setTee] = useState("white");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const club = useMemo(() => DATA.clubs.find((c) => c.id === clubId)!, [clubId]);

  const filteredClubs = useMemo(() => {
    const q = query.trim();
    if (!q) return DATA.clubs;
    return DATA.clubs.filter(
      (c) =>
        c.name.includes(q) ||
        c.region.includes(q) ||
        c.courses.some((co) => co.includes(q))
    );
  }, [query]);

  const holeKey = `${clubId}:${course}`;
  const courseHoles = DATA.holes[holeKey] ?? {};
  const holeNos = useMemo(
    () =>
      Object.keys(courseHoles)
        .map(Number)
        .sort((a, b) => a - b),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [holeKey]
  );
  const hole: Hole | undefined = courseHoles[String(holeNo)];

  const noteKey = useMemo(
    () => `yardage-note:${clubId}:${course}:${holeNo}`,
    [clubId, course, holeNo]
  );

  // 티 기본값: white 우선, 없으면 일반티(R/T·blue 순)로 보정. 선택 기능은 유지.
  useEffect(() => {
    if (hole && !hole.teeOrder.includes(tee)) setTee(defaultTee(hole.teeOrder));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holeKey, holeNo]);

  // 홀 변경 시 메모 리로드
  useEffect(() => {
    setNoteSaved(false);
    try {
      setNote(localStorage.getItem(noteKey) ?? "");
    } catch {
      setNote("");
    }
  }, [noteKey, hole?.imageUrl]);

  function selectClub(id: string) {
    const c = DATA.clubs.find((x) => x.id === id)!;
    setClubId(id);
    setCourse(c.courses[0]);
    setHoleNo(1);
  }

  function saveNote() {
    try {
      localStorage.setItem(noteKey, note);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      setNoteSaved(false);
    }
  }

  const teeDist = hole && hole.tee[tee] != null ? hole.tee[tee] : null;
  const points = useMemo(() => (hole ? buildPoints(hole) : []), [hole]);

  /* ── 코스 브리핑 (공식 수치에서만 도출, 창작 없음) ── */
  const briefing = useMemo(() => {
    const holes = holeNos
      .map((n) => courseHoles[String(n)])
      .filter((h): h is Hole => !!h);
    if (holes.length === 0) return null;
    const parTotal = holes.reduce((s, h) => s + h.par, 0);
    const par3 = holes.filter((h) => h.par === 3).length;
    const par4 = holes.filter((h) => h.par === 4).length;
    const par5 = holes.filter((h) => h.par === 5).length;
    // 코스 내 티 순서 합집합 (첫 등장 순서 유지)
    const teeUnion: string[] = [];
    for (const h of holes)
      for (const t of h.teeOrder) if (!teeUnion.includes(t)) teeUnion.push(t);
    const teeTotals = teeUnion.map((t) => {
      let sum = 0;
      let missing = 0;
      for (const h of holes) {
        const v = h.tee[t];
        if (typeof v === "number") sum += v;
        else missing += 1;
      }
      return { tee: t, total: sum, missing };
    });
    const withHd = holeNos
      .map((n) => ({ n, hd: courseHoles[String(n)]?.handicap ?? null }))
      .filter((x) => typeof x.hd === "number")
      .sort((a, b) => (a.hd as number) - (b.hd as number));
    const hardest = withHd.slice(0, 3);
    // 선택 티 기준 최장/최단 홀
    const withDist = holeNos
      .map((n) => ({ n, d: courseHoles[String(n)]?.tee[tee] ?? null }))
      .filter((x): x is { n: number; d: number } => typeof x.d === "number");
    const sorted = [...withDist].sort((a, b) => b.d - a.d);
    const maxD = sorted.length > 0 ? sorted[0].d : null;
    return { holes, parTotal, par3, par4, par5, teeUnion, teeTotals, hardest, withDist, maxD, longest: sorted[0] ?? null, shortest: sorted.length > 0 ? sorted[sorted.length - 1] : null };
  }, [courseHoles, holeNos, tee]);

  const holeIdx = holeNos.indexOf(holeNo);
  const prevHole = holeIdx > 0 ? holeNos[holeIdx - 1] : null;
  const nextHole = holeIdx >= 0 && holeIdx < holeNos.length - 1 ? holeNos[holeIdx + 1] : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl bg-fairway-950 px-4 pb-16 pt-6 text-white">
      {/* 헤더 */}
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fairway-600">
          <BookOpen className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">캐디 야디지북</h1>
          <p className="text-base text-emerald-100/90">
            7개 클럽 · {DATA.meta.totalHoles}홀 공식확인 · 전략 한눈에
          </p>
        </div>
      </header>

      {/* 코스 선택: 검색 + 필터 */}
      <section aria-label="골프장 선택" className="mb-4 rounded-2xl bg-fairway-900 p-4 shadow">
        <label htmlFor="course-search" className="mb-2 flex items-center gap-2 text-lg font-bold">
          <MapPin className="h-5 w-5 text-emerald-300" aria-hidden />
          골프장 선택
        </label>
        <div className="relative mb-3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-100/60"
            aria-hidden
          />
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="골프장·지역·코스 검색 (예: 태안, SOL-IN)"
            className="w-full rounded-xl border-2 border-fairway-700 bg-fairway-950 py-3 pl-11 pr-3 text-lg text-white placeholder:text-emerald-100/50 focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {filteredClubs.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => selectClub(c.id)}
                aria-pressed={c.id === clubId}
                className={`flex w-full items-center justify-between rounded-xl border-2 px-3 py-3 text-left text-lg ${
                  c.id === clubId
                    ? "border-emerald-300 bg-fairway-700 font-bold"
                    : "border-transparent bg-fairway-950/60 hover:border-fairway-600"
                }`}
              >
                <span>
                  {c.name}
                  <span className="ml-2 text-base font-normal text-emerald-100/80">
                    {c.region} · {c.courses.join(" / ")}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            </li>
          ))}
          {filteredClubs.length === 0 && (
            <li className="rounded-xl bg-fairway-950/60 px-3 py-4 text-center text-lg text-emerald-100/80">
              검색 결과가 없습니다.
            </li>
          )}
        </ul>
        {/* 코스 선택 */}
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="코스 선택">
          {club.courses.map((co) => (
            <button
              key={co}
              type="button"
              onClick={() => {
                setCourse(co);
                setHoleNo(1);
              }}
              aria-pressed={co === course}
              className={`rounded-full px-5 py-2.5 text-lg font-bold ${
                co === course
                  ? "bg-emerald-300 text-fairway-950"
                  : "bg-fairway-700 text-white hover:bg-fairway-600"
              }`}
            >
              {co} 코스
            </button>
          ))}
        </div>
      </section>

      {/* 코스 브리핑: 라운드 전 전략 판단용 */}
      {briefing && (
        <section aria-label="코스 브리핑" className="mb-4 rounded-2xl bg-fairway-900 p-4 shadow">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <ClipboardList className="h-5 w-5 text-emerald-300" aria-hidden />
            <span className="rounded-md bg-emerald-300 px-2 py-0.5 text-lg font-black text-fairway-950">01</span>
            코스 브리핑 · {club.name} {course}
          </h2>
          <p className="mt-1 text-base text-emerald-100/80">
            Par {briefing.parTotal} · Par3 {briefing.par3} · Par4 {briefing.par4} · Par5 {briefing.par5}
            {" · "}총 {briefing.holes.length}홀
          </p>
          {/* 티별 총전장 (티 선택용 — 공식 합산, 미표기 홀 있으면 병기) */}
          <div className="mt-3 space-y-2">
            {briefing.teeTotals.map((t) => {
              const max = Math.max(...briefing.teeTotals.map((x) => x.total), 1);
              const pct = Math.round((t.total / max) * 100);
              const active = t.tee === tee;
              return (
                <button
                  key={t.tee}
                  type="button"
                  onClick={() => setTee(t.tee)}
                  aria-pressed={active}
                  className={`block w-full rounded-xl border-2 px-3 py-2 text-left ${
                    active ? "border-emerald-300 bg-fairway-700" : "border-transparent bg-fairway-950/60 hover:border-fairway-600"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-lg font-extrabold">
                      {teeLabel(t.tee)}
                      {t.missing > 0 && (
                        <span className="ml-2 text-sm font-bold text-amber-200">({t.missing}홀 미표기 제외)</span>
                      )}
                    </span>
                    <span className="text-lg font-extrabold text-emerald-200">
                      {t.total.toLocaleString()}m
                    </span>
                  </span>
                  <span className="mt-1 block h-2 overflow-hidden rounded-full bg-fairway-950">
                    <span className="block h-full rounded-full bg-emerald-300" style={{ width: `${pct}%` }} />
                  </span>
                </button>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1 text-base leading-relaxed">
            {briefing.longest && briefing.shortest && briefing.longest.n !== briefing.shortest.n && (
              <li>
                <span className="font-extrabold text-emerald-200">• 전장 포인트 : </span>
                <span className="font-bold">
                  최장 {briefing.longest.n}번홀({briefing.longest.d.toLocaleString()}m) · 최단 {briefing.shortest.n}번홀({briefing.shortest.d.toLocaleString()}m) — {teeLabel(tee)} 기준
                </span>
              </li>
            )}
            {briefing.hardest.length > 0 ? (
              <li>
                <span className="font-extrabold text-emerald-200">• 어려운 홀 : </span>
                <span className="font-bold">
                  {briefing.hardest.map((h) => `${h.n}번홀(HD ${h.hd})`).join(" · ")} — 공식 핸디캡 순
                </span>
              </li>
            ) : (
              <li>
                <span className="font-extrabold text-emerald-200">• 어려운 홀 : </span>
                <span className="font-bold">공식 핸디캡 미공개 코스 — 전장·해저드로 판단</span>
              </li>
            )}
          </ul>
          {/* 클럽 단위 공통 의견 (로얄링스·예미지 등) */}
          {club.courseLevelConsensus && club.courseLevelConsensus.length > 0 && (
            <div className="mt-3 rounded-xl border border-sky-300/50 bg-fairway-950/60 px-4 py-3">
              <h3 className="text-lg font-extrabold text-sky-200">
                클럽 공통 의견 <span className="text-sm font-bold text-sky-200/70">({club.name})</span>
              </h3>
              <ul className="mt-1.5 space-y-1.5">
                {club.courseLevelConsensus.map((cc, i) => (
                  <li key={i} className="text-base leading-relaxed text-white">
                    · {cc.text}{" "}
                    <span className="text-sm text-emerald-100/60">
                      (출처 {cc.sources.length}곳)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 홀 전장표: 한눈에 보는 전략표 */}
      {briefing && (
        <section aria-label="홀 전장표" className="mb-4 rounded-2xl bg-fairway-900 p-4 shadow">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <TableProperties className="h-5 w-5 text-emerald-300" aria-hidden />
            <span className="rounded-md bg-emerald-300 px-2 py-0.5 text-lg font-black text-fairway-950">02</span>
            홀 전장표
          </h2>
          <p className="mt-1 text-sm text-emerald-100/70">
            홀 번호를 누르면 아래 상세로 이동 · {teeLabel(tee)} 기준 강조
          </p>
          <div className="mt-2 overflow-x-auto rounded-xl border-2 border-fairway-600">
            <table className="w-full min-w-[560px] border-collapse text-center text-lg">
              <thead>
                <tr className="bg-fairway-950/80">
                  <th className="sticky left-0 bg-fairway-950 px-2 py-2 font-extrabold">홀</th>
                  {briefing.teeUnion.map((t) => (
                    <th
                      key={t}
                      className={`px-2 py-2 font-extrabold ${t === tee ? "bg-emerald-300 text-fairway-950" : "text-emerald-100"}`}
                    >
                      {teeLabel(t)}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-extrabold text-emerald-100">Par/HD</th>
                </tr>
              </thead>
              <tbody>
                {holeNos.map((n) => {
                  const h = courseHoles[String(n)];
                  const active = n === holeNo;
                  return (
                    <tr key={n} className={`border-t-2 border-fairway-700 ${active ? "bg-fairway-600/60" : n % 2 === 0 ? "bg-fairway-950/40" : ""}`}>
                      <td className="sticky left-0 bg-fairway-900 px-1 py-1.5">
                        <button
                          type="button"
                          onClick={() => setHoleNo(n)}
                          aria-pressed={active}
                          className={`w-full rounded-lg px-2 py-2 text-xl font-black ${
                            active ? "bg-emerald-300 text-fairway-950" : "bg-fairway-950 text-white hover:bg-fairway-700"
                          }`}
                        >
                          {n}
                        </button>
                      </td>
                      {briefing.teeUnion.map((t) => {
                        const v = h.tee[t];
                        return (
                          <td
                            key={t}
                            className={`px-2 py-2.5 font-extrabold ${t === tee ? "bg-emerald-300/15 text-emerald-200" : "text-white/90"}`}
                          >
                            {typeof v === "number" ? v.toLocaleString() : "–"}
                          </td>
                        );
                      })}
                      <td className="whitespace-nowrap px-2 py-2.5 font-extrabold text-white/90">
                        {h.par}/{h.handicap ?? "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 홀 선택: 실제 홀 수만큼 탭 (9홀 코스는 9개) — 상단 고정으로 이동 피로 감소 */}
      <nav aria-label="홀 선택" className="sticky top-0 z-20 -mx-4 mb-4 bg-fairway-950/95 px-4 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
          {holeNos.map((n) => {
            const h = courseHoles[String(n)];
            const active = n === holeNo;
            return (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setHoleNo(n)}
                className={`flex min-w-[64px] flex-col items-center rounded-xl border-2 px-2 py-2 ${
                  active
                    ? "border-emerald-300 bg-emerald-300 text-fairway-950"
                    : "border-fairway-700 bg-fairway-900 text-white"
                }`}
              >
                <span className="text-xl font-extrabold">{n}H</span>
                <span
                  className={`mt-0.5 rounded-full px-2 text-sm font-bold ${
                    active ? "bg-fairway-950 text-emerald-200" : "bg-fairway-700 text-emerald-100"
                  }`}
                >
                  Par {h.par}
                </span>
                <span
                  className={`mt-1 h-2 w-2 rounded-full ${h.verified ? "bg-emerald-400" : "bg-neutral-500"}`}
                  title={h.verified ? "공식확인" : "미입력"}
                  aria-label={h.verified ? "공식확인" : "미입력"}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* 홀 상세: 이미지 한 장 요약형 */}
      <section aria-label="홀 상세 정보" className="rounded-2xl bg-fairway-900 p-5 shadow">
        {!hole ? (
          <div className="rounded-xl bg-fairway-950/60 p-5 text-center">
            <Flag className="mx-auto mb-2 h-8 w-8 text-emerald-200" aria-hidden />
            <p className="text-xl font-bold">데이터 미입력</p>
            <p className="mt-1 text-lg text-emerald-100/80">
              이 홀의 야디지 정보가 아직 등록되지 않았습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold">
                {club.name} {course} {holeNo}번 홀
              </h2>
              <StatusBadge verified={hole.verified} />
            </div>

            {/* 이전/다음 홀 — 하단 고정으로 한 손 이동 */}
            <div className="sticky bottom-0 z-10 mb-3 flex gap-2 bg-fairway-900/95 py-2 backdrop-blur">
              <button
                type="button"
                disabled={prevHole == null}
                onClick={() => prevHole != null && setHoleNo(prevHole)}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-fairway-700 py-4 text-xl font-extrabold disabled:opacity-40 hover:bg-fairway-600"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden /> {prevHole != null ? `${prevHole}번홀` : "이전"}
              </button>
              <button
                type="button"
                disabled={nextHole == null}
                onClick={() => nextHole != null && setHoleNo(nextHole)}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-emerald-300 py-4 text-xl font-extrabold text-fairway-950 disabled:opacity-40 hover:bg-emerald-200"
              >
                {nextHole != null ? `${nextHole}번홀` : "다음"} <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </div>

            {/* 티 선택 (콤팩트) */}
            <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="티박스 선택">
              {hole.teeOrder.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTee(t)}
                  aria-pressed={tee === t}
                  className={`rounded-full whitespace-nowrap px-3 py-1.5 text-base font-bold ${
                    tee === t
                      ? "bg-emerald-300 text-fairway-950"
                      : "bg-fairway-700 text-white hover:bg-fairway-600"
                  }`}
                >
                  {teeLabel(t)}
                </button>
              ))}
            </div>

            {/* 코스 내 상대 전장 바 (선택 티 기준, 공식 수치 비교용) */}
            {typeof teeDist === "number" && briefing?.maxD ? (
              <div className="mb-3 rounded-xl bg-fairway-950/60 px-3 py-2">
                <p className="text-base font-bold text-emerald-100/90">
                  코스 내 상대 전장 · {teeLabel(tee)} {teeDist.toLocaleString()}m
                  {briefing.longest && briefing.shortest && (
                    <span className="text-emerald-100/60">
                      {" "}(최장 {briefing.longest.d.toLocaleString()}m · 최단 {briefing.shortest.d.toLocaleString()}m)
                    </span>
                  )}
                </p>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-fairway-700">
                  <div
                    className="h-full rounded-full bg-emerald-300"
                    style={{ width: `${Math.max(8, Math.round((teeDist / briefing.maxD) * 100))}%` }}
                  />
                </div>
              </div>
            ) : null}

            {/* 히어로: 공식 가이드 이미지만 (표기 없음) */}
            {hole.imageUrl && (
              <figure className="relative overflow-hidden rounded-xl border-2 border-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hole.imageUrl}
                  alt={`${club.name} ${course} ${holeNo}번 홀`}
                  className="block h-auto w-full"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-2.5 pt-10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-emerald-300 px-3 py-1 text-lg font-extrabold text-fairway-950">
                      {holeNo}H · Par {hole.par}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-base font-extrabold text-black">
                      HD {hole.handicap ?? "미공개"}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-base font-extrabold text-black">
                      <Navigation className="mr-1 inline h-4 w-4" aria-hidden />
                      {teeLabel(tee)} {teeDist != null ? `${teeDist.toLocaleString()}m` : "미표기"}
                    </span>
                  </div>
                </div>
              </figure>
            )}

            {/* 해저드 칩 */}
            <div className="mt-3">
              {hole.hazards && hole.hazards.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5" aria-label="해저드 요약">
                  {hole.hazards.map((hz, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-1 rounded-full border border-amber-300/60 bg-fairway-950/60 px-3 py-1 text-base font-bold text-amber-200"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                      {hz}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* 캐디 브리핑 (홀별 동일 형식): 해저드 / 티샷 / 그린 공략 — 햇빛용 종이 카드 */}
            {points.length > 0 && (
              <div className="mt-3 rounded-2xl border-4 border-emerald-300 bg-white px-4 py-3 text-black shadow-lg">
                <h3 className="mb-2 flex items-center gap-2 text-xl font-black tracking-tight">
                  <span className="rounded-md bg-black px-2 py-0.5 text-lg font-black text-emerald-300">캐디</span>
                  브리핑
                </h3>
                <ul className="space-y-2">
                  {points.map((d, i) => (
                    <li key={i} className="flex gap-2 text-xl font-bold leading-snug">
                      <span className="mt-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-black px-2 text-base font-black text-emerald-300">
                        {i + 1}
                      </span>
                      <span>
                        <span className="font-black">[{d.label}] </span>
                        {d.text}
                      </span>
                    </li>
                  ))}
                </ul>
                {(hole.consensus || hole.singleNote) && (
                  <p className="mt-2 border-t-2 border-neutral-200 pt-2 text-base font-bold text-neutral-600">
                    {hole.consensus
                      ? `공개자료 ${hole.consensus.strength === "strong" ? "복수일치" : "단일합의"} · 출처 ${hole.consensus.sources.length}곳`
                      : `참고(단일 출처) · 출처 ${hole.singleNote?.sources.length ?? 0}곳`}
                    {" · "}원문은 아래 &lsquo;원문 보기&rsquo;에서 확인
                  </p>
                )}
              </div>
            )}

            {/* 홀 정보 (펼침 고정): 티별 거리 · 원문 · 출처 · 메모 */}
            <div className="mt-3 rounded-xl bg-fairway-950/60 px-4 py-3">
              <details className="mt-2 rounded-lg bg-fairway-900 px-3 py-2">
                <summary className="cursor-pointer text-base font-bold text-emerald-100/80">
                  원문 보기
                </summary>
                {hole.tip && <p className="mt-1.5 text-base leading-relaxed">{hole.tip}</p>}
                {hole.consensus?.fairway && (
                  <p className="mt-1.5 text-base leading-relaxed">{hole.consensus.fairway}</p>
                )}
                {hole.consensus?.green && (
                  <p className="mt-1.5 text-base leading-relaxed">{hole.consensus.green}</p>
                )}
                {hole.singleNote && (
                  <p className="mt-1.5 text-base leading-relaxed text-neutral-100">
                    {hole.singleNote.text}
                  </p>
                )}
              </details>
              <div className="mt-2">
                <p className="text-lg leading-relaxed">
                  <span className="font-extrabold text-emerald-200">• 티별 거리 : </span>
                  <span className="font-bold">
                    {hole.teeOrder
                      .map(
                        (t) =>
                          `${teeLabel(t)} ${hole.tee[t] != null ? `${hole.tee[t]!.toLocaleString()}m` : "미표기"}`
                      )
                      .join(" · ")}
                  </span>
                </p>
                {hole.holeName && (
                  <p className="mt-2 text-base text-emerald-100/80">홀명: {hole.holeName}</p>
                )}
                {hole.memo && !/^[a-z0-9_]+:/.test(hole.memo) && (
                  <p className="mt-2 rounded-lg border border-neutral-500 px-3 py-2 text-base text-neutral-200">
                    메모: {hole.memo}
                  </p>
                )}
                <p className="mt-2 text-base">
                  <a
                    href={hole.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-sky-300 underline"
                  >
                    공식 가이드 페이지 열기
                  </a>{" "}
                  <span className="text-emerald-100/60">© {club.name}</span>
                </p>
              </div>

              {/* 개인 메모 (상세로 이동) */}
              <div className="mt-4 border-t-2 border-fairway-700 pt-4">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                  <NotebookPen className="h-5 w-5 text-emerald-300" aria-hidden />
                  내 메모 ({holeNo}번 홀)
                </h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="이 홀 나만의 공략 메모를 적어보세요"
                  aria-label={`${holeNo}번 홀 개인 메모`}
                  className="w-full rounded-xl border-2 border-fairway-700 bg-fairway-950 px-3 py-3 text-lg text-white placeholder:text-emerald-100/50 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={saveNote}
                  className="mt-2 w-full rounded-xl bg-emerald-300 py-3 text-xl font-extrabold text-fairway-950 hover:bg-emerald-200"
                >
                  {noteSaved ? "저장됨 ✓" : "메모 저장"}
                </button>
                <p className="mt-1 text-base text-emerald-100/70">
                  이 기기의 브라우저에만 저장됩니다.
                </p>
              </div>
            </div>
          </>
        )}

      </section>

      <footer className="mt-6 text-center text-base text-emerald-100/60">
        거리·핸디캡·해저드는 각 골프장 공식 사이트 확인 수치만 수록합니다.
        이미지 © 각 골프장 (출처: 홀별 &lsquo;원문 보기&rsquo;).
      </footer>
    </main>
  );
}
