(function (global) {
  'use strict';

  function MainMapper() {
    BaseDataMapper.call(this);
  }
  MainMapper.prototype = Object.create(BaseDataMapper.prototype);
  MainMapper.prototype.constructor = MainMapper;

  MainMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapAboutBlocks();
    this.mapClosing();

    if (typeof window.initMainSwipers === 'function') window.initMainSwipers();
  };

  MainMapper.prototype.getSection = function () {
    var page = this.getPages().main;
    return (page && page.sections && page.sections[0]) || {};
  };

  MainMapper.prototype.getAboutBlocks = function () {
    var about = this.getSection().about;
    return Array.isArray(about) ? about : [];
  };

  MainMapper.prototype.getIndexClosing = function () {
    var indexPage = this.getPages().index;
    var section = (indexPage && indexPage.sections && indexPage.sections[0]) || {};
    return section.closing || {};
  };

  MainMapper.prototype.mapPropertyNames = function () {
    var name = this.getPropertyName();
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = name;
    });
    this.applyPropertyCaptions();
  };

  MainMapper.prototype.renderPropertyCaption = function (template) {
    return this.nl2br(
      String(template || '')
        .replace(/\{name\}/g, this.getPropertyName())
        .replace(/\{nameEn\}/g, this.getPropertyNameEn() || this.getPropertyName())
    );
  };

  MainMapper.prototype.mapClosing = function () {
    var closing = this.getIndexClosing();
    var fallback = '편안함과 즐거움이 있는 곳,\n{name}에 오신 것을 환영합니다.';
    var desc = this.firstText(closing.description, fallback);

    document.querySelectorAll('[data-main-closing-description]').forEach(
      function (el) {
        el.innerHTML = this.renderPropertyCaption(desc);
      }.bind(this)
    );
  };

  MainMapper.prototype.mapHero = function () {
    var section = this.getSection();
    var hero = section.hero || {};
    var images = this.getSelectedImages(hero.images || []);
    if (!images.length) images = this.getLandscapeImages();

    var wrapper = document.querySelector('[data-main-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '펜션소개 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(
      function (img) {
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';
        this.setBackground(slide, img.url, '펜션소개 이미지');
        wrapper.appendChild(slide);
      }.bind(this)
    );
  };

  MainMapper.prototype.mapAboutBlocks = function () {
    var self = this;
    var section = this.getSection();
    var hero = section.hero || {};
    var blocks = this.getAboutBlocks();
    var fallbackImages = this.getLandscapeImages();
    var isFallbackBlock = false;
    var isPreviewMode = window.parent !== window;
    var nameEn = this.firstText(this.getPropertyNameEn(), this.getPropertyName(), 'Pension');
    var bookingUrl = this.getBookingUrl();

    if (!blocks.length) {
      isFallbackBlock = true;
      blocks = [
        {
          title: self.firstText(hero.title, 'About'),
          description: self.firstText(hero.description, self.getProperty().subtitle),
          images: fallbackImages
        }
      ];
    }

    document.querySelectorAll('[data-main-about-blocks]').forEach(function (container) {
      container.innerHTML = '';

      blocks.forEach(function (block, index) {
        var title = self.firstText(block && block.title, index === 0 ? hero.title : '');
        var desc = self.firstText(block && block.description, index === 0 ? hero.description : '');
        var images = self.getSelectedImages((block && block.images) || []);
        if (!images.length && isFallbackBlock) images = fallbackImages;

        var textBox = document.createElement('div');
        textBox.className = 'sub_txt_box';
        textBox.setAttribute('data-generated', 'main-about');
        // 블록 순번. 필기체 워터마크(.txt:before)를 블록별로 바꾸는 CSS 훅이다.
        // 갤러리(.sub_inner)가 이미지 없으면 생성되지 않아 nth-of-type 으로는 셀 수 없다.
        textBox.setAttribute('data-block-index', String(index));

        var inner = document.createElement('div');
        inner.className = 'sub_inner';

        var subTitle = document.createElement('div');
        subTitle.className = 'sub_title';

        // 아이브로우: 원본은 블록마다 문구가 다르지만(Memories / Welcome to / Travel With)
        // main.about[] 스키마에 담을 필드가 없어 'Welcome to {nameEn}' 으로 통일한다.
        var eyebrow = document.createElement('span');
        eyebrow.textContent = 'Welcome to ' + nameEn;

        var h3 = document.createElement('h3');
        h3.className = 'main_block_title';
        h3.textContent = title || 'About';

        subTitle.appendChild(eyebrow);
        subTitle.appendChild(h3);

        // 리드문: 첫 블록에만 h3 아래 <p> 로 붙인다.
        // desc(.txt 본문)와 같은 문장이면 중복이라 생략한다.
        if (index === 0) {
          var lead = self.cleanText(hero.description);
          if (lead && lead !== self.cleanText(desc)) {
            var leadP = document.createElement('p');
            leadP.innerHTML = self.nl2br(lead);
            subTitle.appendChild(leadP);
          }
        }

        var box = document.createElement('div');
        box.className = 'box';

        var imageWrap = document.createElement('div');
        imageWrap.className = 'img';
        var image = document.createElement('img');
        if (images.length) {
          image.src = images[0].url;
          image.alt = title || '펜션소개 이미지';
        } else {
          ImageHelpers.applyPlaceholder(image, '펜션소개 이미지');
        }
        imageWrap.appendChild(image);

        var txt = document.createElement('div');
        txt.className = 'txt';
        if (desc) txt.innerHTML = self.nl2br(desc);

        // 장식 문구: 전 페이지 공통 문장이라 하드코딩한다(이름만 치환).
        var decoration = document.createElement('span');
        decoration.innerHTML =
          'All seasons of the year are beautiful here. ' +
          nameEn +
          '<br>I give you a gift for your life.';
        txt.appendChild(decoration);

        // 예약 버튼: 원본은 블록마다 유무가 제각각이라 템플릿은 "첫 블록에만" 으로 규칙을 고정한다.
        if (index === 0 && bookingUrl && bookingUrl !== '#!') {
          var bookingLink = document.createElement('a');
          bookingLink.className = 'btn_reserve';
          bookingLink.href = bookingUrl;
          bookingLink.target = '_blank';
          bookingLink.textContent = '→ 예약하기 바로가기';
          txt.appendChild(bookingLink);
        }

        box.appendChild(imageWrap);
        box.appendChild(txt);
        inner.appendChild(subTitle);
        inner.appendChild(box);
        textBox.appendChild(inner);
        container.appendChild(textBox);

        var galleryWrap = document.createElement('div');
        galleryWrap.className = 'sub_inner';
        galleryWrap.setAttribute('data-generated', 'main-about');
        var gallery = document.createElement('ul');
        gallery.className = 'about_img';

        var galleryImages = images.length > 1 ? images.slice(1, 5) : images.slice(0, 4);

        if (!galleryImages.length && isPreviewMode) {
          galleryImages = [null, null, null, null];
        }

        if (galleryImages.length) {
          galleryImages.forEach(function (img, imgIndex) {
            var li = document.createElement('li');
            self.setBackground(li, img && img.url, '외부풍경 ' + (imgIndex + 1));
            gallery.appendChild(li);
          });

          galleryWrap.appendChild(gallery);
          container.appendChild(galleryWrap);
        }
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new MainMapper();
    mapper.initialize();
    global.mainMapperInstance = mapper;
  });

  global.MainMapper = MainMapper;
})(window);
