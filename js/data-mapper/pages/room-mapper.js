(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function RoomMapper() {
    BaseDataMapper.call(this);
  }
  RoomMapper.prototype = Object.create(BaseDataMapper.prototype);
  RoomMapper.prototype.constructor = RoomMapper;

  RoomMapper.prototype.mapPage = function () {
    var roomtype = this.getCurrentRoomtype();
    var room = roomtype ? this.findRoomById(roomtype.id) : null;
    // roomtype_interior 는 히어로 슬라이더 / 상세 이미지 블록 / 4장 갤러리가 나눠 쓴다
    var interiors = roomtype ? this.getRoomtypeImages(roomtype, 'roomtype_interior') : [];

    this.mapPropertyNames();
    this.mapRoomInfo(roomtype, room);
    this.mapHeroSlides(roomtype, interiors);
    this.renderRoomNav('[data-room-list-nav]', roomtype && roomtype.id);
    this.mapBookingUrl();
    this.mapDetailHeading(roomtype);
    this.mapDetailBlocks(roomtype, interiors);
    this.mapWideImage(roomtype);
    this.mapFloorplan(roomtype);
    // 하단 Room Preview 슬라이더 (원본 room_list_sld: 데스크톱 4장)
    this.mapIndexRoomHeading();
    this.renderRoomSlides('[data-room-list-slides]');

    if (typeof window.initRoomSwipers === 'function') window.initRoomSwipers();
  };

  // 현재 객실타입: URL ?room_id= (preview 는 ?id= 호환), 없으면 첫 번째
  RoomMapper.prototype.getCurrentRoomtype = function () {
    var roomtypes = this.getRoomtypes();
    if (!roomtypes.length) return null;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('room_id') || params.get('id');
    if (!id) return roomtypes[0];

    var matched = roomtypes.filter(function (rt) {
      return String(rt.id) === String(id);
    })[0];
    return matched || roomtypes[0];
  };

  // MAPPER: customFields.property.propertyUnameEn / property.nameEn / property.name + [data-property-caption]
  RoomMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: 객실명 / 인원 / 유형 / 평형 / 집기품목 (PC + 모바일 표 양쪽)
  RoomMapper.prototype.mapRoomInfo = function (roomtype, room) {
    setAllText('[data-room-name]', this.getRoomtypeName(roomtype));
    setAllText('[data-room-structure]', this.formatRoomStructure(room));
    setAllText('[data-room-base-occupancy]', (room && room.baseOccupancy) || '');
    setAllText('[data-room-max-occupancy]', (room && room.maxOccupancy) || '');
    // rooms[].size 는 ㎡ → 평 환산해 노출한다
    setAllText('[data-room-size-pyeong]', this.toPyeong(room && room.size));

    var amenities = (room && room.amenities) || [];
    setAllText('[data-room-amenities]', amenities.join(', '));
  };

  // MAPPER: roomtypes[current] interior 전체 → [data-room-hero-slides] (배경 슬라이드)
  RoomMapper.prototype.mapHeroSlides = function (roomtype, interiors) {
    var self = this;
    var images = interiors.slice();

    // interior 가 없으면 thumbnail 로 폴백
    if (!images.length && roomtype) {
      images = this.getRoomtypeImages(roomtype, 'roomtype_thumbnail');
    }

    var wrapper = document.querySelector('[data-room-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '객실 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '객실 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: property.realtimeBookingId → [data-booking-url]
  RoomMapper.prototype.mapBookingUrl = function () {
    var url = this.getBookingUrl();
    document.querySelectorAll('[data-booking-url]').forEach(function (el) {
      if (url && url !== '#!') {
        el.href = url;
        el.setAttribute('target', '_blank');
      }
    });
  };

  // 고정 슬롯에 이미지를 순서대로 채운다.
  // 이미지가 모자라면 앞에서부터 순환해 빈 칸을 남기지 않는다.
  RoomMapper.prototype.fillSlots = function (selector, images, offset, label) {
    var self = this;
    document.querySelectorAll(selector).forEach(function (container) {
      var slots = container.classList.contains('img')
        ? [container]
        : Array.prototype.slice.call(container.children);

      slots.forEach(function (slot, i) {
        var pool = images.slice(offset).concat(images);
        self.setBackground(slot, pool[i] ? pool[i].url : '', label);
      });
    });
  };

  /**
   * 원본 상세 블록의 "자리별" 이미지. 크롤러가 roomtype_exterior 에
   * [0]좌 [1]우 [2..5]그리드 [6]와이드 순서로 담는다 (순서가 곧 자리다).
   * 비어 있으면 빈 배열 → 호출부가 기존 interior 위치 기반 로직으로 폴백한다.
   */
  RoomMapper.prototype.getRoomDetailSlots = function (roomtype) {
    if (!roomtype) return [];
    return this.getRoomtypeImages(roomtype, 'roomtype_exterior') || [];
  };

  RoomMapper.prototype.getRoomDetailImages = function (roomtype, interiors) {
    var images = interiors.slice();
    if (!images.length && roomtype) {
      images = this.getRoomtypeImages(roomtype, 'roomtype_thumbnail');
    }
    return images;
  };

  // MAPPER: DBFF 원본 상세 구성 — 본문 2장 + 하단 4장 갤러리.
  // 4장 갤러리는 이미지가 더 많아도 원본 레이아웃과 같이 최대 4장만 노출한다.
  // MAPPER: pages.room[current].sections[0].hero → "Rooms Detail" 머리말
  // 원본 객실상세의 .sub_txt_box .sub_title 자리다. 값이 없으면 기존 기본 문구로 떨어진다.
  RoomMapper.prototype.mapDetailHeading = function (roomtype) {
    var self = this;
    var pages = this.getPages();
    var list = Array.isArray(pages.room) ? pages.room : [];
    var id = roomtype && roomtype.id;
    var entry = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && String(list[i].id) === String(id)) { entry = list[i]; break; }
    }
    var hero = (entry && entry.sections && entry.sections[0] && entry.sections[0].hero) || {};

    setAllText('[data-room-detail-title]', this.firstText(hero.title, 'Rooms Detail'));

    var desc = this.firstText(hero.description, '{name}의 객실을 만나보세요.');
    document.querySelectorAll('[data-room-detail-description]').forEach(function (el) {
      el.innerHTML = self.nl2br(
        String(desc)
          .replace(/\{name\}/g, self.getPropertyName())
          .replace(/\{nameEn\}/g, self.getPropertyNameEn())
      );
    });
  };

  RoomMapper.prototype.mapDetailBlocks = function (roomtype, interiors) {
    var self = this;
    var images = this.getRoomDetailImages(roomtype, interiors);
    var slots = this.getRoomDetailSlots(roomtype);
    var propNameEn = this.getPropertyNameEn();
    var detailCopy = this.cleanText((images[0] && images[0].description) || roomtype.description);

    setAllText(
      '[data-room-detail-eyebrow]',
      propNameEn ? 'Memories ' + propNameEn : 'Memories Pension'
    );
    // 원본 .txt > span 은 main / nearby 와 같은 2줄 장식 문구다 (이름만 치환).
    // 예약/객실 설명이 아니라서 "…에서 편안한 휴식을 만나보세요" 같은 문장을 지어내지 않는다.
    var decoration =
      'All seasons of the year are beautiful here. ' +
      this.firstText(propNameEn, this.getPropertyName()) +
      '<br>I give you a gift for your life.';
    document.querySelectorAll('[data-room-detail-copy]').forEach(function (el) {
      el.innerHTML = detailCopy ? self.nl2br(detailCopy) : decoration;
    });

    document.querySelectorAll('[data-room-detail-main-image]').forEach(function (el) {
      var img = slots[0] || images[0];
      if (!img || !img.url) {
        ImageHelpers.applyPlaceholder(el, '객실 이미지');
        return;
      }
      el.src = img.url;
      el.alt = self.cleanText(img.description) || '객실 이미지';
    });

    document.querySelectorAll('[data-room-detail-side-image]').forEach(function (el) {
      var img = slots[1] || images[1] || images[0];
      if (!img || !img.url) {
        ImageHelpers.applyPlaceholder(el, '객실 이미지');
        return;
      }
      el.src = img.url;
      el.alt = self.cleanText(img.description) || '객실 이미지';
    });

    document.querySelectorAll('[data-room-quad-images]').forEach(function (container) {
      container.innerHTML = '';
      var quad = slots.length > 2 ? slots.slice(2, 6) : images.slice(0, 4);
      quad.forEach(function (img) {
        var li = document.createElement('li');
        self.setBackground(li, img && img.url, '객실 이미지');
        container.appendChild(li);
      });

      if (!container.children.length) {
        for (var i = 0; i < 4; i++) {
          var empty = document.createElement('li');
          ImageHelpers.applyBackgroundPlaceholder(empty, '객실 이미지');
          container.appendChild(empty);
        }
      }
    });
  };

  // MAPPER: roomtype_exterior[6] → [data-room-wide-image]
  // 원본에 이 영역이 없는 사이트도 있다 → 이미지가 없으면 섹션째 숨긴다.
  RoomMapper.prototype.mapWideImage = function (roomtype) {
    var section = document.querySelector('[data-room-wide-section]');
    if (!section) return;
    var wide = this.getRoomDetailSlots(roomtype)[6];
    if (!wide || !wide.url) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    var self = this;
    section.querySelectorAll('[data-room-wide-image]').forEach(function (el) {
      el.src = wide.url;
      el.alt = self.cleanText(wide.description) || '객실 이미지';
    });
  };

  // MAPPER: roomtypes[current] 평면도 크롤링 이미지 → [data-room-floorplan-image]
  // 이미지가 없으면 평면도 섹션 전체 미노출.
  RoomMapper.prototype.mapFloorplan = function (roomtype) {
    var section = document.querySelector('[data-room-floorplan-section]');
    if (!section) return;

    var imgEl = section.querySelector('[data-room-floorplan-image]');
    var image = this.getRoomFloorplanImage(roomtype);
    if (!image || !image.url) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    if (imgEl) {
      imgEl.src = image.url;
      imgEl.alt = this.cleanText(image.description) || '객실 평면도';
    }
  };

  // preview-handler 가 standalone/preview 양쪽 초기화를 담당한다
  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new RoomMapper();
    mapper.initialize();
    global.roomMapperInstance = mapper;
  });

  global.RoomMapper = RoomMapper;
})(window);
