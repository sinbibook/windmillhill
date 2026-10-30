/* ============================================================
   pages/layout-map.js — ROOMS 미리보기 페이지 스크립트
   슬라이드는 layout-map-mapper 가 동적 생성하므로, 매핑 완료 후
   window.initLayoutMapSwipers() 를 호출받아 초기화한다.
   ============================================================ */
window.initLayoutMapSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 객실 미리보기 (index.html 과 동일 설정)
  // 객실 카드: 데스크톱 4장 (객실이 4개 미만이면 3장)
  var layoutRoomPerView = window.TplSwiper.roomPerView('.room_list_sld');
  window.TplSwiper.init('layoutMapRoom', '.room_list_sld', {
    loop: window.TplSwiper.shouldLoop('.room_list_sld', layoutRoomPerView),
    slidesPerView: layoutRoomPerView,
    spaceBetween: 30,
    breakpoints: {
      280: { slidesPerView: 1, spaceBetween: 10 },
      640: { slidesPerView: 2, spaceBetween: 10 },
      768: { slidesPerView: 2, spaceBetween: 20 },
      980: { slidesPerView: layoutRoomPerView, spaceBetween: 20 },
      1451: { slidesPerView: layoutRoomPerView, spaceBetween: 30 }
    }
  });
};
