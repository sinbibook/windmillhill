# Data Mapping 정의서 — t-template-B

`standard-template-data.json` 기준 HTML의 `data-*` 속성 매핑 정의.

원본 디자인: [collineps.com](https://collineps.com/index.html)

> 현재 구현 범위: 공통 구조 / `common/header.html` / `common/footer.html` / `index.html` / `main.html` / `layout-map.html` / `room.html` / `facility.html` / `reservation.html` / `nearby-attractions.html` / `directions.html` / `404.html`
> 이후 구현 예정: `special` / `reservation` / `directions` / `nearby-attractions` / `404`

---

## 구현 원칙

- 파일명과 JS 구조는 우리 템플릿 구조를 따른다. 원본 `about.html`, `view.html`, `travel.html`, `traffic.html`, `special1~4.html` 파일명은 쓰지 않는다.
- 페이지 링크는 GitHub Pages 하위 경로 배포를 위해 상대경로(`./xxx.html`)만 쓴다.
- 이미지·아이콘 등 템플릿 고정 에셋은 `images/`에 둔다. 원본 사이트 도메인 직접 참조 금지.
- 로고 이미지는 고정 저장하지 않는다. `homepage.images[0].logo[isSelected]`를 동적으로 렌더하고, 없으면 숙소명 텍스트로 fallback 한다.
- 각 페이지 mapper는 `js/preview-handler.js`에 등록한다.
- 초기화 주체는 `preview-handler.js`다. 페이지 mapper의 `DOMContentLoaded` 초기화는 `if (window.previewHandler) return;`로 빠진다.
- 렌더 게이트는 각 HTML `<head>`의 `html.tpl-loading body{opacity:0}` + `window.__tplReveal`로 처리한다.
- 객실 목록의 단일 소스는 `homepage.customFields.roomtypes`다. `rooms[]`는 같은 `id`의 상세값 조회에만 쓴다.

---

## 원본 페이지 → 템플릿 파일명

| 원본                 | 템플릿                    |
| -------------------- | ------------------------- |
| `index.html`         | `index.html`              |
| `about.html`         | `main.html`               |
| `view.html`          | `main.html` 본문으로 병합 |
| `room.html` 목록     | `layout-map.html`         |
| `room.html?room_id=` | `room.html?room_id=`      |
| `special1~4.html`    | `facility.html?id=`       |
| `reservation.html`   | `reservation.html`        |
| `travel.html`        | `nearby-attractions.html` |
| `traffic.html`       | `directions.html`         |

### main.html 규칙

- 메뉴명은 `펜션소개`로 유지한다.
- 내부 내용은 원본 `view.html`의 외부풍경 구조를 유지한다.
- 원본의 `Landscape` 같은 하드코딩 타이틀은 페이지 성격에 맞춰 `About` 계열 하드코딩으로 바꾼다.
- `main.about[]` 블록은 1개로 제한하지 않는다. 백오피스에서 블록이 여러 개 내려오면 순서대로 모두 노출한다.
- custom field로 바뀌는 제목/설명은 필기체를 쓰지 않는다. 필기체는 `.sub_txt_box .box .txt:before`의 하드코딩 `About` 장식에만 유지한다.
- 아이브로우(`Welcome to {nameEn}`)와 장식 문구(`All seasons of the year...`)는 스키마에 대응 필드가 없어 하드코딩하고 이름만 치환한다.
- 예약 버튼은 원본이 페이지마다 제각각이라 템플릿 규칙으로 **첫 블록에만** 노출한다.

### layout-map.html 규칙

- 이 페이지는 **객실 목록 + 배치도** 페이지다.
- 객실 목록은 `homepage.customFields.roomtypes[]`로 렌더한다.
- `roomtypes[].groupName` 이 있으면 객실 목록/메뉴를 그룹 단위로 렌더한다. 아래 **「객실 그룹 규칙」** 참고.
- 배치도는 `pages.layoutMap.sections[0].about.images[isSelected]` 전체를 `<img>`로 렌더한다.
- 배치도 이미지가 여러 장이면 선택 이미지 전체를 순서대로 모두 노출한다.
- 도면 이미지는 크롭하지 않고 원본 비율을 유지한다.

---

## 테마 색상/폰트

소스는 `styles/theme.css`의 `:root` 변수다. B는 원본 collineps의 실제 컬러/폰트를 아래 5개 토큰으로 정리한다.

| CSS 변수            | 기본값                   | 원본 역할                                |
| ------------------- | ------------------------ | ---------------------------------------- |
| `--color-primary`   | `#def1f9`                | 메인 Memories/Healing 배너의 하늘색 배경 |
| `--color-secondary` | `#f89725`                | 테이블 상단선 등 포인트 색               |
| `--font-en-main`    | `'Parisienne', cursive`  | 대표 장식 영문/필기체                    |
| `--font-ko-main`    | `'Noto Serif KR', serif` | 한글 강조/세리프 타이틀                  |
| `--font-ko-sub`     | `'Noto Sans KR', ...`    | 본문, 메뉴, 푸터                         |

필기체 사용 규칙:

- custom field로 바뀌는 텍스트에는 필기체를 적용하지 않는다.
- 필기체는 원본에서 하드코딩된 장식 텍스트에만 쓴다.
- B의 `--font-en-main`은 필기체 기본값으로 유지하되, CSS 적용 대상은 하드코딩 장식 슬롯으로 제한한다.

원본 보조 폰트:

- `Comfortaa`: 메뉴 영문/eyebrow
- `Cinzel`: `Room Preview`, `SPECIAL`, `Beautiful Healing Place` 같은 구조적 영문 타이틀
- `Meie Script`: 서브 장식 워터마크

`#333`, `#666`, `#fff`, `#eee`, `#ddd` 같은 중립 UI 색상은 원본 디자인의 고정 중립색으로 남긴다. 브랜드/배경/포인트 성격의 색과 주요 폰트만 CSS 변수로 연결한다.

---

## common/header.html

| data-* 속성                 | 요소                          | JSON 경로                                                                                |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `data-logo-image`           | 헤더 로고 `<img>`             | `homepage.images[0].logo[isSelected].url`                                                |
| `data-property-name`        | 로고 텍스트 fallback          | `customFields.property.name → property.name`                                             |
| `data-property-name-en`     | 필요 시 영문명 슬롯           | `getPropertyNameEn()`                                                                    |
| `data-rooms-submenu`        | ROOMS 하위 메뉴               | `homepage.customFields.roomtypes[]`                                                      |
| `data-special-submenu`      | SPECIAL 하위 메뉴             | `property.facilities[]`                                                                  |
| `data-ybs-button`           | 헤더/푸터 야놀자 YBS 버튼     | `property.ybsId → https://www.yapen.co.kr/external?ypIdx={ybsId}`, 없으면 헤더 버튼 숨김 |
| `data-booking-link`         | 헤더 특가/예약 버튼, 예약하기 | `property.realtimeBookingId`                                                             |
| `data-homepage-socialLinks-blog` | 헤더 네이버 버튼 (PC/모바일) | `homepage.socialLinks.blog` → href, 값 없으면 `[data-social-wrap]` 째 숨김 (기본 숨김) |
| `data-homepage-socialLinks-instagram` | 헤더 인스타그램 버튼 (PC/모바일) | `homepage.socialLinks.instagram` → href, 값 없으면 `[data-social-wrap]` 째 숨김 (기본 숨김) |
| `data-travel-menu`          | TRAVEL 메뉴                   | `nearbyAttractions.sections[0].enabled === false`면 숨김                                 |
| `data-menu-id="layout-map"` | ROOMS 미리보기 메뉴           | `layoutMap.sections[0].enabled === false`(또는 섹션 없음)면 숨김                         |
| `data-rooms-link`           | 대메뉴 ROOMS 링크             | `layoutMap.sections[0].enabled` — 켜짐 → `layout-map.html` / 꺼짐 → 첫 객실 상세         |

소셜 링크 (`HeaderFooterMapper.mapSocialLinks`):

```
homepage.socialLinks = { facebook, instagram, blog, youtube }  (값 없으면 null)
[data-homepage-socialLinks-{platform}] 에 href 주입 + 노출, 값 없으면(null/빈 문자열/키 없음) 숨김
헤더 hd_right(PC/모바일) 맨 앞에 네이버(blog) → 인스타그램(instagram) 순으로 둔다
네이버는 원본 nrbr.kr 과 같고, 인스타그램은 원본에 없어 네이버 버튼과 같은 모양(로고 이미지 35px)을 쓴다
네이버 버튼은 어드민 blog 칸의 값(네이버 플레이스 주소)을 쓴다
프리뷰 section_update(section: 'socialLinks') → homepage.socialLinks 로 반영 후 다시 매핑
```

로고 처리:

```
homepage.images[0].logo[isSelected] 있으면 img 표시
없으면 img 숨김 + property.name 텍스트 표시
```

---

## common/footer.html

| data-* 속성                   | 요소             | JSON 경로                                         |
| ----------------------------- | ---------------- | ------------------------------------------------- |
| `data-footer-phone`           | 전화번호 텍스트  | `property.contactPhone[]` 또는 `property.phone[]` |
| `data-footer-phone-link`      | 전화번호 링크    | `property.contactPhone[]` 또는 `property.phone[]` |
| `data-footer-address`         | 주소             | `property.businessInfo.businessAddress`           |
| `data-footer-representative`  | 대표자           | `property.businessInfo.representativeName`        |
| `data-footer-business-name`   | 업체명           | `property.businessInfo.businessName`              |
| `data-footer-business-number` | 사업자번호       | `property.businessInfo.businessNumber`            |
| `.privacy`                    | 개인정보처리방침 | 정적 — `http://design.trip11.net/privacy/privacy_policy.html` (원본과 동일) |
| `data-ybs-button`             | 야놀자 YBS       | `property.ybsId` (없으면 `data-ybs-wrap` `<p>` 째 숨김) |
| `data-booking-link`           | 모바일 예약 버튼 | `property.realtimeBookingId`                      |
| `.copy`                       | 카피라이트       | `property.tripProviderName` → 없으면 정적 문구 |

카피라이트 색상은 주소/업체정보와 같은 `#9c9c9c` 계열로 맞춘다.

---

## index.html

| data-* 속성                       | 요소                           | JSON 경로                                                                    |
| --------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `data-index-hero-slides`          | `.main_visual .swiper-wrapper` | `pages.index.sections[0].hero.images[isSelected]`                            |
| `data-index-hero-logo`            | 히어로 가운데 로고 `.visual_img` | `index.essence.images[isSelected][0]` — 없으면 숨김 (아래 "히어로 로고" 참조) |
| `data-index-eyebrow`              | 섹션 eyebrow                   | `WELCOME TO {nameEn}` fallback `WELCOME TO PENSION`                          |
| `data-index-room-title`           | Room Preview 제목              | `index.essence.title → Room Preview`                                         |
| `data-index-room-description`     | Room Preview 설명              | `index.essence.description → 편안함과 즐거움이 있는 곳, {name}`              |
| `data-index-room-slides`          | Room Preview 슬라이더          | `homepage.customFields.roomtypes[]`                                          |
| `data-index-memories-title`       | Memories 제목                  | `index.closing.title → Memories`                                             |
| `data-index-memories-description` | Memories 설명                  | `index.gallery.description → index.closing.description → 기본 문구`          |
| `data-index-memories-images`      | Memories 3분할 이미지          | `index.closing.images[isSelected] → 외경/객실 이미지 pool`                   |
| `data-index-landscape-title`      | Healing Place 제목             | `index.gallery.title → Beautiful Healing Place`                              |
| `data-index-landscape-slides`     | Healing Place 슬라이더         | `index.gallery.images[isSelected] → main.about[].images → roomtype_interior` |
| `data-index-special-title`        | SPECIAL 제목                   | `index.signature.title → SPECIAL`                                            |
| `data-index-special-list`         | SPECIAL 원형 카드              | `property.facilities[]`                                                      |
| `#popup-container`                | 팝업                           | `homepage.customFields.popup.popups[]`                                       |

히어로 영역은 이전 결정대로 텍스트 오버레이 없이 이미지 전용으로 사용한다. 따라서 `index.hero.title`, `index.hero.description`은 데이터에 있어도 화면에는 노출하지 않고 `index.hero.images`만 매핑한다. `index.gallery.description`은 오른쪽 Healing Place 타이틀/이미지와 같은 섹션 설명으로 보고 Memories 설명 자리에 우선 매핑한다. `index.signature.description`처럼 원본 디자인에 대응 영역이 없는 설명값은 화면에 새 영역을 만들지 않는다. 배경 장식용 필기체 텍스트는 정적 텍스트로 유지한다.

### 히어로 로고 — `index.essence` 이미지 칸

원본 히어로 가운데에 로고 이미지(`.main_visual_box .visual_img img`, windmillhill `title.png`)가 있는 숙소는 크롤러가 그 이미지를 `index.essence.images` 에 넣는다.
B형은 `essence` 의 제목·설명(Room Preview)만 쓰고 이미지 칸이 비어 있어 히어로 로고 칸으로 빌린다 (A형 히어로 로고와 같은 방식).
선택된 이미지가 있으면 히어로 가운데에 띄우고, 없으면 지금처럼 이미지 전용 히어로다.

- **기본정보 로고(`homepage.images[0].logo`)는 헤더 전용이다.** 원본도 헤더 로고(`logo.png` / 모바일 `b_logo.png`)와 히어로 로고(`title.png`)가 다른 파일이다.
- 크기는 원본 그대로: 원래 크기, 좁은 화면에서는 화면 폭의 절반까지 줄어든다 (title.png 450×350 → 375 폭에서 188×146).

### 히어로 버튼

원본 `index.html`처럼 `.main_visual_box .swiper-container` 내부에 Swiper 기본 버튼을 둔다.

```
.swiper-button-prev > images/arrow_left.png
.swiper-button-next > images/arrow_right.png
```

autoplay는 원본과 같이 유지하고, 클릭 시에도 즉시 이전/다음 슬라이드로 이동한다.

### 객실 카드 구조

`BaseDataMapper.renderRoomSlides()`가 생성한다. **그룹 여부와 무관하게 `roomtypes[]` 전체**를 깔고,
카드마다 자기 객실 상세(`./room.html?room_id={id}`)로 연결한다.

노출 장수는 `TplSwiper.roomPerView()` 가 정한다 — 데스크톱 4장이 기본이고
카드가 4개 미만이면 **카드 수만큼만** 보여준다. 한 화면에 다 들어가면 `loop` 를 꺼서
복제 카드가 빈칸을 채우지 않게 한다 (`TplSwiper.shouldLoop()`).

```
roomtypes[i]
- .img: roomtype_thumbnail 첫 장, 없으면 roomtype_interior 첫 장
- strong: roomtypes[i].name → rooms[j].name
- p: formatRoomStructure(rooms[j])
- .btn_more: ./room.html?room_id={id}
```

### Memories / Healing 이미지 pool

```
main.about[].images[isSelected] 평탄화
  → roomtypes[].roomtype_interior
```

중복 URL은 제거한다.

### SPECIAL 카드

```
property.facilities[i]
- .img: facility.images[isSelected][0]
- p: name
- link: ./facility.html?id={id}
```

---

## main.html

원본 `view.html`의 외부풍경 구조를 `main.html`로 구현한다. 메뉴명은 `펜션소개`로 유지한다.

| data-* 속성                     | 요소                               | JSON 경로                                              |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `data-main-hero-slides`         | `.sub_visual_wide .swiper-wrapper` | `main.hero.images[isSelected] → getLandscapeImages()`  |
| `data-main-about-blocks`        | 본문 블록 컨테이너                 | `main.about[]` 전체                                    |
| `data-property-name`            | 하단 Hello 문구                    | `property.name`                                        |
| `data-main-closing-description` | 하단 안내 문구                     | `index.closing.description → 기본 문구`, `{name}` 치환 |

`main.about[]` 블록 내부의 아이브로우/리드문/장식 문구/예약 버튼은 `data-*` 없이 `main-mapper.js`가 직접 생성한다. 아래 **「main.about[] 반복 블록」** 참고.

### 히어로 버튼

원본 `view.html`처럼 `.sub_visual_box .swiper-container` 내부에 Swiper 기본 버튼을 둔다.

```
.swiper-button-prev > images/arrow_left.png
.swiper-button-next > images/arrow_right.png
```

`js/pages/main.js`의 navigation selector는 `.sub_visual_wide .swiper-button-prev/next`를 사용한다. `Landscape` 텍스트를 `About`으로 바꾼 것은 의도된 변경이며, 화살표 버튼 구조와 동작은 원본을 따른다.

### main.about[] 반복 블록

각 `about[i]`마다 아래 구조를 순서대로 생성한다.

```
.sub_txt_box
  .sub_inner
    .sub_title
      span: "Welcome to {nameEn}" 하드코딩
      h3.main_block_title: about[i].title → 첫 블록은 main.hero.title fallback
      p: main.hero.description (첫 블록에만, .txt 본문과 문장이 다를 때만)
    .box
      .img img: about[i].images[isSelected][0]
      .txt: about[i].description → 첫 블록은 main.hero.description fallback
        span: "All seasons of the year are beautiful here. {nameEn}
               I give you a gift for your life." 하드코딩 (모든 블록)
        a.btn_reserve: "→ 예약하기 바로가기" (첫 블록에만, property.realtimeBookingId)

.sub_inner
  ul.about_img
    li: about[i].images[isSelected][1..4] 최대 4장
```

#### 아이브로우(`.sub_title span`)

원본은 블록마다 문구가 다르다(`Memories Evergreen` / `Welcome to Evergreen` / `Travel With Evergreen`). 그런데 `main.about[]` 스키마는 `{ title, description, images }` 뿐이라 블록별 문구를 담을 필드가 없다. 백오피스 스키마를 늘리는 대신 `Welcome to {nameEn}` 하드코딩으로 통일한다. `nameEn`(`property.nameEn`)이 없으면 `Welcome to Pension`.

#### 리드문(`.sub_title p`)

`main.hero.description`을 **첫 블록의 `h3` 아래**에만 `<p>`로 렌더한다. `about[0].description` 이 비어 `.txt` 본문이 `hero.description` 으로 fallback 된 경우에는 같은 문장이 두 번 나오므로 `<p>`를 생략한다.

#### 장식 문구(`.txt span`)

원본은 전 페이지가 같은 문장이고 이름 표기만 다르다. 전형적인 템플릿 장식이므로 하드코딩하고 이름만 치환한다.

```
All seasons of the year are beautiful here. {nameEn}
I give you a gift for your life.
```

#### 예약 버튼(`.txt a.btn_reserve`)

원본은 `about`·객실상세에는 있고 `view`·`travel`에는 없다(주석 처리). 원본이 일관되지 않으므로 템플릿이 규칙을 정한다: **첫 블록에만 노출**한다. 링크는 `property.realtimeBookingId`(`getBookingUrl()`)이며, 값이 URL 형태가 아니라 `#!`로 판정되면 버튼 자체를 렌더하지 않는다.

이미지가 여러 장이면 첫 장은 대표 이미지, 이후 최대 4장만 `about_img` 갤러리에 노출한다. 5번째 이후 이미지는 이 그리드에서 노출하지 않는다. 실제 `about[]` 블록에 이미지가 없으면 다른 블록/외경 이미지를 복사하지 않는다. 대표 이미지는 placeholder로 표시하고, 4장 그리드는 preview에서만 빈 placeholder 4칸을 보여준다. 실사이트에서는 이미지 없는 4장 그리드를 미노출한다. 외경 fallback은 `about[]` 블록 자체가 하나도 없을 때 생성하는 기본 블록에만 사용한다.

---

## layout-map.html

`ROOMS`의 미리보기 페이지다. 객실 목록과 객실 배치도 이미지를 함께 보여준다.

| data-* 속성               | 요소                            | JSON 경로                                                             |
| ------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| `data-layout-map-hero-bg` | `.sub_visual_wide`              | `layoutMap.hero.images[isSelected][0] → property.images[0].thumbnail` |
| `data-room-list-slides`   | `.main_room .swiper-wrapper`    | `roomtypes[]` 전체 (그룹으로 접지 않는다)                             |
| `data-layout-map-wrap`    | `.room_map` 배치도 전체 영역    | 배치도 이미지가 없으면 전체 미노출                                    |
| `data-layout-map-image`   | `.room_map.layout_map_wide img` | `layoutMap.about.images[isSelected]` 전체                             |

히어로는 슬라이더가 아니라 선택 이미지 첫 장만 배경으로 사용한다. 원본 `room.html` 목록 화면처럼 객실명 탭과 별도 배치도 제목은 노출하지 않는다. 배치도는 도면 성격이라 background cover로 자르지 않고 `<img>`로 원본 비율을 유지한다. 선택 이미지가 여러 장이면 `sortOrder` 순서대로 모두 노출한다.

### enabled 체크

`layoutMap.sections[0].enabled === false` **또는 섹션 자체가 없으면** → `404.html` 리다이렉트. 헤더 `미리보기` li 도 같은 기준으로 숨긴다.

**대메뉴 `ROOMS`(`[data-rooms-link]`)는 이 값에 따라 이동처가 갈린다.** — `getRoomsEntryLink()`

| `layoutMap` | ROOMS 클릭 시                                     |
| ----------- | ------------------------------------------------- |
| 켜짐        | `layout-map.html` (객실 목록 + 배치도)            |
| 꺼짐        | 첫 번째 객실 상세 (헤더 객실 메뉴 첫 항목과 같음) |

꺼진 상태에서 그대로 두면 `layout-map.html` 이 404 로 튕긴다. 판정은 이 페이지의 404 기준과 같은
`isLayoutMapEnabled()`(섹션 없음 / `enabled:false` → 꺼짐)를 쓴다. `room.html` 의 객실 탭 첫 칸
`미리보기` 도 꺼져 있으면 숨긴다. 객실이 하나도 없으면 원래 href 를 둔다.

---

## room.html

`?room_id=`가 없으면 첫 번째 객실을 보여준다. 백오피스 preview의 `?id=`도 함께 지원한다.

| data-* 속성                                            | 요소                              | JSON 경로                                                        |
| ------------------------------------------------------ | --------------------------------- | ---------------------------------------------------------------- |
| `data-room-name`                                       | 히어로/타이틀/표                  | `roomtypes[current].name → rooms[j].name`                        |
| `data-room-hero-slides`                                | `.sub_visual_box .swiper-wrapper` | `roomtypes[current].roomtype_interior` 전체                      |
| `data-room-list-nav`                                   | `.sub_cate_wrap ul`               | `roomtypes[]` 동적 생성, 현재 객실 `.on`                         |
| `data-room-base-occupancy` / `data-room-max-occupancy` | 표                                | `rooms[j].baseOccupancy` / `maxOccupancy`                        |
| `data-room-structure`                                  | 표/히어로                         | `formatRoomStructure(rooms[j])`                                  |
| `data-room-size-pyeong`                                | 표                                | `rooms[j].size`를 평으로 환산                                    |
| `data-room-amenities`                                  | 집기품목                          | `rooms[j].amenities.join(', ')`                                  |
| `data-booking-url`                                     | 예약하기 버튼                     | `property.realtimeBookingId`                                     |
| `data-room-detail-eyebrow`                             | 상세 소개 eyebrow                 | `Memories {property.nameEn}`                                     |
| `data-room-detail-main-image`                          | 상세 소개 좌측 이미지             | `roomtype_interior[0] → roomtype_thumbnail[0]`                   |
| `data-room-detail-side-image`                          | 상세 소개 우측 이미지             | `roomtype_interior[1] → [0] → roomtype_thumbnail[0]`             |
| `data-room-detail-copy`                                | 상세 소개 짧은 문구               | `image.description → roomtypes[current].description → 기본 문구` |
| `data-room-quad-images`                                | Room Preview 위 4장 이미지        | `roomtype_interior[0..3]`, 이미지가 많아도 최대 4장만 노출       |
| `data-room-floorplan-section`                          | 객실 평면도 전체 영역             | 평면도 이미지가 없으면 전체 미노출                               |
| `data-room-floorplan-image`                            | 객실 평면도 이미지                | 원본 객실 상세 평면도 영역에서 크롤링된 이미지                   |
| `data-room-list-slides`                                | 하단 Room Preview                 | `roomtypes[]` 공용 객실 카드                                     |

상세 히어로는 원본 `dbffpension.co.kr/room.html?room_id=`처럼 텍스트 오버레이 없이 이미지만 슬라이드한다. 객실명과 객실 탭은 `view_cate_box` 안에서 노출한다.

Room Preview 바로 위의 4장 이미지 영역은 원본의 `.sub_img_box` 2x2 레이아웃이다. 매핑된 객실 이미지가 5장 이상이어도 이 영역에는 앞에서부터 최대 4장까지만 노출한다.

### 객실 평면도

평면도는 일반 이미지 URL만 보고 판단하지 않는다. 크롤러가 원본 객실 상세의 평면도 HTML 영역에서 이미지를 찾았을 때만 아래 중 하나로 저장해야 노출한다.

| 지원 데이터 형태                                                                           | 비고            |
| ------------------------------------------------------------------------------------------ | --------------- |
| `roomtypes[current].floorplanImages[]`                                                     | 권장            |
| `roomtypes[current].floorplans[]`                                                          | 호환            |
| `roomtypes[current].floorplan.images[]`                                                    | 호환            |
| `roomtypes[current].images[].category = "roomtype_floorplan"`                              | 카테고리형 호환 |
| `roomtypes[current].images[].category = "floorplan"` / `"room_floorplan"` / `"floor_plan"` | 카테고리형 호환 |

해당 데이터가 없으면 `data-room-floorplan-section`은 `display:none` 처리한다. `roomtype_interior`, `roomtype_thumbnail`, `roomtype_exterior`, 외부컨셉이미지는 평면도 fallback으로 쓰지 않는다.

---

## facility.html

`?id=`가 없으면 첫 번째 시설을 보여준다. 페이지 파일은 다른 템플릿과 동일하게 `facility.html`을 사용한다.

| data-* 속성                | 요소                               | JSON 경로                                                       |
| -------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `data-special-hero-slides` | `.sub_visual_box .swiper-wrapper`  | `property.facilities[current].images[isSelected]` 전체          |
| `data-special-nav`         | `.view_cate_box .sub_cate_wrap ul` | `property.facilities[]`                                         |
| `data-special-name-en`     | 상세 상단 `h3`                     | `facilities[current].nameEn → name`                             |
| `data-special-name`        | 상세 설명 `em`                     | `facilities[current].name`                                      |
| `data-special-description` | 상세 설명 `p`                      | `facilities[current].description → usageGuide`                  |
| `data-special-images`      | 이미지 그리드                      | `facilities[current].images[1..4]`, 이미지가 1장뿐이면 `[0..3]` |
| `data-special-wide-image`  | 와이드 이미지                      | `facilities[current].images[0]`                                 |
| `data-special-list`        | 하단 SPECIAL 원형 카드             | `property.facilities[]`                                         |

special 상세는 `evergreenpension.co.kr/special6.html` 기준으로, 히어로에는 별도 `visual_title`을 두지 않는다. 시설 탭은 본문 `view_cate_box` 안에 노출한다. 중간 이미지 박스는 최대 4장만 노출하고 빈 placeholder를 만들지 않는다. 1장은 전체폭, 2장은 반반, 3장은 위 2장+아래 1장 전체폭, 4장은 2x2로 표시한다.

---

## reservation.html

| data-* 속성                        | 요소                              | JSON 경로                                                           |
| ---------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `data-reservation-hero-slides`     | `.sub_visual_box .swiper-wrapper` | `pages.reservation.sections[0].hero.images[isSelected]`             |
| `data-booking-url`                 | 예약하기 링크                     | `property.realtimeBookingId`                                        |
| `data-reservation-info-title`      | 기본예약사항 라벨                 | `pages.reservation.sections[0].hero.title → "기본예약사항"`         |
| `data-reservation-info`            | 기본예약사항 `dd`                 | `property.usageGuide`                                               |
| `data-reservation-refund-title`    | 환불안내 라벨                     | `pages.reservation.sections[0].about.title → "환불안내"`            |
| `data-reservation-refund-policies` | 환불안내 `dd`                     | `property.refundPolicies[]` + `refundSettings.customerRefundNotice` |

디자인 구조는 원본 `reservation.html`의 `sub_visual_wide visual`, `visual_title`, `info_box dl > dt.view_cate_box + dd`를 따른다.

---

## nearby-attractions.html

`nearbyAttractions.sections[0].enabled === false`면 `404.html`로 이동한다.

| data-* 속성                    | 요소                              | JSON 경로                                                     |
| ------------------------------ | --------------------------------- | ------------------------------------------------------------- |
| `data-nearby-hero-slides`      | `.sub_visual_box .swiper-wrapper` | `pages.nearbyAttractions.sections[0].hero.images[isSelected]` |
| `data-nearby-attractions-list` | `.sub_cont` 반복 컨테이너         | `pages.nearbyAttractions.sections[0].about[]`                 |

`about[]` 각 항목은 원본 `travel.html`처럼 `.sub_txt_box` 블록으로 반복한다. `block.title`은 관광지명, `block.description`은 설명, `block.images[0]`은 대표 이미지로 매핑한다. 이미지 설명은 출처 문구가 크롤링되어 들어온 경우에만 함께 노출한다.

---

## directions.html

| data-* 속성                    | 요소                                | JSON 경로                                                                           |
| ------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------- |
| `data-directions-hero-bg`      | `.sub_visual_wide` background-image | `pages.directions.sections[0].hero.images[isSelected][0]`                           |
| `data-directions-body-title`   | 본문 `MAP` 아래 설명                | `pages.directions.sections[0].hero.title → "위치안내"`                              |
| `data-property-address`        | 지도 하단 주소                      | `property.address`                                                                  |
| `data-directions-notice-title` | 안내 제목                           | `pages.directions.sections[0].notice.title → "자가용 이용시"`                       |
| `data-directions-notice`       | 안내 내용                           | `pages.directions.sections[0].notice.description → property.address 기반 기본 문구` |
| `#kakao-map`                   | 지도                                | `property.latitude` / `property.longitude`                                          |

원본은 Daum roughmap 고정 key를 쓰지만, 템플릿은 숙소별 좌표 매핑을 위해 기존 A 방식의 Kakao 지도 SDK를 사용한다. 배치는 원본 `traffic.html`의 `sub_map`, `map_box`, `info_box` 구조를 따른다.
히어로는 슬라이더가 아니라 선택 이미지 첫 장만 배경으로 사용한다. `< >` 버튼은 노출하지 않는다.

---

## 객실 그룹 규칙 (`groupName`)

`roomtypes[].groupName` 이 **하나라도 있으면** 그룹 모드로
동작한다. 없으면 객실 하나가 항목 하나다. 규칙은 `base-mapper.js` 한 곳에 있다.

**그룹으로 접히는 곳은 헤더 ROOMS 메뉴와 객실 상세 탭뿐이다.**
Room Preview(미리보기) 카드는 그룹과 무관하게 **항상 전체 객실**을 깐다 — 원본이 그렇다.
(ongdal365 숙박/민박 8실 · jplusps 22실 · orionpoolvilla 20실 모두 미리보기는 개별 객실 전부)

| 함수                     | 역할                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `hasRoomGroups()`        | `groupName` 이 하나라도 있는지                                            |
| `getRoomMenuItems()`     | 그룹 단위 항목 배열 — `{ label, groupName, roomtype(대표), roomtypes[] }` |
| `getRoomMenuLabel()`     | 메뉴에 쓸 이름 — **그룹명** (없으면 객실명)                               |
| `getRoomMenuLink()`      | **그룹의 첫 객실** 상세로 연결                                            |
| `renderRoomSlides()`     | 미리보기 카드 — **그룹을 쓰지 않고 `roomtypes[]` 전체**를 깐다            |
| `isRoomMenuItemActive()` | 그룹 안 **어느 객실 id 로 들어와도** 그 항목을 활성으로 본다              |

### 화면 흐름

```
헤더 ROOMS 메뉴        →  그룹명        (스파동 | 프리미엄동)
        ↓ 그룹명 클릭
그룹의 첫 번째 객실 상세 →  탭에 그 그룹의 모든 객실
                            (미리보기 | 에버골드 | 퍼블하제 | 유메)

Room Preview(미리보기)  →  전체 객실 (그룹과 무관), 카드마다 자기 객실 상세로 연결
```

### ⚠️ 객실 상세 탭은 그룹을 펼친다

헤더는 그룹명 하나로 접히므로, **상세 페이지 탭까지 접으면 그룹의 첫 객실
외에는 헤더에서 도달할 방법이 없다.** 그래서 탭은 현재 객실이 속한 그룹을 찾아
**그 그룹의 객실만** 렌더한다. (미리보기에서는 어느 객실이든 바로 갈 수 있다)

| 상황                             | 탭                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| 그룹 밖 (미리보기 / 미그룹 객실) | `미리보기 \| 스파동 \| 프리미엄동 \| …`                                            |
| 그룹 안 (멤버 2실 이상)          | `미리보기 \| 에버골드 \| 퍼블하제 \| 유메`                                         |
| 멤버 1실 그룹                    | 펼치지 않음 — 항목이 하나뿐이라 탭이 비다시피 하고 그룹명 = 객실명이라 의미가 없다 |
| `groupName` 없음                 | 기존과 동일 (객실 하나가 항목 하나)                                                |

**다른 그룹은 이 줄에 섞지 않는다.** 그룹명과 객실명이 나란히 놓이면 부모/자식이
형제처럼 보인다. 다른 그룹으로는 헤더 ROOMS 메뉴나 미리보기를 거쳐 이동한다.

탭을 다시 그릴 때 **첫 li(`미리보기`)는 남기고** `data-generated="room"` 이 붙은
이전 생성분만 지운다. 통째로 비우면 미리보기로 돌아갈 길이 없어진다.

---

## 카피라이트 (`data-copyright`)

푸터 카피라이트는 `property.tripProviderName`(Trip11 공급자명)으로 렌더한다.

`common/footer.html` 의 카피라이트 요소에 템플릿 문자열을 두고,
`header-footer-mapper.js` 의 `mapCopyright()` 가 `{provider}` 를 치환한다.

```html
<a href="http://trip11.kr/" data-copyright="COPYRIGHT©{provider}. ALL RIGHTS RESERVED.">
  COPYRIGHT©(주)트립일레븐. ALL RIGHTS RESERVED.
</a>
```

| `property.tripProviderName` | 결과                                  |
| --------------------------- | ------------------------------------- |
| `"신비서"`                  | `COPYRIGHT©신비서. ALL RIGHTS RESERVED.` |
| `""` / 미입력               | HTML 에 적힌 기존 문구 그대로          |

- 문구 형식(대소문자, `ⓒ` 접두, `(주)` 표기)은 템플릿마다 달라서 **형식은 `data-copyright` 속성값이 갖고
  매퍼는 이름만 바꾼다**.
- 값이 없을 때(백오피스 미입력 → `""`) 는 건드리지 않으므로 기존 트립일레븐 문구가 그대로 남는다.
- `trip11.kr` 링크는 변경하지 않는다.

---

## landing.html (선택 기능 — 여러 숙소 게이트)

t-template-A 와 같은 구현이다 (상세 스키마·카드 구조는 `t-template-A/data-mapping.md` 의 landing 절).
헤더/푸터가 없는 별도 페이지이고, 카드(`pages.landing.sections[0].about[]`, 1~3장)를 그리드로 나란히 놓는다.

**루트 가드** — `IndexMapper.mapPage()` → `maybeRedirectToLanding()` → `shouldEnterLanding()`

- 어드민 프리뷰 iframe 안이면 skip
- `pages.landing.sections[0].enabled !== true` 면 skip — **명시적으로 켠 숙소만** 가로챈다.
  섹션이 없거나 `enabled` 가 false/누락이면 기존처럼 `index.html` 을 그대로 보여준다
- `document.referrer` 가 같은 origin 이면 skip (헤더 로고, 랜딩의 자기 자신 카드)
- `document.referrer` 호스트가 `about[].domain` 중 하나면 skip (연결 숙소 랜딩에서 카드로 넘어옴)
- 그 외 (주소 직접 입력·즐겨찾기·검색/외부 링크) → `location.replace('landing.html')`

`landing.html` 을 직접 열었는데 `enabled !== true` 면 `404.html` 로 보낸다.

쿼리 파라미터 없이 **referrer** 로 "랜딩을 이미 거쳤는지" 를 가른다. 그래서 헤더 로고 링크(common/header.html)는
원래대로 `./index.html`, 랜딩 카드도 `./index.html` / `{domain}/` 로 보낸다.

- 크로스 도메인 referrer 는 브라우저 기본 정책(`strict-origin-when-cross-origin`)상 origin 만 오므로 호스트로만 비교한다 (`www.` 유무 무시).
- 연결 숙소 B 의 랜딩 `about[]` 에 A 의 도메인이 없으면, A 랜딩 → B 카드 클릭 시 B 의 랜딩이 한 번 더 뜬다.
- https → http 로 넘어가면 브라우저가 referrer 를 보내지 않아 랜딩이 다시 뜬다 (연결 숙소 도메인은 https 전제).

**카드 링크** (`landing-mapper.js` `getCardLink()`) — 전부 새 탭, 도착한 index 는 referrer 로 랜딩을 건너뛴다

| 조건                                         | 이동                          |
| -------------------------------------------- | ----------------------------- |
| `about[i].propertyId === property.id`        | `./index.html`                |
| 연결 숙소 + `about[i].domain` 있음           | `{domain}/`                   |
| 연결 숙소인데 `domain` 없음                  | `href="#"` (비활성)           |

카드 배경은 `about[i].images` 첫 장, 로고는 `hero.images[]` 중 `blockId === about[i].blockId`,
로고가 없으면 `about[i].propertyName` 텍스트, `about[i].title` 은 입력했을 때만 보인다.
