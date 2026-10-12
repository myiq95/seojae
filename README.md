# 서재 (오프라인 독서 PWA)

txt · docx · pdf · epub · md · html 을 읽는 설치형 독서 앱입니다. 서버 없이 정적 파일만으로 동작합니다.

## GitHub Pages에 올리기
1. GitHub에서 새 저장소를 만듭니다 (예: `seojae`).
2. 이 폴더 안의 **모든 파일과 폴더**(index.html, sw.js, vendor/, fonts/, icons/ …)를 저장소 맨 위에 올립니다.
3. 저장소 **Settings → Pages → Branch: main / (root)** 를 선택하고 저장합니다.
4. 1~2분 뒤 `https://계정명.github.io/seojae/` 주소가 열립니다.
5. 휴대폰에서 그 주소를 열고 한 번 끝까지 로딩된 뒤
   - iPhone(Safari): 공유 버튼 → **홈 화면에 추가**
   - Android(Chrome): 메뉴 → **앱 설치** / **홈 화면에 추가**

처음 한 번 온라인으로 열면 글꼴과 PDF 엔진까지 기기에 저장되어, 이후에는 비행기 모드에서도 열립니다.

## 파일을 고쳐서 다시 올릴 때
`sw.js` 맨 위의 `VERSION = 'v1.0.0'` 숫자를 올려 주세요(예: `v1.0.1`).
올리지 않으면 기기가 옛 파일을 계속 보여 줄 수 있습니다.

## 데이터
서재 목록·읽던 위치·책갈피·설정은 모두 기기 안(IndexedDB, localStorage)에만 저장되며 어디로도 전송되지 않습니다.
브라우저 데이터를 지우면 함께 사라집니다.
