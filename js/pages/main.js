/* ============================================================
   pages/main.js — 펜션소개(ABOUT) 페이지 스크립트
   페이지 내용은 원본 view.html(외경보기 / Landscape) 구조다.
   슬라이드는 main-mapper 가 동적 생성하므로, 매핑 완료 후
   window.initMainSwipers() 를 호출받아 초기화한다.
   ============================================================ */
window.initMainSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 히어로 (풀와이드 페이드)
  var mainHero = window.TplSwiper.initHero('mainHero', '.sub_visual_box .swiper-container', {
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    navigation: {
      nextEl: '.sub_visual_wide .swiper-button-next',
      prevEl: '.sub_visual_wide .swiper-button-prev'
    }
  });

  var prev = document.querySelector('.sub_visual_wide .swiper-button-prev');
  var next = document.querySelector('.sub_visual_wide .swiper-button-next');
  if (mainHero && prev && next) {
    prev.onclick = function (e) {
      e.preventDefault();
      mainHero.slidePrev();
    };
    next.onclick = function (e) {
      e.preventDefault();
      mainHero.slideNext();
    };
  }
};
