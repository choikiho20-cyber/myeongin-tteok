/**
 * 이연순 명인떡 — 사이트 설정
 * ⚠️ 미확인 항목은 여기서만 수정하면 전체 사이트에 반영됩니다.
 */
const SITE = {
  name: "이연순 명인떡",
  nameShort: "명인떡",
  tagline: "대한민국 식품명인 제52호",
  description: "3대째 이어온 전통 떡, 100% 국내산 원재료. 대한민국 식품명인 제52호 이연순 명인의 정성을 담았습니다.",

  /* 연락처 */
  phone: "043-645-3050",
  phoneTel: "tel:0436453050",
  address: "충북 제천시 제천북로 138",
  addressFull: "충북 제천시 제천북로 138 (제천 한방바이오공원 인근)",
  hours: "화~일 09:00–19:00",
  dayOff: "월요일 휴무",
  parking: "주차 가능",

  /* 외부 링크 */
  smartStoreUrl: "https://smartstore.naver.com/leeys3050",
  smartStoreProducts: {
    danja10:      "https://smartstore.naver.com/leeys3050/products/8462088438",
    danja20:      "https://smartstore.naver.com/leeys3050/products/8462145985",
    danja30:      "",   // 스토어 미등록
    kongInjeolmi: "https://smartstore.naver.com/leeys3050/products/13137081082",
    heukimja:     "https://smartstore.naver.com/leeys3050/products/8461891022",
    castella:     "https://smartstore.naver.com/leeys3050/products/13137043965",
    ssukChapssal: "https://smartstore.naver.com/leeys3050/products/8462564488",
    kkaesogeum:   "",   // 스토어 미등록
    duteop:       "",   // 스토어 미등록
  },

  /* 네이버 예약 */
  naverBooking: "",  // ⚠️ 예약 URL 확인 필요

  /* 지도 */
  naverPlaceId: "13443329",
  naverMapUrl:  "https://map.naver.com/p/entry/place/13443329",
  kakaoMapUrl:  "https://map.kakao.com/?q=이연순명인떡",
  googleMapUrl: "https://www.google.com/maps/search/?api=1&query=이연순명인떡",
  // 네이버 플레이스 기준 실제 좌표 (2026-08-10 확인)
  lat: 37.1426916,
  lng: 128.1623969,
  // ⚠️ 네이버·구글 지도는 iframe 삽입을 차단하므로 embed 대신 링크 방식 사용

  /* SNS */
  instagram: "",
  blog: "",
  youtube: "",           // 채널 주소
  kakaoChannel: "",      // 카카오톡 채널 (http://pf.kakao.com/_xxxxx)

  /* ══════════════════════════════════════════════════════════
     상담·예약 폼 주소 (네이버폼 / 구글폼)
     비워두면 해당 버튼이 화면에 나오지 않습니다.
     ══════════════════════════════════════════════════════════ */
  forms: {
    seasonal:   "",      // 계절 상품 예약 상담
    experience: "",      // 체험 프로그램 신청
    bulk:       "",      // 대량·단체 주문 문의
  },

  /* ══════════════════════════════════════════════════════════
     방송 · 언론 (media.html)
     ⚠️ 방송 화면 캡처와 방송사 로고는 방송사 저작권입니다.
        직접 올리지 말고 ① 방송사가 올린 유튜브 영상을 embed 하거나
        ② 방송명·날짜만 텍스트로 적고 원문 링크를 거세요.

     type: "youtube" — youtubeId 필수 (주소의 v= 뒤 11자리)
     type: "article" — url 필수 (기사 원문 링크)
     비워두면 미디어 섹션·메뉴가 통째로 숨겨집니다.
     ══════════════════════════════════════════════════════════ */
  media: [
    // { type:"youtube", youtubeId:"", title:"", outlet:"KBS 6시 내고향", date:"2024-05-13" },
    // { type:"article", url:"", title:"", outlet:"충북일보", date:"2024-03-02" },
  ],

  /* ══════════════════════════════════════════════════════════
     갤러리 (gallery.html)
     cat: "product" 상품 | "process" 제작공정 | "experience" 체험관
          | "cafe" 떡카페 | "store" 매장
     video: true 면 mp4 로 취급합니다.
     ══════════════════════════════════════════════════════════ */
  gallery: [
    { src: "assets/images/danja-01.jpg",      alt: "승검초단자 선물세트",            cat: "product" },
    { src: "assets/images/prd-kong.jpg",      alt: "콩 인절미",                     cat: "product" },
    { src: "assets/images/prd-heukimja.jpg",  alt: "흑임자 인절미",                  cat: "product" },
    { src: "assets/images/prd-kkaesogeum.jpg",alt: "깨소금 인절미",                  cat: "product" },
    { src: "assets/images/prd-castella.jpg",  alt: "카스텔라 인절미",                cat: "product" },
    { src: "assets/images/prd-duteop.jpg",    alt: "두텁떡",                        cat: "product" },
    { src: "assets/images/prd-ssuknokdu.jpg", alt: "쑥 찹쌀떡",                  cat: "product" },
    { src: "assets/images/prd-oranda.jpg",    alt: "오란다",                        cat: "product" },
    { src: "assets/images/prd-hodu.jpg",      alt: "호두정과",                      cat: "product" },
    { src: "assets/images/prd-ganjeong.jpg",  alt: "동글이강정",                    cat: "product" },
    { src: "assets/images/banner-02.mp4",     alt: "명인이 손으로 떡을 빚는 모습",     cat: "process", video: true },
    { src: "assets/images/master-01.jpg",     alt: "이연순 명인",                    cat: "process" },
    { src: "assets/images/experience-01.jpg", alt: "전통음식체험관 외관",             cat: "experience" },
    { src: "assets/images/experience-02.jpg", alt: "전통음식체험관 내부 조리 공간",    cat: "experience" },
    { src: "assets/images/cafe-01.jpg",       alt: "제천 떡카페 내부",               cat: "cafe" },
    { src: "assets/images/banner-05.jpg",     alt: "매장 외관과 제천 풍경",           cat: "store" },
  ],

  /* ══════════════════════════════════════════════════════════
     체험 프로그램 — 가격·시간·정원이 확인되면 채우세요.
     비워두면 프로그램 표가 나오지 않고 안내문만 보입니다.
     ══════════════════════════════════════════════════════════ */
  experiencePrograms: [
    // { name:"떡 케이크 만들기", price:"", duration:"", capacity:"", note:"" },
  ],

  /* 메타 / SEO */
  domain: "myeongin-tteok.com",
  ogImage: "https://myeongin-tteok.com/assets/images/og-cover.jpg",
  themeColor: "#5E7050",

  /* 제작 정보 */
  madeBy: "소통마케팅센터",
  madeByUrl: "https://sotong.kr",
  year: new Date().getFullYear(),
};

/* const 로 선언한 값은 window 에 붙지 않는다.
   다른 스크립트에서 window.SITE 로도 읽을 수 있게 명시적으로 걸어둔다. */
window.SITE = SITE;
