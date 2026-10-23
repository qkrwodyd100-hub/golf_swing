"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Flag,
  MapPin,
  Navigation,
  NotebookPen,
  Ruler,
  Search,
} from "lucide-react";
import raw from "@/data/courses.json";
import HoleDiagram, { type HoleDiagramData } from "@/components/HoleDiagram";

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
  const [pin, setPin] = useState<"front" | "middle" | "back">("middle");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [view, setView] = useState<"photo" | "diagram">("diagram");

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

  // 사진 있으면 실사진 기본, 없으면 개략도
  useEffect(() => {
    setView(hole?.imageUrl ? "photo" : "diagram");
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
  const bullets = useMemo(() => (hole ? buildBullets(hole) : []), [hole]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl bg-fairway-950 px-4 pb-16 pt-6 text-white">
      {/* 헤더 */}
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fairway-600">
          <BookOpen className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">야디지북</h1>
          <p className="text-base text-emerald-100/90">
            7개 클럽 · {DATA.meta.totalHoles}홀 공식확인
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
        {/* 클럽 단위 공통 의견 (로얄링스·예미지) */}
        {club.courseLevelConsensus && club.courseLevelConsensus.length > 0 && (
          <div className="mt-3 rounded-xl border border-sky-300/50 bg-fairway-950/60 px-4 py-3">
            <h3 className="text-lg font-extrabold text-sky-200">
              클럽 공통 의견 <span className="text-sm font-bold text-sky-200/70">({club.name})</span>
            </h3>
            <ul className="mt-1.5 space-y-1.5">
              {club.courseLevelConsensus.map((cc, i) => (
                <li key={i} className="text-base leading-snug text-white">
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

      {/* 홀 선택: 실제 홀 수만큼 탭 (9홀 코스는 9개) */}
      <nav aria-label="홀 선택" className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
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

            {/* 티 선택 (콤팩트) */}
            <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="티박스 선택">
              {hole.teeOrder.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTee(t)}
                  aria-pressed={tee === t}
                  className={`rounded-full px-3 py-1.5 text-base font-bold ${
                    tee === t
                      ? "bg-emerald-300 text-fairway-950"
                      : "bg-fairway-700 text-white hover:bg-fairway-600"
                  }`}
                >
                  {teeLabel(t)}
                </button>
              ))}
            </div>

            {/* 히어로: 사진(기본) / 개략도 + 오버레이 뱃지 */}
            {hole.imageUrl && view === "photo" ? (
              <figure className="relative overflow-hidden rounded-xl border-2 border-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hole.imageUrl}
                  alt={`${club.name} ${course} ${holeNo}번 홀 공식 가이드 이미지`}
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
                <figcaption className="bg-white px-3 py-1.5 text-xs font-bold text-black">
                  공식 가이드 이미지 © {club.name} (원문 링크는 &lsquo;상세 보기&rsquo;)
                </figcaption>
              </figure>
            ) : (
              <div>
                <HoleDiagram
                  diagram={null}
                  pin={pin}
                  holeNo={holeNo}
                  par={hole.par}
                  teeDist={teeDist}
                  teeName={`${teeLabel(tee)} ${teeDist != null ? `${teeDist.toLocaleString()}m` : "미표기"}`}
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-emerald-300 px-3 py-1 text-lg font-extrabold text-fairway-950">
                    {holeNo}H · Par {hole.par}
                  </span>
                  <span className="rounded-full bg-fairway-700 px-3 py-1 text-base font-bold text-emerald-100">
                    HD {hole.handicap ?? "미공개"}
                  </span>
                  <span className="rounded-full bg-fairway-700 px-3 py-1 text-base font-bold text-emerald-100">
                    <Navigation className="mr-1 inline h-4 w-4" aria-hidden />
                    {teeLabel(tee)} {teeDist != null ? `${teeDist.toLocaleString()}m` : "미표기"}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-emerald-100/70">
                  공식 홀 이미지가 없어 개략도로 표시합니다.
                </p>
              </div>
            )}

            {/* 시각 자료 전환 (사진 있을 때만) */}
            {hole.imageUrl && (
              <div className="mb-1 mt-3 flex gap-2" role="group" aria-label="시각 자료 선택">
                <button
                  type="button"
                  onClick={() => setView("photo")}
                  aria-pressed={view === "photo"}
                  className={`flex-1 rounded-xl px-3 py-2 text-base font-bold ${
                    view === "photo"
                      ? "bg-emerald-300 text-fairway-950"
                      : "bg-fairway-700 text-white hover:bg-fairway-600"
                  }`}
                >
                  실사진
                </button>
                <button
                  type="button"
                  onClick={() => setView("diagram")}
                  aria-pressed={view === "diagram"}
                  className={`flex-1 rounded-xl px-3 py-2 text-base font-bold ${
                    view === "diagram"
                      ? "bg-emerald-300 text-fairway-950"
                      : "bg-fairway-700 text-white hover:bg-fairway-600"
                  }`}
                >
                  개략도
                </button>
              </div>
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
              ) : (
                <p className="text-base text-neutral-300">
                  해저드 공식 기록 없음 — 공식 사이트에 해저드 설명이 없습니다.
                </p>
              )}
            </div>

            {/* 공략 포인트: 원문 부분문자열 불릿 (원문·출처는 상세 보기에 보존) */}
            {bullets.length > 0 && (
              <div className="mt-2.5 rounded-xl border border-emerald-300/50 bg-fairway-950/60 px-3 py-2.5">
                <h3 className="mb-1 text-lg font-extrabold text-emerald-200">
                  공략 포인트
                </h3>
                <ul className="space-y-1">
                  {bullets.map((b, i) => (
                    <li key={i} className="text-lg font-bold leading-snug">
                      · {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 참고 한 줄 (단일 출처 — 원문·출처는 상세 보기) */}
            {hole.singleNote && (
              <p className="mt-2.5 truncate text-base text-neutral-200">
                <span className="font-extrabold text-neutral-100">참고 · </span>
                {hole.singleNote.text}
              </p>
            )}

            {/* 상세 접기식: 공략 원문 · 티별 거리 · 출처 · 메모 보존 */}
            <details className="mt-3 rounded-xl bg-fairway-950/60 px-4 py-3">
              <summary className="cursor-pointer text-lg font-extrabold text-emerald-200">
                상세 보기 (공략 원문 · 티별 거리 · 출처 · 메모)
              </summary>
              {/* 공략 원문 (공식 문구 그대로, 출처 표기 유지) */}
              {hole.tip && (
                <blockquote className="mt-2 rounded-xl border-l-4 border-amber-300 bg-fairway-900 px-3 py-2">
                  <p className="text-base leading-snug">{hole.tip}</p>
                  <cite className="mt-1 block text-sm font-bold not-italic text-emerald-100/70">
                    공식 공략 TIP © {hole.tipSource ?? club.name}
                  </cite>
                </blockquote>
              )}
              {hole.consensus && (
                <div className="mt-2 rounded-xl border border-emerald-300/50 bg-fairway-900 px-3 py-2.5">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-emerald-200">
                      공개자료 공통 의견 원문
                    </h3>
                    {hole.consensus.strength === "strong" ? (
                      <span className="rounded-full bg-emerald-300 px-2.5 py-0.5 text-sm font-extrabold text-fairway-950">
                        복수 일치
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-300 px-2.5 py-0.5 text-sm font-extrabold text-amber-200">
                        약한 일치
                      </span>
                    )}
                    <span className="text-sm font-bold text-emerald-100/60">
                      출처 {hole.consensus.sources.length}곳
                    </span>
                  </div>
                  {hole.consensus.fairway && (
                    <p className="text-base leading-snug">
                      <span className="font-bold text-emerald-300">노릴 곳 · </span>
                      {hole.consensus.fairway}
                    </p>
                  )}
                  {hole.consensus.green && (
                    <p className="mt-1 text-base leading-snug">
                      <span className="font-bold text-emerald-300">그린 · </span>
                      {hole.consensus.green}
                    </p>
                  )}
                  {hole.consensus.note && (
                    <p className="mt-1 text-base text-emerald-100/70">
                      {hole.consensus.note}
                    </p>
                  )}
                  <ul className="mt-1.5 space-y-1.5">
                    {hole.consensus.sources.map((s, i) => (
                      <li key={i} className="text-base leading-snug text-emerald-100/90">
                        · {[s.author, s.title].filter(Boolean).join(" — ")}
                        {s.date ? ` (${s.date})` : ""}
                        {s.url && (
                          <>
                            {" "}
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-sky-300 underline"
                            >
                              원문
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hole.singleNote && (
                <div className="mt-2 rounded-xl border border-neutral-500 bg-fairway-900 px-3 py-2.5">
                  <h3 className="mb-1 text-base font-extrabold text-neutral-200">
                    참고 원문
                    <span className="ml-1.5 rounded-full border border-neutral-400 px-2.5 py-0.5 align-middle text-sm font-extrabold text-neutral-300">
                      단일 출처
                    </span>
                  </h3>
                  <p className="text-base leading-snug text-neutral-100">
                    {hole.singleNote.text}
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {hole.singleNote.sources.map((s, i) => (
                      <li key={i} className="text-base leading-snug text-emerald-100/90">
                        · {[s.author, s.title].filter(Boolean).join(" — ")}
                        {s.date ? ` (${s.date})` : ""}
                        {s.url && (
                          <>
                            {" "}
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-sky-300 underline"
                            >
                              원문
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-2">
                <h3 className="mb-1.5 flex items-center gap-2 text-base font-bold">
                  <Ruler className="h-4 w-4 text-emerald-300" aria-hidden />
                  티별 거리
                </h3>
                <dl className="grid grid-cols-2 gap-1.5">
                  {hole.teeOrder.map((t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between rounded-lg bg-fairway-900 px-3 py-1.5 text-base"
                    >
                      <dt className="font-bold text-emerald-100/80">{teeLabel(t)}</dt>
                      <dd className="font-extrabold">
                        {hole.tee[t] != null ? `${hole.tee[t]!.toLocaleString()}m` : "미표기"}
                      </dd>
                    </div>
                  ))}
                </dl>
                {hole.holeName && (
                  <p className="mt-2 text-base text-emerald-100/80">홀명: {hole.holeName}</p>
                )}
                {hole.memo && (
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
            </details>
          </>
        )}

      </section>

      <footer className="mt-6 text-center text-base text-emerald-100/60">
        거리·핸디캡·해저드는 각 골프장 공식 사이트 확인 수치만 수록합니다.
        이미지 © 각 골프장 (출처: 홀별 &lsquo;상세 보기&rsquo;).
      </footer>
    </main>
  );
}
