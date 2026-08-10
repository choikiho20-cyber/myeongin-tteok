# 이연순 명인떡 홈페이지 — 인수인계 (2026-08-11)

## 지금 바로 할 일 (중단 지점)

가비아 DNS 관리툴에서 레코드 5개를 입력하고 **`저장` 버튼을 누르기 직전**이다.

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   choikiho20-cyber.github.io.     ← 끝의 점 필수
```

저장 후 이어서:

1. 전파 확인 — `nslookup myeongin-tteok.com` 또는 RDAP 조회
2. GitHub 저장소 Settings → Pages → Custom domain 에 `myeongin-tteok.com` 입력
3. Enforce HTTPS 체크 (인증서 자동 발급, 최대 24시간)
4. 저장소 루트에 `CNAME` 파일 생성 (내용: `myeongin-tteok.com`)
5. 사이트 내 주소 일괄 교체 (아래 "주소가 박힌 곳" 참고)
6. `sitemap.xml` · `robots.txt` 재생성
7. `assets/js/site-config.js` 의 `domain` 값 확인

---

## 기본 정보

| 항목 | 값 |
|---|---|
| 저장소 | `choikiho20-cyber/myeongin-tteok` |
| 브랜치 | **`master`** (main 아님 — 연동 시 자주 실수) |
| Pages 소스 | **저장소 루트 `/`** (docs/ 아님 — 아래 이유 참고) |
| 현재 주소 | https://choikiho20-cyber.github.io/myeongin-tteok/ |
| 최종 주소 | https://myeongin-tteok.com (DNS 설정 중) |
| 로컬 경로 | `C:\Users\user\Desktop\sotong-sites\myeongin-tteok` |

### 도메인
- 가비아, 2026-08-10 등록 ~ **2027-08-10 만료**
- 소유자: 이연순 명인떡 정보 / 관리자: 대표님
- 안전잠금(client transfer prohibited) 적용됨
- **소유자 인증 메일** 15일 내 처리 필요 (미처리 시 도메인 정지)
- 계약 확정 시 소유권 이전 예정 — 계약서에 "도메인 소유권은 고객사" 명시할 것

### GitHub 토큰
- fine-grained, 이름 `myeongin-tteok`, **만료 2027-08-10**
- 권한: Contents(Read and write) + Metadata(Read-only), 저장소 1개 한정
- **아직 글해줌에 연동 안 됨** ← 남은 작업

---

## 왜 docs/ 가 아니라 루트인가 (중요)

`blog-auto/publisher_homepage.py` 가 `posts/`, `images/posts/`, `sitemap.xml` 을
**저장소 최상위 기준으로 하드코딩**한다. docs/ 배포로는 자동 발행이 동작하지 않아
동강래프팅과 같은 구조로 맞췄다. 되돌리면 발행이 깨진다.

---

## 블로그 구조

| 파일 | 역할 |
|---|---|
| `blog.html` | 목록 — `posts.json` 읽어 카드 렌더링 → `posts/{id}.html` |
| `posts.json` | 글 데이터 (id/title/date/tags/summary/content) |
| `posts/1.html` | 첫 글 + **발행기 템플릿** |
| `sitemap.xml` `robots.txt` | 발행 시 자동 갱신됨 |

### posts/1.html 은 함부로 고치지 말 것

발행기가 **이 파일을 복제해 새 글을 만든다.** 아래 표시가 하나라도 빠지면 발행이 깨진다.

```
<title>  meta description  meta keywords
link rel=canonical ...posts/N.html
og:title  og:description  og:url ...posts/N.html
article:published_time
JSON-LD Article / BreadcrumbList
<h1>  <div class="blog-post-meta">날짜 · 이연순 명인떡</div>
<div class="blog-card-tags">  <div class="blog-post-content"> ... </div></article>
```

실제 발행기 `_generate_post_html()` 로 치환 시험 완료 (7개 항목 통과).

---

## 글해줌 연동 (남은 작업)

**운영 시스템은 https://geulhaejum.kr** (로컬 blog-auto 는 발행 엔진 역할).

매장 페이지 → [관리자] GitHub 연결 설정에 입력:

| 칸 | 값 |
|---|---|
| GitHub 저장소 | `choikiho20-cyber/myeongin-tteok` |
| 브랜치 | `master` |
| 데이터 파일 | `posts.json` |
| 토큰 | 발급한 fine-grained 토큰 |
| 블로그 실제 주소 | **도메인 연결 후 `https://myeongin-tteok.com`** |

