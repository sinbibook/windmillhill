/* ============================================================
   pages/nearby-attractions.js — 주변여행지 페이지 스크립트
   ============================================================ */
window.initNearbyAttractionsSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  window.TplSwiper.initHero('nearbyHero', '.sub_visual_box .swiper-container', {
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    navigation: {
      nextEl: '.sub_visual_wide .swiper-button-next',
      prevEl: '.sub_visual_wide .swiper-button-prev'
    }
  });
};
