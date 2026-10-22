# Yardage Book 데이터 안내 (README_DATA.md)

## 수록 범위

- **실제 데이터**: 7개 충남 클럽의 **클럽명/코스명/지역**만 디렉토리 정보로 수록
  (백제CC, 솔라고CC, 천안상록CC, 예미지CC, 링스CC, 골든베이CC, 아름다운CC).
  코스 하위 9홀 구성명(예: 솔라고 "라고/솔/밸리")은 공개 안내 기준의 명칭이며,
  홀별 거리·핸디캡·전략은 포함하지 않습니다.
- **샘플 데이터**: `data/courses.json` → `holes["solago:라고"]`의 **1~3번 홀**만
  `sample: true`로 표시된 예시 수치입니다. 실제 코스 데이터가 아닙니다.
- 그 외 모든 클럽/코스/홀은 데이터 없음(미입력) 상태로 표시됩니다.

## UI 표시 규칙

- 샘플 홀이면 화면에 반드시 **'샘플' 배지**를 표시합니다.
- 데이터가 없는 홀은 거리 대신 "데이터 미입력" 문구를 표시합니다.

## 실제 숫자 추가 방법

1. `data/courses.json`의 `holes`에 `"<clubId>:<코스명>"` 키를 추가합니다.
2. `_template` 항목을 복사해 홀 번호(`"1"`~`"18"`)별로 채웁니다.
3. 숫자는 스코어카드/실측 기준으로 입력하고, 검증이 끝나면 해당 홀의
   `"sample"` 값을 `false`로 변경합니다(`false` = 실측 데이터로 간주).
4. `npm run build`로 빌드가 깨지지 않는지 확인합니다.

## 필드 설명

| 필드 | 의미 |
|---|---|
| par | 홀 파(3/4/5) |
| handicap | 핸디캡(1~18) |
| teeBox | 티박스별 거리(m): champion/tour/front/senior/lady |
| hazards | 해저드 목록: type(bunker/water/ob/rough) + message |
| strategy | teeShot/approach/green 공략 메모 |
| pinTips | 핀 위치(front/middle/back)별 그린 팁 |