**도메인이 확정될 때까지 AI 발행을 돌리지 말 것.** 글마다 임시 주소가 4곳씩 박히고,
발행기는 지난 글을 고치지 않는다. 글 50개면 200곳을 손봐야 한다.

---

## blog-auto 미배포 변경 (주의)

로컬 `C:\Users\user\Desktop\blog-auto` 에 **토큰 만료 경고 기능**을 넣었으나
**서버에 배포되지 않았다.** 저장소는 `choikiho20-cyber/geulhaejum`.

- 수정 파일: `app.py`, `publisher_homepage.py`, `templates/store.html`
- 기능: 만료일 자동 감지(GitHub 응답 헤더) → 30일 전 노란 경고 / 만료 시 빨간 경고
- 기존 고객사 영향 없음 확인 (만료일 없으면 미표시)
- **로컬에만 있는 커밋 3개**가 별도로 존재 — 함께 올릴지 판단 필요
  (인수인계 문서 / 런처 MOTW 제거 / 발행물 품질 4건)

10개 고객사가 쓰는 운영 시스템이므로 배포는 대표님 확인 후 진행할 것.

---

## 주소가 박힌 곳 (도메인 교체 시)

```
posts/1.html   4곳  (canonical, og:url, og:image, JSON-LD ×2)
blog.html      2곳  (canonical, og:url)
index.html     2곳  (canonical, og:url) — 현재 myeongin-tteok.com 로 되어 있음
sitemap.xml    3곳  (자동 재생성됨)
robots.txt     1곳  (자동 재생성됨)
assets/js/site-config.js  domain 값
```

---

## CSS·JS 고치면 반드시

```bash
python bump-assets.py
```

파일 내용 해시를 참조 주소에 붙여 브라우저 캐시를 무효화한다.
이걸 빼먹으면 **HTML 은 새것 / JS 는 옛것** 조합이 되어 기능이 죽은 것처럼 보인다.
(실제로 계절 카드가 안 눌리는 문제가 이 원인이었다)

---

## 남은 작업

### 고객 답변 대기
- 냉동/상온 구분 — 인절미류·쑥녹두찹쌀떡·두텁떡 (배지 컴포넌트는 준비됨)
- 해동 방법 · 소비기한
- 배송 안내 (요일·아이스팩·배송비) → FAQ 추가 예정
- 오란다 · 호두정과 · 동글이강정 — 가격, 설명 문구 (현재 "가격 문의")

### 사진
- 쑥녹두 찹쌀떡 상품 사진 1장 (마지막 빈 자리, 1:1 800×800)
- 떡카페 내부 · 인절미라떼 (갤러리에 추가 가능)
- 아이들 체험 사진 — **얼굴 모자이크 처리 후** 사용 결정됨 (미성년자 초상권)
  OpenCV 설치 완료. 자동 검출 후 육안 확인 → 누락분 수동 처리 → 승인 후 반영

### 기능 (앞서 합의한 순서)
1. ~~블로그 개설~~ ✅
2. 글해줌 연동 ← **다음**
3. 미디어 관리 개선 — 드래그앤드롭, 영상 업로드, alt 입력, 용량 상향(현재 60MB)
4. 홈페이지 누락분 보완

---

## 작업 시 지켜온 기준

- 모든 변경은 **브라우저에서 실측 검증** (대비·겹침·overflow·콘솔)
- 텍스트 대비 4.5:1 (큰 글씨 3:1) — 사진/영상 위 글자는 스크림·후광 합성까지 계산
- 사진은 용량 최적화 후 반영 (예: 2.9MB → 276KB)
- 확인되지 않은 사실은 쓰지 않음 — 모르면 "확인 필요"로 표시하고 질문
- 커밋 메시지에 **원인 → 조치 → 검증** 기록
