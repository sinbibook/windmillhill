(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  // ── 랜딩 진입 판단 ─────────────────────────────────────────
  // index.html 진입을 landing.html 로 돌려야 하면 true. 쿼리 파라미터 없이 "어디서 왔는지(referrer)" 로 가른다.
  //   - 어드민 프리뷰 iframe → false (운영자가 "홈" 탭을 직접 볼 수 있어야 한다)
  //   - pages.landing.sections[0].enabled !== true → false (명시적으로 켠 경우만. 어드민 저장 시
  //     undefined 는 JSON 에서 키째 빠지므로, 누락을 '켜짐' 으로 보면 랜딩을 안 쓰는 숙소가 튕긴다)
  //   - 같은 사이트 안에서 넘어옴 → false (헤더 로고·메뉴, 랜딩의 자기 자신 카드)
  //   - 랜딩 카드에 등록된 연결 숙소 도메인에서 넘어옴 → false (그 숙소 랜딩의 카드를 눌러 온 경우)
  //   - 그 외(주소 직접 입력·즐겨찾기·검색/외부 링크) → true
  function shouldEnterLanding(landingPage) {
    if (window.top !== window.self) return false;

    var section = landingPage && landingPage.sections && landingPage.sections[0];
    if (!section || section.enabled !== true) return false;

    return !isFromSameSite() && !isFromLinkedProperty(section);
  }

  function getReferrerUrl() {
    try {
      return document.referrer ? new URL(document.referrer) : null;
    } catch (e) {
      return null;
    }
  }

  function isFromSameSite() {
    var ref = getReferrerUrl();
    return !!ref && ref.origin === window.location.origin;
  }

  // 크로스 도메인 referrer 는 브라우저 기본 정책상 origin 만 오므로 호스트로만 비교한다 (www. 유무는 무시).
  function isFromLinkedProperty(section) {
    var ref = getReferrerUrl();
    if (!ref) return false;

    var refHost = normalizeHost(ref.host);
    return ((section && section.about) || []).some(function (card) {
      var domain = card && typeof card.domain === 'string' ? card.domain.trim() : '';
      if (!domain) return false;
      try {
        var url = new URL(/^https?:\/\//i.test(domain) ? domain : 'https://' + domain);
        return normalizeHost(url.host) === refHost;
      } catch (e) {
        return false;
      }
    });
  }

  // 랜딩으로 이동을 시작했으면 true. location.replace 는 즉시 페이지를 떠나지 않으므로,
  // 그 사이 다른 매핑(헤더 등)이 끝나며 부르는 __tplReveal 이 index 를 잠깐 드러내지 않게 막는 데 쓴다.
  var leavingToLanding = false;

  function goToLanding() {
    leavingToLanding = true;
    window.location.replace('landing.html');
  }

  function normalizeHost(host) {
    return String(host || '').toLowerCase().replace(/^www\./, '');
  }

  function IndexMapper() {
    BaseDataMapper.call(this);
  }
  IndexMapper.prototype = Object.create(BaseDataMapper.prototype);
  IndexMapper.prototype.constructor = IndexMapper;

  IndexMapper.prototype.mapPage = function () {
    if (this.maybeRedirectToLanding()) return;

    this.mapPropertyNames();
    this.mapHero();
    this.mapHeroLogo();
    this.mapRoomIntro();
    this.mapRoomSlides();
    this.mapMemories();
    this.mapLandscapeText();
    this.mapLandscapeSlides();
    this.mapSpecialIntro();
    this.mapSpecialList();

    if (typeof window.initIndexSwipers === 'function') window.initIndexSwipers();
  };

  // 루트 가드: 랜딩 진입 대상이면 index.html 진입을 landing.html 로 되돌린다 (판단은 shouldEnterLanding).
  IndexMapper.prototype.maybeRedirectToLanding = function () {
    if (!shouldEnterLanding(this.getPages().landing)) return false;

    goToLanding();
    return true;
  };

  IndexMapper.prototype.getSection = function () {
    var page = this.getPages().index;
    return (page && page.sections && page.sections[0]) || {};
  };

  IndexMapper.prototype.mapPropertyNames = function () {
    var nameEn = this.getPropertyNameEn();
    var name = this.getPropertyName();
    setAllText('[data-property-name-en]', nameEn || name);
    setAllText('[data-property-name]', name);
    this.applyPropertyCaptions();

    var eyebrow = nameEn ? 'WELCOME TO ' + nameEn.toUpperCase() : 'WELCOME TO PENSION';
    setAllText('[data-index-eyebrow]', eyebrow);
  };

  IndexMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    var wrapper = document.querySelector('[data-index-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '메인 비주얼');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(
      function (img) {
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';
        this.setBackground(slide, img.url, '메인 비주얼');
        wrapper.appendChild(slide);
      }.bind(this)
    );
  };

  // MAPPER: index.essence.images[isSelected][0] → [data-index-hero-logo]
  // 원본 히어로 가운데 로고(.visual_img)를 크롤러가 essence 이미지 칸에 넣는다.
  // B형은 essence 의 제목·설명(Room Preview)만 쓰므로 이미지 칸을 히어로 로고 칸으로 빌린다 (A형과 같은 방식).
  // 기본정보 로고(homepage.images[0].logo)는 헤더 로고 전용이다 — 원본도 헤더 로고와 히어로 로고가 다른 파일이다.
  // 이미지가 없으면 hidden 그대로 두어 지금처럼 이미지 전용 히어로다.
  IndexMapper.prototype.mapHeroLogo = function () {
    var logo = this.getSelectedImages((this.getSection().essence || {}).images || [])[0];
    var alt = this.getPropertyName();
    document.querySelectorAll('[data-index-hero-logo]').forEach(function (box) {
      box.innerHTML = '';
      box.hidden = !(logo && logo.url);
      if (box.hidden) return;
      var img = document.createElement('img');
      img.src = logo.url;
      img.alt = alt;
      box.appendChild(img);
    });
  };

  IndexMapper.prototype.mapRoomSlides = function () {
    this.renderRoomSlides('[data-index-room-slides]');
  };

  IndexMapper.prototype.renderPropertyCaption = function (template) {
    return this.nl2br(
      String(template || '')
        .replace(/\{name\}/g, this.getPropertyName())
        .replace(/\{nameEn\}/g, this.getPropertyNameEn())
    );
  };

  IndexMapper.prototype.mapRoomIntro = function () {
    var essence = this.getSection().essence || {};
    var title = this.firstText(essence.title, 'Room Preview');
    var desc = this.firstText(essence.description, '편안함과 즐거움이 있는 곳, {name}');

    setAllText('[data-index-room-title]', title);
    document.querySelectorAll('[data-index-room-description]').forEach(
      function (el) {
        el.innerHTML = this.renderPropertyCaption(desc);
      }.bind(this)
    );
  };

  IndexMapper.prototype.mapLandscapeText = function () {
    var gallery = this.getSection().gallery || {};
    var title = this.firstText(gallery.title, 'Beautiful Healing Place');

    setAllText('[data-index-landscape-title]', title);
  };

  IndexMapper.prototype.getIndexImagePool = function () {
    var pool = this.getLandscapeImages();
    var roomtypes = this.getRoomtypes();
    var self = this;

    roomtypes.forEach(function (rt) {
      self.getRoomtypeImages(rt, 'roomtype_interior').forEach(function (img) {
        if (
          img &&
          img.url &&
          !pool.some(function (p) {
            return p.url === img.url;
          })
        ) {
          pool.push(img);
        }
      });
    });

    return pool;
  };

  IndexMapper.prototype.mapMemories = function () {
    var section = this.getSection();
    var closing = section.closing || {};
    var gallery = section.gallery || {};
    var title = this.firstText(closing.title, 'Memories');
    var desc = this.firstText(
      gallery.description,
      closing.description,
      '일상에서 벗어나 자연과 함께 즐기는 여유로운 시간'
    );
    var images = this.getSelectedImages(closing.images || []);
    if (!images.length) images = this.getIndexImagePool();

    setAllText('[data-index-memories-title]', title);
    document.querySelectorAll('[data-index-memories-description]').forEach(
      function (el) {
        el.innerHTML = this.nl2br(desc);
      }.bind(this)
    );

    document.querySelectorAll('[data-index-memories-images]').forEach(
      function (ul) {
        ul.innerHTML = '';
        for (var i = 0; i < 3; i++) {
          var li = document.createElement('li');
          var img = images.length ? images[i % images.length] : null;
          this.setBackground(li, img && img.url, 'Memories ' + (i + 1));
          ul.appendChild(li);
        }
      }.bind(this)
    );
  };

  IndexMapper.prototype.mapLandscapeSlides = function () {
    var gallery = this.getSection().gallery || {};
    var images = this.getSelectedImages(gallery.images || []);
    if (!images.length) images = this.getIndexImagePool();

    var wrapper = document.querySelector('[data-index-landscape-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, 'Healing Place');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(
      function (img) {
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';
        this.setBackground(slide, img.url, 'Healing Place');
        wrapper.appendChild(slide);
      }.bind(this)
    );
  };

  IndexMapper.prototype.mapSpecialList = function () {
    var self = this;
    var facilities = this.getProperty().facilities || [];

    document.querySelectorAll('[data-index-special-list]').forEach(function (ul) {
      ul.innerHTML = '';

      facilities.forEach(function (facility) {
        var name = self.firstText(facility.name);
        if (!name) return;

        var imageUrl =
          self.getFirstSelectedImage(facility.images || []) ||
          (facility.images && facility.images[0] && facility.images[0].url) ||
          '';

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = './facility.html?id=' + facility.id;

        var img = document.createElement('div');
        img.className = 'img';
        self.setBackground(img, imageUrl, '부대시설 이미지');

        var p = document.createElement('p');
        p.textContent = name;

        li.appendChild(a);
        li.appendChild(img);
        li.appendChild(p);
        ul.appendChild(li);
      });

      self.balanceListRows(ul);
    });
  };

  IndexMapper.prototype.mapSpecialIntro = function () {
    var signature = this.getSection().signature || {};
    var title = this.firstText(signature.title, 'SPECIAL');

    setAllText('[data-index-special-title]', title);
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new IndexMapper();
    mapper.initialize();
    global.indexMapperInstance = mapper;
  });

  // 조기 랜딩 가드 — 매핑을 기다리지 않고 이 스크립트가 로드되자마자 랜딩 여부부터 판단한다.
  //   standalone 에서는 preview-handler 가 어드민 데이터를 2초 기다린 뒤에야 index 를 매핑하는데,
  //   그 사이 헤더 매핑이 렌더 게이트를 먼저 풀어 매핑 전 index(히어로 < > 화살표 등)가 보였다가
  //   랜딩으로 넘어갔다. 판단이 끝날 때까지 __tplReveal 을 붙잡아 둔다.
  //   - 랜딩 진입 대상(shouldEnterLanding) → 화면을 풀지 않고 곧장 landing.html. 이동 판단 뒤에 헤더 매핑이
  //     끝나며 노출을 요청해도 무시한다 (판단 = 노출 허용으로 보면 페이지를 떠나기 직전 index 가 비친다)
  //   - 그 외 → 붙잡아 둔 노출을 그대로 진행 (기존과 같은 화면. JSON 한 번 더 읽는 시간만큼 늦게 뜰 수 있다)
  //   - 네트워크 실패/지연 대비 3초 뒤에는 무조건 판단을 끝낸다 (head 의 렌더 게이트 타임아웃과 같은 값)
  //   iframe(어드민 프리뷰)·내부 이동은 JSON 을 읽기 전에 바로 건너뛴다 (어차피 랜딩으로 안 보낸다).
  (function earlyLandingGate() {
    if (window.top !== window.self) return;
    if (isFromSameSite()) return;

    var reveal = window.__tplReveal;
    var decided = false;
    var pending = false;

    function finish() {
      if (decided) return;
      decided = true;
      if (pending && reveal) reveal();
    }

    window.__tplReveal = function () {
      if (leavingToLanding) return; // 랜딩으로 떠나는 중 — 노출하지 않는다
      if (decided) {
        if (reveal) reveal();
      } else {
        pending = true;
      }
    };

    setTimeout(function () {
      pending = true;
      finish();
    }, 3000);

    fetch('standard-template-data.json?t=' + Date.now())
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var customFields = (data && data.homepage && data.homepage.customFields) || (data && data.customFields) || {};
        var landing = customFields.pages && customFields.pages.landing;
        if (!decided && shouldEnterLanding(landing)) {
          decided = true;
          goToLanding(); // 노출하지 않고 이동한다 (이후 들어오는 노출 요청은 무시)
          return;
        }
        finish();
      })
      .catch(finish);
  })();

  global.IndexMapper = IndexMapper;
})(window);
