# Yardage Book 데이터 안내 (README_DATA.md)

## 핵심 원칙

- 거리·핸디캡·해저드는 **공식 사이트 확인 수치·팩트만** 수록한다. 창작 공략문구 금지.
- 공식 미공개 항목은 `null`로 두고, UI는 '미공개'·'공식 기록 없음'으로 표시한다.
- 불일치(오타 의심 등)는 값을 바로잡되, 사유를 `memo`와 `data/attribution.md`에 남긴다.

## 수록 범위 (207홀, 전 홀 공식확인)

| 클럽 | 코스 | 홀 수 |
|---|---|---|
| 백제컨트리클럽 (충남 부여) | 사비/웅진/한성 | 27 |
| 솔라고 컨트리클럽 (충남 태안) | SOL-IN/SOL-OUT/LAGO-IN/OUT | 36 |
| 천안상록골프장(Public) (충남 천안) | 남/중/동 | 27 |
| 예미지컨트리클럽 (충남 청양) | 예/미/지 | 27 |
| 로얄링스 컨트리클럽 (충남 태안) | Queens/Kings | 36 |
| 골든베이 골프&리조트 (충남 태안) | 마운틴/오션/밸리 | 27 |
| SG아름다운 골프&리조트 (충남 아산) | HILL/LAKE/ROCK | 27 |

## 스키마 (`data/courses.json`)

- `clubs[]`: `{id, name, region, courses[]}` — 정정 적용된 공식 명칭.
- `holes["<clubId>:<코스>"]["<홀번호>"]`:
  `{par, handicap|null, tee{...}(null값 허용), teeOrder[], hazards[]|null,
    verified, sourceUrl, imageUrl(/holes/... 로컬)|null, memo|null, holeName?}`
- `meta`: `{totalHoles, verified, unverified}` 집계.
- 구 스키마 잔재(`sample`, `_template`, `strategy`, `pinTips`, `teeBox`,
  `diagram.confirmed`)는 제거됨.

## 홀 정보 상태 (UI 표시 규칙)

| 상태 | 뱃지 | 의미 |
|---|---|---|
| 공식확인 | 초록 | par·티거리가 공식 확인됨 (`verified: true`). 핸디캡·해저드 null은 공식 미공개 표시 |
| 미입력 | 회색 | 홀 데이터 없음 |

- 홀 선택 탭은 실제 홀 수만큼 렌더 (9홀 코스는 9개, Queens/Kings는 18개).
- 사진이 있는 홀은 실사진 탭이 기본 (캡션에 © 클럽명·출처 링크 표기), 없으면 개략도.
- 홀 가이드 이미지: `public/holes/<clubId>/<코스>-<홀>.jpg` (개당 2MB 초과 제외).
  원격 URL이 없거나(예미지·SG아름다운 54홀) 다운로드 실패 시 `imageUrl: null` + 사유 기록.
- 출처·수집 메모: `data/attribution.md`.

## 데이터 갱신 방법

1. `/home/jinha/.hermes/cache/scratch/golf-data/*.json` 수집 팩트를 갱신한다.
2. `/home/jinha/.hermes/cache/scratch/build-courses.py`로 `data/courses.json` 재생성
   (이미지 다운로드 포함).
3. `npm run build`로 빌드 확인. 커밋·푸시는 하지 않는다.
