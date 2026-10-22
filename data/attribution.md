# 이미지·데이터 출처 (공식 사이트)

홀 가이드 이미지는 각 골프장 공식 사이트의 코스 안내 페이지에서 수집한 것으로,
저작권은 각 골프장에 있습니다. 본 앱은 비상업적 야디지북 용도로 축소 없이 그대로
보여주며, 각 홀 화면에 근거 URL(공식 가이드 페이지)을 함께 표기합니다.
`public/holes/` 로컬 사본은 핫링크 부하 방지용이며, 원본 권리자의 요청이 있으면
즉시 삭제·대체합니다.

| 클럽 | 공식 홈페이지 | 근거 페이지 |
|---|---|---|
| 백제컨트리클럽 (충남 부여 · 사비/웅진/한성) | https://www.baekjecc.com | 사비 https://www.baekjecc.com/pagesite/course/one/hole01.asp ~ hole09.asp · 웅진 …/two/… · 한성 …/three/… |
| 솔라고 컨트리클럽 (충남 태안 · SOL-IN/OUT, LAGO-IN/OUT) | https://sollago.co.kr | 총괄표 https://sollago.co.kr/pagesite/course/intro.asp · 홀별 https://sollago.co.kr/pagesite/course/one/hole01_1.asp ~ /two/hole18.asp |
| 천안상록골프장(Public) (충남 천안 · 남/중/동) | https://www.sangnokresort.co.kr | 소개 https://www.sangnokresort.co.kr/M040101 · 공략도 https://www.sangnokresort.co.kr/M040602 |
| 예미지컨트리클럽 (충남 청양 · 예/미/지) | https://www.yemizicc.co.kr | 예 https://www.yemizicc.co.kr/course/course01 · 미 …/course02 · 지 …/course03 · 스코어카드 …/course/intro (홀별 이미지 미공개 — 개략도 표시) |
| 로얄링스 컨트리클럽 (충남 태안 · Queens/Kings 각 18홀) | https://royallinks.co.kr/ | 소개·스코어카드 https://royallinks.co.kr/course/courseIntro.asp · Queens …/course01.asp ~ course18.asp · Kings …/course19.asp ~ course36.asp |
| 골든베이 골프&리조트 (충남 태안 · 마운틴/오션/밸리) | https://www.goldenbay.kr/ | 마운틴 https://www.goldenbay.kr/course/mountain.asp · 오션 …/ocean.asp · 밸리 …/valley.asp |
| SG아름다운 골프&리조트 (충남 아산 · HILL/LAKE/ROCK) | https://www.arumdaunresort.com | 개요표 …/html/course01.asp · HILL …/course02.asp · LAKE …/course03.asp · ROCK …/course04.asp (홀별 이미지 미공개 — 개략도 표시) |

## 수집 메모 (불일치 유지)

- 솔라고 SOL-IN 4번 YELLOW: 홀별 페이지 317m은 WHITE 중복 오기로 보고 총괄표 285m 채택.
  LAGO-OUT 1번 WHITE: 홀별 페이지 407m은 YELLOW(442m)보다 짧아 오기로 보고 총괄표 470m 채택.
- 예미지 미 3번: 홀상세 PAR 4 표기와 전체 코스표 PAR 3 불일치 → 코스표 값 채택.
  미 5번: 홀상세 티별 거리가 4번홀 값과 동일하게 오기재 → 전체 코스표 값 채택.
- 골든베이 오션 5번: 골드티 433m는 거리 흐름상 오타로 보고 앱 노출에서 제외(원문 기록 유지).
  마운틴 8번: 골드 286m > 화이트 285m 표기는 오타 가능이나 원문 그대로 기록.
  오션 9번: 홀 표기 PAR 5이나 본문 첫 문장이 PAR 4로 서술하는 불일치 존재 → 홀见地 표기 채택.
  오션 전 홀: 공식 가이드에 HDCP 미표기 → 핸디캡 null.
- 백제 웅진 9번: 헤더 표기 400m이나 티 라벨 최대 375m → 라벨값 기록.
  백제 웅진 7번·한성 8번: 공식 홀 안내에 '핸디캡 1번' 명시된 2개 홀만 핸디캡 기록, 나머지 null.
  (GolfPass 스코어카드 핸디캡은 공식과 불일치하여 미채택.)
- 천안상록 중 7·8번: 수집 시점 imageShow.do가 일시적으로 오류 페이지를 반환했으나
  재시도 시 정상 이미지(200, image/png) 확인되어 로컬 저장함.
- 예미지·SG아름다운: 공식 사이트에 홀별 핸디캡표/홀 가이드 이미지가 없어 해당 항목 null
  (예미지는 핸디캡·해저드 방향 공식 확인됨, SG아름다운은 락 3번=HDCP 2번·락 7번=HDCP 1번만 본문 언급).
- 창작 공략문구(티샷/어프로치/그린 팁)는 수집·수록하지 않음. 해저드 항목은 공식 설명에
  명시된 팩트 키워드만 기록, 없으면 null.
