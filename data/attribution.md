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
| SG아름다운 골프&리조트 (충남 아산 · HILL/LAKE/ROCK) | https://www.arumdaunresort.com | 개요표 …/html/course01.asp · HILL …/course02.asp · LAKE …/course03.asp · ROCK …/course04.asp (홀별 사진 photo_hill/lake/rock{1-9}.jpg 27종 로컬 저장, 코스맵 map_* 미수집) |

## 수집 메모 (불일치 유지)

- 2026-10-27 공개자료 2차 반영 (직접 편집 — golf-data 파이프라인은 스크래치 정리로 소실되어 courses.json을 원본으로 병합):
  승격 18홀 single→strong(독립 2출처 일치 확인) = 솔라고 SOL-OUT 2·3·4 (리보플+골프야디지 2017),
  SOL-IN 1·4·5·6·7·8·9 (리보플+골프야디지 2017-08-07 2탄), 로얄링스 Queens 1·2·3·4·5·6·7·12
  (디캔터+리키마루 2023-06-11, 원문 대조 검증됨). 신규 single 2홀 = LAGO-OUT 4·5 (리보플 5분 공략).
  - LAGO 6~9번(OUT/IN)은 영상 자막 미확보로 일반 설명문만 있어 미반영(null 유지).
  - 2026-10-27 공개자료 3차 반영: 예미지 지 1·2·3·4 single→weak 승격(공식 TIP+리요 후기 일치),
    골든베이 마운틴 1·4·9 신규 weak(공식+worldtravellerjp/중앙일보 문승진, 원문 대조 검증),
    마운틴 2·6 weak→strong 승격(독립 2~3출처). M5·미코스·지 5~9는 기존 단일출처라 변경 없음.
  - 2026-10-27 중복 다이어트: ①홀 상세 상대전장에서 최장/최단 문구 삭제(브리핑에만 유지),
    ②홀 상세 '티별 거리' 전량 삭제(전장표 행과 완전중복), ③해저드 칩이 있는 홀은 캐디 브리핑의
    [해저드] 불릿 생략(칩이 키워드 커버, 티샷/그린만 표시). 티 선택 버튼(브리핑 총전장용/홀상세
    인라운딩용)과 Par/HD(탭 내비게이션용)는 용도가 달라 유지.
  SOL계 인용문의 원문 IN/OUT 표기 혼동은 파·거리·지형 일치로 홀 귀속 검증.
  - 2026-10-27 정정: SOL-IN 2·3의 골프야디지 인용이 OUT편(1탄) 문장으로 오염된 것을 확인.
    리보플 자막 직접 추출로 '좌우 OB·좌측 해저드 위험'(IN-2) 검증, 2탄(IN편) 원문 대조로
    '좌 벙커·우 해저드'(IN-2)·'좌측 해저드'(IN-3) 삭제 → '우측 티샷→레귤러온'(IN-2)·
    '우측 해저드 파3'(IN-3)으로 교체, 출처도 2탄으로 교체. strong 유지(독립 2출처).
    residual: 1탄 후반부(5~9번홀) 파 표기가 현행 공식 파와 불일치 — OUT 5~9 기존 consensus는
    추후 홀별 자막 대조 후 재검증 예정.
    - 2026-10-27 그린 4차 반영 (원문 대조 검증): 지6 single→strong 승격(리요+기통찬+혜주,
    앞경사 주의 2곳 일치·지6 원문 3곳 직접 확인), 예7·미3·미9·지8 single에 언론(ttlnews 편성희,
    원문 확인) 추가 — 포인트 상이 per single 유지. 클럽 공통 5건 추가: 예미지 지 구간
    스피드(리요)·2단 그린(혜주), 로얄링스 Queens 그린 형태(올댓)·Kings 스피드(찬찬),
    솔라고 스피드 2.5~2.6(자바루+쭘+kin1584, 3곳 일치 strong). K9·K3 G에 승파리 단일언급
    추가(K7 선례 표기). Queens 2~6·Kings 4~8 기존 entries는 원문과 일치 확인되어 변경 없음.

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
- 공식 홀 공략문구(tip)는 5개 클럽 144홀(백제 27·천안상록 27·로얄링스 36·골든베이 27·
  SG아름다운 27, 예미지 27 기적용)에 원문 그대로 verbatim 수록, tipSource는 클럽별
  공식 코스 가이드 표기. 솔라고 36홀은 공식 홀별 페이지에 공략문구 미공개(전 홀 null)로 미기록.
- SG아름다운 홀별 사진 27종(photo_hill/lake/rock{1-9}.jpg, 200·image/jpeg·개당 2MB 이하 확인)을
  `public/holes/areumnadaun/<코스>-<홀>.jpg`로 저장하고 imageUrl에 반영. 코스맵(map_*)은 미수집.
