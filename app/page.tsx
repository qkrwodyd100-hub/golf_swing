"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Droplets,
  Flag,
  MapPin,
  Navigation,
  NotebookPen,
  Ruler,
  Search,
  Waves,
  Mountain,
  CircleDot,
} from "lucide-react";
import raw from "@/data/courses.json";
import HoleDiagram, { type HoleDiagramData } from "@/components/HoleDiagram";

type TeeKey = "champion" | "tour" | "front" | "senior" | "lady";
type PinKey = "front" | "middle" | "back";

interface Hazard {
  type: string;
  message: string;
}
interface Hole {
  sample: boolean;
  par: number;
  handicap: number;
  teeBox: Record<TeeKey, number>;
  hazards: Hazard[];
  strategy: { teeShot: string; approach: string; green: string };
  pinTips: Record<PinKey, string>;
  imageUrl?: string;
  diagram?: HoleDiagramData;
}
interface Club {
  id: string;
  name: string;
  region: string;
  courses: string[];
}
interface Data {
  clubs: Club[];
  holes: Record<string, Record<string, Hole>>;
}

const DATA = raw as unknown as Data;
const TEE_LABELS: { key: TeeKey; label: string }[] = [
  { key: "champion", label: "챔피언" },
  { key: "tour", label: "투어" },
  { key: "front", label: "프론트" },
  { key: "senior", label: "시니어" },
  { key: "lady", label: "레이디" },
];
const PIN_LABELS: { key: PinKey; label: string }[] = [
  { key: "front", label: "앞핀" },
  { key: "middle", label: "중간핀" },
  { key: "back", label: "뒷핀" },
];

/** 홀 정보 상태: 미입력(회색) / 예시(노랑) / 실측확인(초록). 부정확한 정보는 없는 것만 못하므로, 미확인 수치는 표시하지 않는다. */
type HoleStatus = "missing" | "example" | "verified";
function holeStatus(h: Hole | undefined): HoleStatus {
  if (!h) return "missing";
  return h.sample === true ? "example" : "verified";
}

function StatusBadge({ status }: { status: HoleStatus }) {
  if (status === "verified")
    return (
      <span className="rounded-full border-2 border-emerald-300 px-3 py-0.5 text-base font-extrabold text-emerald-300">
        실측확인
      </span>
    );
  if (status === "example")
    return (
      <span className="rounded-full border-2 border-amber-300 px-3 py-0.5 text-base font-extrabold text-amber-300">
        예시
      </span>
    );
  return (
    <span className="rounded-full border-2 border-neutral-400 px-3 py-0.5 text-base font-extrabold text-neutral-300">
      미입력
    </span>
  );
}

function hazardIcon(type: string) {
  switch (type) {
    case "water":
      return <Waves className="h-5 w-5 shrink-0 text-sky-300" aria-label="워터 해저드" />;
    case "bunker":
      return <CircleDot className="h-5 w-5 shrink-0 text-amber-300" aria-label="벙커" />;
    case "ob":
      return <AlertTriangle className="h-5 w-5 shrink-0 text-red-300" aria-label="OB" />;
    case "rough":
      return <Mountain className="h-5 w-5 shrink-0 text-lime-300" aria-label="러프" />;
    default:
      return <AlertTriangle className="h-5 w-5 shrink-0 text-red-300" aria-label="해저드" />;
  }
}

