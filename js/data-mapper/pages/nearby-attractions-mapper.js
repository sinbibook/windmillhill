(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function NearbyAttractionsMapper() {
    BaseDataMapper.call(this);
  }
  NearbyAttractionsMapper.prototype = Object.create(BaseDataMapper.prototype);
  NearbyAttractionsMapper.prototype.constructor = NearbyAttractionsMapper;

  NearbyAttractionsMapper.prototype.mapPage = function () {
    var section = this.getSection();

    // enabled=false (또는 섹션 자체가 없음) → 404 리다이렉트.
    // 헤더 TRAVEL 메뉴도 header-footer-mapper 가 같은 기준으로 숨긴다.
    if (!section || section.enabled === false) {
      window.location.href = '404.html';
      return;
    }

    this.mapPropertyNames();
    this.mapHeroSlides(section);
    this.mapList(section);

    if (typeof window.initNearbyAttractionsSwipers === 'function') {
      window.initNearbyAttractionsSwipers();
    }
  };

  // nearbyAttractions 페이지 섹션 (customFields.pages.nearbyAttractions.sections[0])
  NearbyAttractionsMapper.prototype.getSection = function () {
    var page = this.getPages().nearbyAttractions;
    return (page && page.sections && page.sections[0]) || null;
  };

  // MAPPER: customFields.property.propertyUnameEn / property.nameEn / property.name + [data-property-caption]
  NearbyAttractionsMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: nearbyAttractions.hero.images[isSelected] → [data-nearby-hero-slides]
  NearbyAttractionsMapper.prototype.mapHeroSlides = function (section) {
    var self = this;
    var hero = (section && section.hero) || {};
    var images = this.getSelectedImages(hero.images || []);
    if (!images.length && hero.images) images = hero.images.slice();

    var wrapper = document.querySelector('[data-nearby-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '주변여행지 대표 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (image) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, image.url, '주변여행지 대표 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: nearbyAttractions.about[] → [data-nearby-attractions-list]
  // B 원본 travel.html 의 .sub_txt_box 블록을 about[] 개수만큼 반복한다.
  //
  // ⚠️ 원본 사이트는 각 항목 <p> 안에 "(자료출처 : 대한민국 구석구석 …)" 문구를 두지만
  //    about[] 스키마에 대응 필드가 없다. 매퍼가 문구를 만들어내지 않으며,
  //    출처가 필요하면 크롤러가 description 끝에 포함시켜 내려준다.
  NearbyAttractionsMapper.prototype.mapList = function (section) {
    var self = this;
    var blocks = (section && Array.isArray(section.about) && section.about) || [];

    document.querySelectorAll('[data-nearby-attractions-list]').forEach(function (ul) {
      ul.innerHTML = '';

      blocks.forEach(function (block) {
        var images = self.getSelectedImages(block.images || []);
        var image = images[0] || (block.images && block.images[0]) || null;
        var title = self.cleanText(block.title);
        var desc = self.cleanText(block.description);
        var caption = self.cleanText(image && image.description);

        var item = document.createElement('div');
        item.className = 'sub_txt_box';

        var inner = document.createElement('div');
        inner.className = 'sub_inner';

        var subTitle = document.createElement('div');
        subTitle.className = 'sub_title';

        var span = document.createElement('span');
        span.textContent = 'Travel With ' + (self.getPropertyNameEn() || 'Pension');

        var h3 = document.createElement('h3');
        h3.textContent = 'Travel';

        subTitle.appendChild(span);
        subTitle.appendChild(h3);

        var box = document.createElement('div');
        box.className = 'box';

        var imgWrap = document.createElement('div');
        imgWrap.className = 'img';

        var img = document.createElement('img');
        if (image && image.url) {
          img.src = image.url;
          img.alt = title || '주변여행지';
        } else {
          ImageHelpers.applyPlaceholder(img, '주변여행지 이미지');
        }
        imgWrap.appendChild(img);

        var txt = document.createElement('div');
        txt.className = 'txt';

        var em = document.createElement('em');
        em.textContent = title;
        if (!title) em.style.display = 'none';
        txt.appendChild(em);

        // 자료출처는 원본에서도 본문에 이어져 있다. 크롤러가 description 에 포함해 보낸다.
        // (caption 은 구버전 산출물 호환 — 따로 들어오면 본문 뒤에 붙인다)
        var body = [desc, caption].filter(Boolean).join('\n');
        var p = document.createElement('p');
        p.innerHTML = body ? self.nl2br(body) : '';
        if (!body) p.style.display = 'none';
        txt.appendChild(p);

        // 장식 문구: 원본 travel.html 의 .txt > span 자리. 전 페이지 공통 문장이라
        // main.html 과 같이 하드코딩한다(이름만 치환).
        var decoration = document.createElement('span');
        decoration.innerHTML =
          'All seasons of the year are beautiful here. ' +
          (self.getPropertyNameEn() || self.getPropertyName()) +
          '<br>I give you a gift for your life.';
        txt.appendChild(decoration);

        var distance = self.cleanText(block.distance || block.duration || block.subtitle);
        if (distance) {
          var a = document.createElement('a');
          a.href = '#!';
          a.className = 'btn_reserve';
          a.textContent = '→      ' + distance;
          txt.appendChild(a);
        }

        box.appendChild(imgWrap);
        box.appendChild(txt);
        inner.appendChild(subTitle);
        inner.appendChild(box);
        item.appendChild(inner);
        ul.appendChild(item);
      });
    });
  };

  // preview-handler 가 standalone/preview 양쪽 초기화를 담당한다
  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new NearbyAttractionsMapper();
    mapper.initialize();
    global.nearbyAttractionsMapperInstance = mapper;
  });

  global.NearbyAttractionsMapper = NearbyAttractionsMapper;
})(window);
