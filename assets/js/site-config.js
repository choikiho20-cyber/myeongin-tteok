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
  phone: "0507-1457-3051",
  phoneTel: "tel:050714573051",
  address: "충북 제천시 제천북로 138",
  addressFull: "충북 제천시 제천북로 138 (제천 한방바이오공원 인근)",
  hours: "화~일 09:00–19:00",
  dayOff: "월요일 휴무",
  parking: "주차 가능",

  /* 외부 링크 */
  smartStoreUrl: "https://smartstore.naver.com/leeys3050",
  smartStoreProducts: {
    danja10:  "#",  // ⚠️ 개별 상품 URL — 스토어 등록 후 교체
    danja20:  "#",
    danja30:  "#",
    kongInjeolmi:   "#",
    heukimja:       "#",
    kkaesogeum:     "#",
    castella:       "#",
    ssukNokdu:      "#",
    duteop:         "#",
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

  /* 메타 / SEO */
  domain: "myeongin-tteok.com",
  ogImage: "assets/images/og-cover.jpg",
  themeColor: "#5E7050",

  /* 제작 정보 */
  madeBy: "소통마케팅센터",
  madeByUrl: "https://sotong.kr",
  year: new Date().getFullYear(),
};