export default function YardageBookPage() {
  const [query, setQuery] = useState("");
  const [clubId, setClubId] = useState(DATA.clubs[1]?.id ?? DATA.clubs[0].id);
  const [course, setCourse] = useState(DATA.clubs[1]?.courses[0] ?? DATA.clubs[0].courses[0]);
  const [holeNo, setHoleNo] = useState(1);
  const [tee, setTee] = useState<TeeKey>("tour");
  const [pin, setPin] = useState<PinKey>("middle");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgSaved, setImgSaved] = useState(false);
  const [view, setView] = useState<"diagram" | "photo">("diagram");

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
  const hole: Hole | undefined = DATA.holes[holeKey]?.[String(holeNo)];
  const status = holeStatus(hole);

  const noteKey = useMemo(
    () => `yardage-note:${clubId}:${course}:${holeNo}`,
    [clubId, course, holeNo]
  );
  const imgKey = useMemo(
    () => `yardage-img:${clubId}:${course}:${holeNo}`,
    [clubId, course, holeNo]
  );
  const photoSrc = (imgUrl || hole?.imageUrl || "").trim();
  const hasPhoto = photoSrc.length > 0;

  useEffect(() => {
    setNoteSaved(false);
    try {
      setNote(localStorage.getItem(noteKey) ?? "");
    } catch {
      setNote("");
    }
    setImgSaved(false);
    setView("diagram");
    try {
      setImgUrl(localStorage.getItem(imgKey) ?? "");
    } catch {
      setImgUrl("");
    }
  }, [noteKey, imgKey]);

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

  function saveImgUrl() {
    try {
      if (imgUrl.trim()) localStorage.setItem(imgKey, imgUrl.trim());
      else localStorage.removeItem(imgKey);
      setImgSaved(true);
      setTimeout(() => setImgSaved(false), 2000);
    } catch {
      setImgSaved(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl bg-fairway-950 px-4 pb-16 pt-6 text-white">
      {/* 헤더 */}
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fairway-600">
          <BookOpen className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">야디지북</h1>
          <p className="text-base text-emerald-100/90">충남 7개 클럽 · 홀 공략 가이드</p>
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
            placeholder="골프장·지역·코스 검색 (예: 태안, 라고)"
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
        {/* 코스(9홀 구성) 선택 */}
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

      {/* 홀 선택: 1~18 가로 스크롤 탭 */}
      <nav aria-label="홀 선택" className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => {
            const h = DATA.holes[holeKey]?.[String(n)];
            const st = holeStatus(h);
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
                  {h && h.par > 0 ? `Par ${h.par}` : "―"}
                </span>
                <span
                  className={`mt-1 h-2 w-2 rounded-full ${
                    st === "verified"
                      ? "bg-emerald-400"
                      : st === "example"
                        ? "bg-amber-300"
                        : "bg-neutral-500"
                  }`}
                  title={st === "verified" ? "실측확인" : st === "example" ? "예시" : "미입력"}
                  aria-label={st === "verified" ? "실측확인" : st === "example" ? "예시" : "미입력"}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* 홀 상세 */}
      <section aria-label="홀 상세 정보" className="rounded-2xl bg-fairway-900 p-5 shadow">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-extrabold">
            {club.name} {course} {holeNo}번 홀
          </h2>
          <StatusBadge status={status} />
          {hole && (
            <>
              <span className="rounded-full bg-emerald-300 px-3 py-1 text-base font-extrabold text-fairway-950">
                {hole.par > 0 ? `Par ${hole.par}` : "Par 미입력"}
              </span>
              <span className="rounded-full bg-fairway-700 px-3 py-1 text-base font-bold text-emerald-100">
                {hole.handicap > 0 ? `핸디캡 ${hole.handicap}` : "핸디캡 미입력"}
              </span>
            </>
          )}
        </div>
        {status === "example" && (
          <p className="mb-3 text-base text-amber-200">
            예시 상태의 홀입니다. 거리·전략 수치는 실측이 아니며, 미입력 항목은 표시하지
            않습니다.
          </p>
        )}
        {status === "verified" && (
          <p className="mb-3 text-base text-emerald-200">
            실측확인된 홀입니다(스코어카드·공식 야디지북 근거).
          </p>
        )}

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
            {/* 티박스 거리 선택 */}
            <div className="mb-4">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                <Ruler className="h-5 w-5 text-emerald-300" aria-hidden />
                티박스 거리
              </h3>
              <div className="flex flex-wrap gap-2" role="group" aria-label="티박스 선택">
                {TEE_LABELS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTee(t.key)}
                    aria-pressed={tee === t.key}
                    className={`rounded-full px-4 py-2 text-lg font-bold ${
                      tee === t.key
                        ? "bg-emerald-300 text-fairway-950"
                        : "bg-fairway-700 text-white hover:bg-fairway-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-2xl font-extrabold text-emerald-200" aria-live="polite">
                <Navigation className="mr-1 inline h-6 w-6" aria-hidden />
                {hole.teeBox[tee] > 0 ? (
                  <>
                    {hole.teeBox[tee].toLocaleString()} m
                    <span className="ml-2 text-base font-normal text-emerald-100/80">
                      {TEE_LABELS.find((t) => t.key === tee)?.label} 티 기준
                    </span>
                  </>
                ) : (
                  <span className="text-xl text-neutral-300">
                    거리 미입력
                    <span className="ml-2 text-base font-normal text-emerald-100/80">
                      {TEE_LABELS.find((t) => t.key === tee)?.label} 티 기준
                    </span>
                  </span>
                )}
              </p>
            </div>

            {/* 홀 시각 자료: 개략도 / 실사진 */}
            <div className="mb-4">
              <div className="mb-2 flex gap-2" role="group" aria-label="시각 자료 선택">
                <button
                  type="button"
                  onClick={() => setView("diagram")}
                  aria-pressed={view === "diagram"}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-lg font-bold ${
                    view === "diagram"
                      ? "bg-emerald-300 text-fairway-950"
                      : "bg-fairway-700 text-white hover:bg-fairway-600"
                  }`}
                >
                  개략도
                </button>
                <button
                  type="button"
                  onClick={() => setView("photo")}
                  aria-pressed={view === "photo"}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-lg font-bold ${
                    view === "photo"
                      ? "bg-emerald-300 text-fairway-950"
                      : "bg-fairway-700 text-white hover:bg-fairway-600"
                  }`}
                >
                  실사진
                </button>
              </div>
              {view === "diagram" ? (
                <HoleDiagram diagram={hole.diagram} pin={pin} holeNo={holeNo} />
              ) : hasPhoto ? (
                <figure className="overflow-hidden rounded-xl border-2 border-black bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoSrc}
                    alt={`${club.name} ${course} ${holeNo}번 홀 실사진`}
                    className="block h-auto w-full"
                    loading="lazy"
                  />
                  <figcaption className="bg-white px-3 py-2 text-sm font-bold text-black">
                    홀 실사진 · 위치 예시가 아닌 실제 촬영 이미지입니다
                    {imgUrl.trim() ? "(내가 등록한 사진)" : "(공식 이미지)"}
                  </figcaption>
                </figure>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-neutral-500 bg-fairway-950/60 p-5 text-center">
                  <p className="text-xl font-bold text-neutral-200">실측 사진 없음</p>
                  <p className="mt-1 text-base text-emerald-100/80">
                    아래 &lsquo;내 메모&rsquo;에서 이 홀 실사진 URL을 등록하면 표시됩니다.
                  </p>
                </div>
              )}
            </div>

            {/* 해저드 알림 */}
            <div className="mb-4">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                <AlertTriangle className="h-5 w-5 text-amber-300" aria-hidden />
                해저드 주의
              </h3>
              {hole.hazards.length === 0 ? (
                <p className="rounded-xl border-2 border-neutral-500 bg-fairway-950/60 px-3 py-2.5 text-lg text-neutral-300">
                  해저드 정보 미확인 — 실측 확인 후 표시됩니다.
                </p>
              ) : (
                <ul className="space-y-2">
                  {hole.hazards.map((hz, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-xl border-2 border-amber-300/50 bg-fairway-950/60 px-3 py-2.5 text-lg"
                    >
                      {hazardIcon(hz.type)}
                      <span>{hz.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 공략 카드 */}
            <div className="mb-4 grid gap-2">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Flag className="h-5 w-5 text-emerald-300" aria-hidden />
                홀 공략
              </h3>
              {[
                { title: "티샷", body: hole.strategy.teeShot },
                { title: "어프로치", body: hole.strategy.approach },
                { title: "그린", body: hole.strategy.green },
              ].map((s) => (
                <article key={s.title} className="rounded-xl bg-fairway-950/60 px-4 py-3">
                  <h4 className="text-lg font-extrabold text-emerald-200">{s.title}</h4>
                  <p className={`text-lg ${s.body.trim() ? "" : "text-neutral-400"}`}>
                    {s.body.trim() ? s.body : "미입력 — 실측 확인 후 표시됩니다."}
                  </p>
                </article>
              ))}
            </div>

            {/* 핀 위치 선택 */}
            <div className="mb-2">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                <Droplets className="h-5 w-5 text-sky-300" aria-hidden />
                핀 위치별 그린 팁
              </h3>
              <div className="flex gap-2" role="group" aria-label="핀 위치 선택">
                {PIN_LABELS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPin(p.key)}
                    aria-pressed={pin === p.key}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-lg font-bold ${
                      pin === p.key
                        ? "bg-sky-300 text-fairway-950"
                        : "bg-fairway-700 text-white hover:bg-fairway-600"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 rounded-xl bg-sky-950/60 px-4 py-3 text-lg" aria-live="polite">
                {hole.pinTips[pin].trim()
                  ? hole.pinTips[pin]
                  : "미입력 — 실측 확인 후 표시됩니다."}
              </p>
            </div>
          </>
        )}

        {/* 개인 메모 */}
        <div className="mt-5 border-t-2 border-fairway-700 pt-4">
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
          {/* 이 홀 실사진 URL (개인 저장) */}
          <label
            htmlFor="hole-photo-url"
            className="mt-4 mb-2 block text-lg font-bold"
          >
            이 홀 실사진 URL
          </label>
          <input
            id="hole-photo-url"
            type="url"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="https://… (직접 촬영 후 업로드한 이미지 주소)"
            inputMode="url"
            className="w-full rounded-xl border-2 border-fairway-700 bg-fairway-950 px-3 py-3 text-lg text-white placeholder:text-emerald-100/50 focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={saveImgUrl}
            className="mt-2 w-full rounded-xl border-2 border-emerald-300 py-2.5 text-lg font-extrabold text-emerald-200 hover:bg-fairway-700"
          >
            {imgSaved ? "사진 저장됨 ✓" : "실사진 저장"}
          </button>
          <p className="mt-1 text-base text-emerald-100/70">
            이 기기의 브라우저에만 저장되며, 위 &lsquo;실사진&rsquo; 탭에 표시됩니다.
            비우면 등록된 사진이 삭제됩니다.
          </p>
        </div>
      </section>

      <footer className="mt-6 text-center text-base text-emerald-100/60">
        클럽·코스명은 안내용이며, 거리/전략 수치는 &apos;실측확인&apos; 표시가 있는
        홀만 실측 데이터입니다. &apos;예시&apos;·&apos;미입력&apos; 홀의 빈 항목은
        측정이 아닌 미확인 표시입니다.
      </footer>
    </main>
  );
}
