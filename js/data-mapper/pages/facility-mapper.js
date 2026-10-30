(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  // 값이 없으면 요소를 숨긴다 (빈 줄 여백 방지)
  function setTextOrHide(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
      el.style.display = value ? '' : 'none';
    });
  }

  // 부대시설 상세 페이지. 페이지 파일은 facility.html 이고,
  // 시설 목록/상세 데이터는 property.facilities[] 를 사용한다.
  function FacilityMapper() {
    BaseDataMapper.call(this);
  }
  FacilityMapper.prototype = Object.create(BaseDataMapper.prototype);
  FacilityMapper.prototype.constructor = FacilityMapper;

  FacilityMapper.prototype.mapPage = function () {
    var facility = this.getCurrentFacility();

    this.mapPropertyNames();
    this.mapNames(facility);
    this.mapDescription(facility);
    this.mapHeroSlides(facility);
    this.mapNav(facility);
    this.mapImages(facility);
    this.mapSpecialList(facility);

    if (typeof window.initFacilitySwipers === 'function') window.initFacilitySwipers();
  };

  FacilityMapper.prototype.getFacilities = function () {
    return this.getProperty().facilities || [];
  };

  // URL ?id= 로 시설 선택, 없으면 첫 번째
  FacilityMapper.prototype.getCurrentFacility = function () {
    var facilities = this.getFacilities();
    if (!facilities.length) return null;

    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) return facilities[0];

    var matched = facilities.filter(function (f) {
      return String(f.id) === String(id);
    })[0];
    return matched || facilities[0];
  };

  // MAPPER: customFields.property.propertyUnameEn / property.nameEn / property.name + [data-property-caption]
  FacilityMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: facilities[current].nameEn → name
  // nameEn 이 없는 응답이 일반적이라 상세 타이틀은 한글명으로 폴백한다.
  FacilityMapper.prototype.mapNames = function (facility) {
    var nameEn = this.cleanText(facility && facility.nameEn);
    var name = this.cleanText(facility && facility.name);

    setAllText('[data-special-name-en]', nameEn || name);
    setTextOrHide('[data-special-name]', name);
  };

  // MAPPER: 이용안내 문구
  //   facilities[current].description → facilities[current].usageGuide
  // 실데이터에서 description 이 빈 문자열이고 usageGuide 에만 내용이 있는 경우가 흔하다.
  FacilityMapper.prototype.mapDescription = function (facility) {
    // description(소개문)과 usageGuide(이용안내)를 한 줄 띄워 **둘 다** 보여준다.
    // 예전에는 폴백이라 description 이 있으면 usageGuide 가 통째로 묻혔다 —
    // 이용 요금·시간·제약이 화면에서 사라졌다. 둘 다 비면 슬롯을 숨긴다.
    // (t-template-H · I · J 와 같은 방식)
    var body = this.cleanText(facility && facility.description);
    var guide = this.cleanText(facility && facility.usageGuide);
    var text = body + (body && guide ? '\n\n' : '') + guide;
    var self = this;
    document.querySelectorAll('[data-special-description]').forEach(function (el) {
      el.innerHTML = text ? self.nl2br(text) : '';
      el.style.display = text ? '' : 'none';
    });
  };

  // MAPPER: facilities[current].images → [data-special-hero-slides] (배경 슬라이드)
  FacilityMapper.prototype.mapHeroSlides = function (facility) {
    var self = this;
    var images = this.getSelectedImages((facility && facility.images) || []);
    if (!images.length && facility && facility.images) images = facility.images.slice();

    var wrapper = document.querySelector('[data-special-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '부대시설 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '부대시설 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: property.facilities[] → [data-special-nav] (현재 시설 .on, 이름 없으면 skip)
  FacilityMapper.prototype.mapNav = function (facility) {
    var self = this;
    var facilities = this.getFacilities();
    var currentId = facility && facility.id;

    document.querySelectorAll('[data-special-nav]').forEach(function (ul) {
      ul.innerHTML = '';
      facilities.forEach(function (f) {
        var name = self.cleanText(f.name);
        if (!name) return;
        var li = document.createElement('li');
        if (currentId && f.id === currentId) li.className = 'on';
        var a = document.createElement('a');
        a.href = './facility.html?id=' + f.id;
        a.textContent = name;
        li.appendChild(a);
        ul.appendChild(li);
      });
    });
  };

  // MAPPER: facilities[current].images → 4장 이미지 박스 + 와이드 1장
  // evergreen special6 원본은 1번 이미지를 와이드, 2~5번 이미지를 4장 박스에 쓴다.
  // 나머지 이미지는 히어로 슬라이더에서 전부 노출된다.
  FacilityMapper.prototype.mapImages = function (facility) {
    var self = this;
    var images = this.getSelectedImages((facility && facility.images) || []);
    if (!images.length && facility && facility.images) images = facility.images.slice();

    document.querySelectorAll('[data-special-images]').forEach(function (ul) {
      var pool = images.length > 1 ? images.slice(1, 5) : images.slice(0, 4);
      var count = Math.min(pool.length, 4);
      ul.innerHTML = '';
      ul.className = 'sub_inner special_grid_count_' + count;
      ul.style.display = count ? '' : 'none';

      pool.slice(0, 4).forEach(function (image) {
        var li = document.createElement('li');
        self.setBackground(li, image && image.url, '부대시설 이미지');
        ul.appendChild(li);
      });
    });

    document.querySelectorAll('[data-special-wide-image]').forEach(function (el) {
      var image = images[0] || null;
      if (!image || !image.url) {
        ImageHelpers.applyPlaceholder(el, '부대시설 이미지');
        return;
      }
      el.src = image.url;
      el.alt = self.cleanText(image.description) || '부대시설 이미지';
    });

    document.querySelectorAll('[data-special-wide-wrap]').forEach(function (el) {
      el.style.display = images.length ? '' : 'none';
    });
  };

  // MAPPER: property.facilities[] → 하단 SPECIAL 원형 카드 목록
  FacilityMapper.prototype.mapSpecialList = function (currentFacility) {
    var self = this;
    var facilities = this.getFacilities();
    var currentId = currentFacility && currentFacility.id;

    document.querySelectorAll('[data-special-list]').forEach(function (ul) {
      ul.innerHTML = '';

      facilities.forEach(function (facility) {
        var name = self.cleanText(facility.name);
        if (!name) return;

        var images = self.getSelectedImages(facility.images || []);
        if (!images.length && facility.images) images = facility.images.slice();
        var image = images[0];

        var li = document.createElement('li');
        if (currentId && facility.id === currentId) li.className = 'on';

        var link = document.createElement('a');
        link.href = './facility.html?id=' + facility.id;

        var img = document.createElement('div');
        img.className = 'img';
        self.setBackground(img, image && image.url, '부대시설 이미지');
        img.style.backgroundPosition = '50% 100%';

        var p = document.createElement('p');
        p.textContent = name;

        li.appendChild(link);
        li.appendChild(img);
        var nameEn = self.cleanText(facility.nameEn);
        if (nameEn) {
          var span = document.createElement('span');
          span.textContent = nameEn;
          li.appendChild(span);
        }
        li.appendChild(p);
        ul.appendChild(li);
      });

      self.balanceListRows(ul);
    });
  };

  // preview-handler 가 standalone/preview 양쪽 초기화를 담당한다
  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new FacilityMapper();
    mapper.initialize();
    global.specialMapperInstance = mapper;
  });

  global.FacilityMapper = FacilityMapper;
})(window);
