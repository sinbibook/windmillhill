(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function DirectionsMapper() {
    BaseDataMapper.call(this);
  }
  DirectionsMapper.prototype = Object.create(BaseDataMapper.prototype);
  DirectionsMapper.prototype.constructor = DirectionsMapper;

  DirectionsMapper.KAKAO_MAP_ZOOM_LEVEL = 4;
  DirectionsMapper.SDK_WAIT_INTERVAL = 100;

  DirectionsMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHeroImage();
    this.mapBodyTitle();
    this.mapAddress();
    this.mapNotice();
    this.mapKakaoMap();
  };

  // directions 페이지 섹션 (customFields.pages.directions.sections[0])
  DirectionsMapper.prototype.getSection = function () {
    var page = this.getPages().directions;
    return (page && page.sections && page.sections[0]) || {};
  };

  // MAPPER: customFields.property.propertyUnameEn / property.nameEn / property.name + [data-property-caption]
  DirectionsMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: directions.hero.images[isSelected][0] → [data-directions-hero-bg]
  DirectionsMapper.prototype.mapHeroImage = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);
    if (!images.length && hero.images) images = hero.images.slice();
    var image = images[0] || null;

    document.querySelectorAll('[data-directions-hero-bg]').forEach(function (el) {
      self.setBackground(el, image && image.url, '오시는길 대표 이미지');
    });
  };

  // MAPPER: directions.hero.title → 본문 위치안내
  DirectionsMapper.prototype.mapBodyTitle = function () {
    var hero = this.getSection().hero || {};
    var title = this.firstText(hero.title, '위치안내');

    setAllText('[data-directions-body-title]', title);
  };

  // MAPPER: property.address → [data-property-address]
  DirectionsMapper.prototype.mapAddress = function () {
    var address = this.cleanText(this.getProperty().address);
    document.querySelectorAll('[data-property-address]').forEach(function (el) {
      el.textContent = address || '';
      el.style.display = address ? '' : 'none';
    });
  };

  // MAPPER: directions.notice.title / .description → [data-directions-notice]
  // notice 가 배열로 오는 경우도 있어 설명을 합쳐 노출한다.
  DirectionsMapper.prototype.mapNotice = function () {
    var self = this;
    var notice = this.getSection().notice;
    var list = Array.isArray(notice) ? notice : notice ? [notice] : [];
    var property = this.getProperty();
    var address = this.cleanText(property.address);

    var firstTitle = '';
    var descriptions = [];

    list.forEach(function (item) {
      var title = self.cleanText(item && item.title);
      var desc = self.cleanText(item && item.description);
      if (!firstTitle && title) firstTitle = title;
      if (desc) descriptions.push(desc);
    });

    if (!descriptions.length && address) {
      descriptions.push(
        '※ 네비게이션에 아래 주소를 입력해주세요.\n도로명주소 : ' + address
      );
    }

    setAllText('[data-directions-notice-title]', firstTitle || '자가용 이용시');

    document.querySelectorAll('[data-directions-notice]').forEach(function (dl) {
      dl.innerHTML = descriptions.length ? self.nl2br(descriptions.join('\n\n')) : '';
      dl.style.display = descriptions.length ? '' : 'none';
    });
  };

  // MAPPER: property.latitude / property.longitude → 카카오 지도 + 마커
  // 원본은 daum roughmap 임베드(고정 key)였으나 좌표 기반 SDK 로 교체했다.
  DirectionsMapper.prototype.mapKakaoMap = function () {
    var property = this.getProperty();
    var container = document.getElementById('kakao-map');
    if (!container) return;

    // 좌표가 없어도 영역은 그대로 둔다.
    // CSS(.sub_map .map_box #kakao-map)가 높이와 배경색을 갖고 있어
    // 지도가 안 그려져도 자리가 유지된다 (지도 렌더 시 타일이 덮음).
    if (!property.latitude || !property.longitude) return;

    var self = this;
    var createMap = function () {
      try {
        var position = new kakao.maps.LatLng(property.latitude, property.longitude);

        // 백오피스 preview 는 데이터가 바뀔 때마다 mapPage() 를 다시 부른다.
        // 그때마다 new kakao.maps.Map() 을 만들면 인스턴스가 쌓이므로,
        // 이미 만들어 둔 지도가 있으면 중심/마커만 옮긴다.
        if (self._kakaoMap) {
          self._kakaoMap.setCenter(position);
          self._kakaoMap.relayout();
          if (self._kakaoMarker) self._kakaoMarker.setPosition(position);
          return;
        }

        self._kakaoMap = new kakao.maps.Map(container, {
          center: position,
          level: DirectionsMapper.KAKAO_MAP_ZOOM_LEVEL,
          scrollwheel: false,
          draggable: false
        });
        self._kakaoMarker = new kakao.maps.Marker({ position: position });
        self._kakaoMarker.setMap(self._kakaoMap);

        // preview 는 iframe 크기가 바뀔 수 있어 리사이즈 시 재배치한다
        window.addEventListener('resize', function () {
          if (self._kakaoMap) {
            self._kakaoMap.relayout();
            self._kakaoMap.setCenter(position);
          }
        });
      } catch (error) {
        console.error('Failed to create Kakao Map:', error);
      }
    };

    // SDK 로드 확인 및 재시도 (최대 2초)
    var checkSdkAndLoad = function (retryCount) {
      retryCount = retryCount || 0;
      var MAX_RETRIES = 20;
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(createMap);
      } else if (retryCount < MAX_RETRIES) {
        setTimeout(function () {
          checkSdkAndLoad(retryCount + 1);
        }, DirectionsMapper.SDK_WAIT_INTERVAL);
      } else {
        console.error('Failed to load Kakao Map SDK after multiple retries.');
      }
    };

    checkSdkAndLoad();
  };

  // preview-handler 가 standalone/preview 양쪽 초기화를 담당한다
  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new DirectionsMapper();
    mapper.initialize();
    global.directionsMapperInstance = mapper;
  });

  global.DirectionsMapper = DirectionsMapper;
})(window);
