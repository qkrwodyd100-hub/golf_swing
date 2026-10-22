export type Dogleg = "straight" | "left" | "right";
export type PinKey = "front" | "middle" | "back";

export interface HazardSpot {
  type: "bunker" | "water" | "ob" | "rough";
  /** 0~100 상대 좌표 (0=좌측/그린쪽, 100=우측/티박스쪽). 미확인 홀에서는 렌더하지 않음. */
  x: number;
  y: number;
  label?: string;
}

export interface HoleDiagramData {
  dogleg: Dogleg;
  hazardSpots: HazardSpot[];
  /** true=실측 확인된 배치, false/미지정=미확인 개념도(해저드 위치를 그리지 않음) */
  confirmed?: boolean;
}

interface Props {
  diagram?: HoleDiagramData | null;
  pin: PinKey;
  holeNo?: number;
  /** 선택 티의 홀 전장(m). IP 밴드 상대 위치 계산용. */
  teeDist?: number | null;
  par?: number | null;
  /** 선택 티 표시명 (예: "화이트 350m"). IP 밴드 근거 라벨용. */
  teeName?: string;
}

const W = 200;
const H = 300;
const TOP = 22;
const BOTTOM = 272;

function fairwayPoints(dogleg: Dogleg, confirmed: boolean): Array<[number, number]> {
  if (!confirmed) return [[100, 268], [100, 40]]; // 미확인: 중립 직선 개념도만
  if (dogleg === "left") return [[100, 268], [100, 160], [52, 40]];
  if (dogleg === "right") return [[100, 268], [100, 160], [148, 40]];
  return [[100, 268], [100, 40]];
}

function pathFrom(pts: Array<[number, number]>): string {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
}

/**
 * 홀 개념도 SVG. 미확인 홀은 티→그린 개념(직선 회랑)만 그리고
 * 해저드 위치는一切 그리지 않고 '미확인'으로 표시한다.
 */
