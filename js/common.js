/* ============================================================
   common.js — t-template-B common interactions
   Header/footer are injected by header-footer-loader.js, so bindings wait
   for window.loaderReady and use delegated events for mapped menus.
   ============================================================ */
$(function () {
  (window.loaderReady || Promise.resolve()).then(function () {
    $(document).on('click', '.btn_menu, .btn_close', function (e) {
      e.preventDefault();
      $('.aside').toggleClass('on');
    });
  });
});

window.TplSwiper = (function () {
  var instances = {};

  function init(key, selector, options) {
    var el = document.querySelector(selector);
    if (!el) return null;
    if (!el.querySelectorAll('.swiper-slide').length) return null;

    if (instances[key]) {
      try {
        instances[key].destroy(true, true);
      } catch (e) {
        /* ignore stale instances */
      }
      delete instances[key];
    }

    instances[key] = new Swiper(selector, options);
    return instances[key];
  }

  /** 슬라이더 안의 원본 슬라이드 개수 (loop 복제 전에 세야 한다) */
  function slideCount(selector) {
    var el = document.querySelector(selector);
    return el ? el.querySelectorAll('.swiper-slide').length : 0;
  }

  /**
   * 객실 카드 슬라이더의 데스크톱 노출 장수.
   * 기본 4장이되, 카드가 4개가 안 되면 카드 수만큼만 보여준다.
   * 3장 자리에 2장만 있으면 loop 가 복제본으로 빈칸을 채워 같은 객실이 두 번 나온다.
   * (그룹 숙소는 카드가 그룹 단위로 접혀 2~3장이 되는 일이 흔하다)
   */
  function roomPerView(selector) {
    var n = slideCount(selector);
    return n >= 4 ? 4 : Math.max(n, 1);
  }

  /** 슬라이드가 한 화면에 다 들어가면 loop 를 끈다 (복제본 방지) */
  function shouldLoop(selector, perView) {
    return slideCount(selector) > perView;
  }

  /**
   * 서브페이지 히어로 초기화.
   * 원본 히어로는 자동 전환이 없다 — loop / autoplay 없이 화살표로만 넘긴다.
   * (evergreen 원본 측정: index 메인비주얼·about·view·room상세 전부 loop:false, autoplay 없음)
   * 이미지가 1장이면 Swiper 가 watchOverflow 로 잠가 화살표까지 감춘다.
   * loop 를 켜두면 슬라이드가 복제돼 이 잠금 판정이 걸리지 않으므로 반드시 꺼야 한다.
   * (navigation 설정은 그대로 둔다 — 잠기면 Swiper 가 버튼에 swiper-button-lock 을 붙인다)
   */
  function initHero(key, selector, options) {
    var opts = {};
    for (var k in options) {
      if (Object.prototype.hasOwnProperty.call(options, k)) opts[k] = options[k];
    }
    opts.loop = false;
    opts.autoplay = false;
    return init(key, selector, opts);
  }

  return {
    init: init, initHero: initHero, instances: instances,
    slideCount: slideCount, roomPerView: roomPerView, shouldLoop: shouldLoop,
  };
})();
