/* ============================================================
   pages/room.js — 객실 상세 페이지 스크립트
   슬라이드는 room-mapper 가 동적 생성하므로, 매핑 완료 후
   window.initRoomSwipers() 를 호출받아 초기화한다.
   ============================================================ */
window.initRoomSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 객실 히어로 (풀와이드 페이드)
  window.TplSwiper.initHero('roomHero', '.sub_visual_box .swiper-container', {
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    navigation: {
      nextEl: '.sub_visual_wide .swiper-button-next',
      prevEl: '.sub_visual_wide .swiper-button-prev'
    }
  });

  // 하단 객실 미리보기 (원본 room_list_sld: 데스크톱 4장)
  var previewPerView = window.TplSwiper.roomPerView('.main_room .room_list_sld');
  window.TplSwiper.init('roomPreview', '.main_room .room_list_sld', {
    loop: window.TplSwiper.shouldLoop('.main_room .room_list_sld', previewPerView),
    slidesPerView: previewPerView,
    spaceBetween: 30,
    grabCursor: true,
    breakpoints: {
      0: { slidesPerView: 1, spaceBetween: 15 },
      480: { slidesPerView: 2, spaceBetween: 20 },
      961: { slidesPerView: previewPerView, spaceBetween: 30 }
    }
  });
};
