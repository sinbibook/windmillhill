(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function ReservationMapper() {
    BaseDataMapper.call(this);
  }
  ReservationMapper.prototype = Object.create(BaseDataMapper.prototype);
  ReservationMapper.prototype.constructor = ReservationMapper;

  ReservationMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHeroSlides();
    this.mapBookingUrl();
    this.mapSectionTitles();
    this.mapInfo();
    this.mapRefundPolicies();

    if (typeof window.initReservationSwipers === 'function') window.initReservationSwipers();
  };

  // reservation 페이지 섹션 (customFields.pages.reservation.sections[0])
  ReservationMapper.prototype.getSection = function () {
    var page = this.getPages().reservation;
    return (page && page.sections && page.sections[0]) || {};
  };

  // MAPPER: customFields.property.propertyUnameEn / property.nameEn / property.name + [data-property-caption]
  ReservationMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: reservation.hero.images[isSelected] → [data-reservation-hero-slides]
  ReservationMapper.prototype.mapHeroSlides = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);
    if (!images.length && hero.images) images = hero.images.slice();

    var wrapper = document.querySelector('[data-reservation-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '이용안내 대표 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (image) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, image.url, '이용안내 대표 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: property.realtimeBookingId → [data-booking-url]
  ReservationMapper.prototype.mapBookingUrl = function () {
    var url = this.getBookingUrl();
    document.querySelectorAll('[data-booking-url]').forEach(function (el) {
      if (url && url !== '#!') {
        el.href = url;
        el.setAttribute('target', '_blank');
      }
    });
  };

  // MAPPER: reservation.hero.title / reservation.about.title → 본문 섹션 라벨
  ReservationMapper.prototype.mapSectionTitles = function () {
    var section = this.getSection();
    var hero = section.hero || {};
    var about = section.about || {};

    setAllText('[data-reservation-info-title]', this.firstText(hero.title, '기본예약사항'));
    setAllText('[data-reservation-refund-title]', this.firstText(about.title, '환불안내'));
  };

  // MAPPER: property.usageGuide → [data-reservation-info]
  ReservationMapper.prototype.mapInfo = function () {
    var prop = this.getProperty();
    var usageGuide = this.cleanText(prop.usageGuide);

    var self = this;
    document.querySelectorAll('[data-reservation-info]').forEach(function (el) {
      if (!usageGuide) {
        el.innerHTML = '';
        return;
      }
      el.innerHTML = self.nl2br(usageGuide);
    });
  };

  // MAPPER: property.refundPolicies → [data-reservation-refund-policies]
  // 스키마: [{ refundProcessingDays, refundRate }] — 남은 일수별 환불률
  ReservationMapper.prototype.mapRefundPolicies = function () {
    var policies = this.getProperty().refundPolicies || [];
    var notice = this.cleanText((this.getProperty().refundSettings || {}).customerRefundNotice);

    document.querySelectorAll('[data-reservation-refund-policies]').forEach(function (el) {
      el.innerHTML = '';

      if (!policies.length) {
        if (notice) el.textContent = notice;
        return;
      }

      // 이용일에서 먼 날짜부터 (일수 내림차순)
      var sorted = policies.slice().sort(function (a, b) {
        return (b.refundProcessingDays || 0) - (a.refundProcessingDays || 0);
      });

      sorted.forEach(function (p) {
        var days = Number(p.refundProcessingDays) || 0;
        var rate = Number(p.refundRate) || 0;
        var line = document.createElement('p');

        var when = days > 0 ? '이용일 ' + days + '일 전 취소 시' : '이용일 당일 취소 시';
        line.textContent = '* ' + when + ' ' + (rate > 0 ? rate + '% 환불' : '환불 불가');
        el.appendChild(line);
      });

      if (notice) {
        var extra = document.createElement('p');
        extra.innerHTML = '<br />' + notice;
        el.appendChild(extra);
      }
    });
  };

  // preview-handler 가 standalone/preview 양쪽 초기화를 담당한다
  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new ReservationMapper();
    mapper.initialize();
    global.reservationMapperInstance = mapper;
  });

  global.ReservationMapper = ReservationMapper;
})(window);