export default function HoleDiagram({ diagram, pin, holeNo, teeDist, par, teeName }: Props) {
  const confirmed = diagram?.confirmed === true;
  const dogleg: Dogleg = confirmed ? (diagram?.dogleg ?? "straight") : "straight";
  const spots: HazardSpot[] = confirmed ? (diagram?.hazardSpots ?? []) : [];
  const pts = fairwayPoints(dogleg, confirmed);
  const d = pathFrom(pts);
  const [gx, gy] = pts[pts.length - 1];

  // IP(낙구 지점) 밴드: 파4·파5 + 티 거리 확인 시에만, 티→그린 상대 위치 예시로 표시.
  // 절대 좌표가 아니라 선택 티 전장 대비 상대 비율이므로 픽셀 정확을 주장하지 않음.
  const teeY = pts[0][1];
  const greenY = pts[pts.length - 1][1];
  const showIpBand =
    par !== 4 && par !== 5 ? false : typeof teeDist === "number" && teeDist > 0;
  const ipFrac = par === 5 ? 0.38 : 0.55; // 티에서 그린 방향 상대 비율(예시)
  const ipY = teeY - ipFrac * (teeY - greenY);
  const ipRefM =
    typeof teeDist === "number" && teeDist > 0 ? Math.round((teeDist * ipFrac) / 10) * 10 : null;

  // 핀 위치: back=그린 상단(홀 끝 방향), front=티 방향
  const pinOffset = pin === "back" ? -12 : pin === "front" ? 12 : 0;
  const pinY = gy + pinOffset;

  const doglegLabel = !confirmed
    ? "홀 윤곽 미확인"
    : dogleg === "left"
      ? "좌 도그렉"
      : dogleg === "right"
        ? "우 도그렉"
        : "직선 홀";

  return (
    <div className="overflow-hidden rounded-xl border-2 border-black bg-white text-black">
      <div className="flex flex-wrap items-center gap-2 bg-yellow-300 px-3 py-2">
        <span className="rounded-md bg-black px-2 py-0.5 text-base font-extrabold text-yellow-300">
          개략도(예시)
        </span>
        <span className="text-sm font-bold text-black">
          위치 예시이며 실제와 다름
          {typeof holeNo === "number" ? ` · ${holeNo}번 홀 ${doglegLabel}` : ` · ${doglegLabel}`}
        </span>
      </div>
      {!confirmed && (
        <p className="border-b-2 border-black bg-neutral-200 px-3 py-2 text-sm font-bold text-neutral-800">
          홀 윤곽·해저드 위치 미확인 — 티/그린/핀 개념만 표시하며, 해저드는 그리지 않았습니다.
        </p>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full bg-white"
        role="img"
        aria-label={`홀 개념도 (${doglegLabel}), 핀 위치 ${pin}`}
      >
        {/* 외곽 */}
        <rect x="2" y="2" width={W - 4} height={H - 4} rx="10" fill="#DCFCE7" stroke="#000" strokeWidth="3" />
        {/* 페어웨이 개념 회랑 */}
        <path d={d} fill="none" stroke="#000" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <path d={d} fill="none" stroke="#16A34A" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
        {/* 도그렉 화살표 (실측 확인된 경우만) */}
        {confirmed && dogleg !== "straight" && (
          <text
            x={dogleg === "left" ? 78 : 122}
            y={118}
            textAnchor="middle"
            fontSize="22"
            fontWeight="900"
            fill="#000"
          >
            {dogleg === "left" ? "◀" : "▶"}
          </text>
        )}
        {/* 티박스 */}
        <g>
          <rect x="82" y="262" width="36" height="18" rx="3" fill="#000" />
          <text x="100" y="276" textAnchor="middle" fontSize="12" fontWeight="900" fill="#fff">
            TEE
          </text>
        </g>
        {/* IP(낙구 지점) 밴드: 선택 티 거리 기반 상대 위치 예시 */}
        {showIpBand && (
          <g>
            <rect
              x="72"
              y={ipY - 14}
              width="56"
              height="28"
              rx="8"
              fill="#FDE68A"
              fillOpacity="0.55"
              stroke="#000"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <text x="100" y={ipY + 5} textAnchor="middle" fontSize="13" fontWeight="900" fill="#000">
              IP 예시
            </text>
          </g>
        )}
        {/* 그린 */}
        <ellipse cx={gx} cy={gy} rx="26" ry="20" fill="#22C55E" stroke="#000" strokeWidth="3.5" />
        {/* 핀 위치 */}
        <line x1={gx} y1={pinY} x2={gx} y2={pinY - 16} stroke="#000" strokeWidth="3" />
        <circle cx={gx} cy={pinY} r="6.5" fill="#DC2626" stroke="#fff" strokeWidth="2.5" />
        <circle cx={gx} cy={pinY} r="6.5" fill="none" stroke="#000" strokeWidth="1" />
        {/* 해저드 (실측 확인된 위치만) */}
        {spots.map((s, i) => {
          const sx = 12 + (Math.min(100, Math.max(0, s.x)) / 100) * (W - 24);
          const sy = TOP + (Math.min(100, Math.max(0, s.y)) / 100) * (BOTTOM - TOP);
          const mark = s.type === "bunker" ? "B" : s.type === "water" ? "W" : s.type === "ob" ? "OB" : "R";
          const fill = s.type === "water" ? "#0284C7" : s.type === "bunker" ? "#FBBF24" : s.type === "ob" ? "#DC2626" : "#65A30D";
          const tfill = s.type === "water" || s.type === "ob" ? "#fff" : "#000";
          return (
            <g key={i}>
              <circle cx={sx} cy={sy} r={s.type === "ob" ? 12 : 10} fill={fill} stroke="#000" strokeWidth="2.5" />
              <text
                x={sx}
                y={sy + (s.type === "ob" ? 3.5 : 4.5)}
                textAnchor="middle"
                fontSize={s.type === "ob" ? 8 : 11}
                fontWeight="900"
                fill={tfill}
              >
                {mark}
              </text>
            </g>
          );
        })}
        {/* 미확인 해저드 안내 */}
        {!confirmed && (
          <g>
            <rect x="42" y="140" width="116" height="26" rx="6" fill="#fff" stroke="#000" strokeWidth="2.5" />
            <text x="100" y="158" textAnchor="middle" fontSize="13" fontWeight="900" fill="#000">
              해저드 위치 미확인
            </text>
          </g>
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-black bg-white px-3 py-2 text-sm font-bold text-black">
        {confirmed ? (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border border-black bg-[#FBBF24]" /> 벙커(B)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border border-black bg-[#0284C7]" /> 워터(W)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border border-black bg-[#DC2626]" /> OB
            </span>
          </>
        ) : (
          <span>해저드 위치 미확인 — 실측 확인 후 표시됩니다.</span>
        )}
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full border border-black bg-[#DC2626]" /> 핀
        </span>
        {showIpBand && (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border border-dashed border-black bg-[#FDE68A]" />{" "}
            IP 위치 예시
            {teeName || ipRefM != null ? (
              <span className="font-normal">
                ({[teeName, ipRefM != null ? `티 기준 약 ${ipRefM}m` : null].filter(Boolean).join(" · ")} — 상대
                위치이며 실제와 다름)
              </span>
            ) : (
              <span className="font-normal">(상대 위치이며 실제와 다름)</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
