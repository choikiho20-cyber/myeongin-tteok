/**
 * 이연순 명인떡 — 메인 스크립트
 */
(function () {
  "use strict";

  /* ══════════════════════════════════════════════
     1. 히어로 배너 슬라이더 (창억떡 동일 구조)
     - flex + transform 슬라이드
     - 자동재생 4.5초 간격
     - 좌우 화살표 + 닷 인디케이터
     - 터치 스와이프 + 마우스 드래그
     - 호버 시 일시정지
     ══════════════════════════════════════════════ */
  var slider = document.getElementById("heroSlider");
  var track  = document.getElementById("heroSlides");
  var prev   = document.getElementById("heroPrev");
  var next   = document.getElementById("heroNext");
  var indicator = document.getElementById("heroIndicator");
  var pauseBtn  = document.getElementById("heroPause");
  var counterCur = document.getElementById("heroCurrent");
  var counterTotal = document.getElementById("heroTotal");

  if (track) {
    var slides = track.children;
    var total  = slides.length;
    var current = 0;
    var autoTimer = null;
    var isPlaying = true;
    var INTERVAL  = 4500;    // 자동재생 간격 (ms)
    var TRANSITION = "transform 0.4s ease"; // 창억떡 동일

    if (counterTotal) counterTotal.textContent = total;

    function goTo(idx, instant) {
      current = ((idx % total) + total) % total;
      track.style.transition = instant ? "none" : TRANSITION;
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      updateIndicator();
    }

    function updateIndicator() {
      if (indicator) {
        var dots = indicator.querySelectorAll(".hero__dot");
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.toggle("is-active", i === current);
        }
      }
      if (counterCur) counterCur.textContent = current + 1;

      // aria
      for (var j = 0; j < slides.length; j++) {
        slides[j].setAttribute("aria-hidden", j !== current);
        slides[j].setAttribute("aria-label", (j + 1) + " / " + total);
      }

      // 현재 슬라이드의 영상은 처음부터 재생
      // (loop 상태로 계속 돌기 때문에 그냥 두면 중간 장면부터 보임)
      var vid = slides[current].querySelector("video");
      if (vid) {
        try {
          vid.currentTime = 0;
          var p = vid.play();
          if (p && p.catch) p.catch(function () {});
        } catch (e) {}
      }
    }

    function nextSlide() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }

    // 자동재생 — 슬라이드마다 머무는 시간을 다르게 줄 수 있음
    // (영상 슬라이드는 data-duration 으로 영상 길이만큼 지정)
    function slideDuration(idx) {
      var ms = parseInt(slides[idx].dataset.duration, 10);
      return isNaN(ms) ? INTERVAL : ms;
    }
    function startAuto() {
      stopAuto();
      if (isPlaying && total > 1) {
        autoTimer = setTimeout(function () {
          nextSlide();
          startAuto();
        }, slideDuration(current));
      }
    }
    function stopAuto() {
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    }

    // 화살표
    if (next) next.addEventListener("click", function () { nextSlide(); startAuto(); });
    if (prev) prev.addEventListener("click", function () { prevSlide(); startAuto(); });

    // 닷 클릭
    if (indicator) {
      indicator.addEventListener("click", function (e) {
        var dot = e.target.closest(".hero__dot");
        if (!dot) return;
        var idx = parseInt(dot.dataset.idx, 10);
        if (!isNaN(idx)) { goTo(idx); startAuto(); }
      });
    }

    // 일시정지/재생
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        isPlaying = !isPlaying;
        pauseBtn.textContent = isPlaying ? "⏸" : "▶";
        pauseBtn.setAttribute("aria-label", isPlaying ? "자동 재생 일시정지" : "자동 재생 시작");
        isPlaying ? startAuto() : stopAuto();
      });
    }

    // 호버 시 일시정지
    if (slider) {
      slider.addEventListener("mouseenter", stopAuto);
      slider.addEventListener("mouseleave", function () { if (isPlaying) startAuto(); });
    }

    // 터치 스와이프 + 마우스 드래그
    var startX = 0, startY = 0, isDragging = false, dx = 0;
    var SWIPE_THRESHOLD = 50;

    function onStart(x, y) {
      startX = x; startY = y; isDragging = true; dx = 0;
      track.style.transition = "none";
      stopAuto();
    }
    function onMove(x) {
      if (!isDragging) return;
      dx = x - startX;
      var base = -(current * 100);
      var pct = base + (dx / slider.offsetWidth) * 100;
      track.style.transform = "translateX(" + pct + "%)";
    }
    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        dx < 0 ? nextSlide() : prevSlide();
      } else {
        goTo(current);
      }
      if (isPlaying) startAuto();
    }

    // 터치 이벤트
    track.addEventListener("touchstart", function (e) {
      var t = e.touches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });
    track.addEventListener("touchmove", function (e) {
      if (!isDragging) return;
      var t = e.touches[0];
      // 수평 스와이프가 수직보다 크면 기본 스크롤 방지
      var dy = Math.abs(t.clientY - startY);
      if (Math.abs(t.clientX - startX) > dy) {
        e.preventDefault();
      }
      onMove(t.clientX);
    }, { passive: false });
    track.addEventListener("touchend", onEnd);
    track.addEventListener("touchcancel", onEnd);

    // 마우스 드래그
    track.addEventListener("mousedown", function (e) {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
    });
    document.addEventListener("mousemove", function (e) {
      if (isDragging) onMove(e.clientX);
    });
    document.addEventListener("mouseup", onEnd);

    // 키보드
    if (slider) {
      slider.setAttribute("tabindex", "0");
      slider.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { prevSlide(); startAuto(); }
        if (e.key === "ArrowRight") { nextSlide(); startAuto(); }
      });
    }

    // 초기화
    goTo(0, true);
    startAuto();
  }

  /* ══════════════════════════════════════════════
     2. 모바일 드로어
     ══════════════════════════════════════════════ */
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("drawer");

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
      drawer.setAttribute("aria-hidden", !open);
      document.body.style.overflow = open ? "hidden" : "";
    });

    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        drawer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      });
    });
  }

  /* ══════════════════════════════════════════════
     3. 스크롤 등장 (Intersection Observer)
     ══════════════════════════════════════════════ */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ══════════════════════════════════════════════
     3-2. 계절별 떡 — 현재 계절 강조
     ══════════════════════════════════════════════ */
  var seasonCards = document.querySelectorAll(".season-card[data-months]");
  var seasonNote = document.getElementById("seasonNow");
  if (seasonCards.length) {
    var curMonth = new Date().getMonth() + 1;
    seasonCards.forEach(function (card) {
      var months = card.dataset.months.split(",").map(Number);
      if (months.indexOf(curMonth) !== -1) {
        card.classList.add("is-now");
        if (seasonNote) {
          var name = card.querySelector(".season-card__name");
          seasonNote.textContent = "지금은 " + (name ? name.textContent.split("·")[0].trim() : "제철 떡") + " 시즌입니다";
        }
      }
    });
  }

  /* ══════════════════════════════════════════════
     3-3. 히어로 미디어 준비 상태 감지
     - 사진/영상 파일이 아직 없으면 슬라이드별 색감으로 대체
     - assets/images/ 에 파일을 넣으면 자동으로 실제 미디어 표시
     ══════════════════════════════════════════════ */
  document.querySelectorAll(".hero__slide [data-hero]").forEach(function (media) {
    var slide = media.closest(".hero__slide");
    if (!slide) return;

    function markPending() {
      if (slide.classList.contains("is-pending")) return;
      slide.classList.add("is-pending");

      var label = slide.dataset.shot;
      if (label && !slide.querySelector(".hero__shot")) {
        var tag = document.createElement("span");
        tag.className = "hero__shot";
        tag.textContent = "📷 준비 중 — " + label;
        slide.appendChild(tag);
      }
    }

    media.addEventListener("error", markPending, true);

    if (media.tagName === "IMG") {
      // 스크립트 로드 전에 이미 실패한 경우
      if (media.complete && media.naturalWidth === 0) markPending();
    } else {
      // video: 소스를 못 찾은 상태
      if (media.networkState === media.NETWORK_NO_SOURCE) markPending();
      media.addEventListener("stalled", function () {
        if (media.readyState === 0) markPending();
      });
    }
  });

  /* ══════════════════════════════════════════════
     3-4. 사진 갤러리 (크로스페이드 순환)
     - .gallery 안의 <img> 를 늘리면 자동으로 반영됨
     - data-interval 로 전환 간격 지정 (기본 3200ms)
     - 파일이 없는 사진은 자동으로 제외
     - 터치 스와이프 · 닷 클릭 · 호버 시 정지
     ══════════════════════════════════════════════ */
  document.querySelectorAll(".gallery").forEach(function (gal) {
    var imgs = Array.prototype.slice.call(gal.querySelectorAll("img"));
    if (!imgs.length) return;

    var interval = parseInt(gal.dataset.interval, 10) || 3200;
    var idx = 0, timer = null;

    // 로드 실패한 사진은 순환에서 제외
    function drop(img) {
      var i = imgs.indexOf(img);
      if (i === -1) return;
      imgs.splice(i, 1);
      img.remove();
      if (idx >= imgs.length) idx = 0;
      build();
      show(idx);
    }
    imgs.slice().forEach(function (img) {
      img.addEventListener("error", function () { drop(img); });
      if (img.complete && img.naturalWidth === 0) drop(img);
    });
    if (!imgs.length) return;

    var dots = document.createElement("div");
    dots.className = "gallery__dots";
    var count = document.createElement("span");
    count.className = "gallery__count";

    function build() {
      dots.innerHTML = "";
      if (imgs.length < 2) { if (dots.parentNode) dots.remove(); return; }
      imgs.forEach(function (_, i) {
        var b = document.createElement("button");
        b.className = "gallery__dot";
        b.type = "button";
        b.setAttribute("aria-label", (i + 1) + "번 사진 보기");
        b.addEventListener("click", function () { show(i); start(); });
        dots.appendChild(b);
      });
      dots.appendChild(count);
      if (!dots.parentNode) gal.appendChild(dots);
    }

    function show(i) {
      idx = ((i % imgs.length) + imgs.length) % imgs.length;
      imgs.forEach(function (img, j) {
        img.classList.toggle("is-active", j === idx);
        img.setAttribute("aria-hidden", j !== idx);
      });
      var ds = dots.querySelectorAll(".gallery__dot");
      for (var k = 0; k < ds.length; k++) ds[k].classList.toggle("is-active", k === idx);
      count.textContent = (idx + 1) + " / " + imgs.length;
    }

    function start() {
      stop();
      if (imgs.length > 1) timer = setInterval(function () { show(idx + 1); }, interval);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    gal.addEventListener("mouseenter", stop);
    gal.addEventListener("mouseleave", start);

    // 터치 스와이프
    var sx = 0, sy = 0, swiping = false;
    gal.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; stop();
    }, { passive: true });
    gal.addEventListener("touchend", function (e) {
      if (!swiping) return;
      swiping = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(t.clientY - sy)) {
        show(dx < 0 ? idx + 1 : idx - 1);
      }
      start();
    });

    build();
    show(0);
    start();
  });

  /* ══════════════════════════════════════════════
     4. 이미지 자리표시자
     ══════════════════════════════════════════════ */
  document.querySelectorAll("img[data-ph]").forEach(function (img) {
    var wrap = img.closest(".ph-host") || img.parentElement;

    function showPlaceholder() {
      img.classList.add("is-missing");
      if (wrap.querySelector(".ph")) return;
      var div = document.createElement("div");
      div.className = "ph";
      div.setAttribute("role", "img");
      div.setAttribute("aria-label", img.alt || "사진 준비 중");
      div.innerHTML =
        '<span class="ph__icon">📷</span>' +
        '<span class="ph__text">' + (img.dataset.ph || "사진 준비 중") + '</span>' +
        '<span class="ph__hint">권장 비율: ' + (img.dataset.ratio || "1:1") + '</span>';
      wrap.style.position = "relative";
      wrap.appendChild(div);
    }

    if (!img.src || img.src.endsWith("#")) {
      showPlaceholder();
    } else {
      img.addEventListener("error", showPlaceholder);
    }
  });

  /* ══════════════════════════════════════════════
     5. 부드러운 스크롤 (앵커 링크)
     ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ══════════════════════════════════════════════
     6. 현재 페이지 네비 표시
     ══════════════════════════════════════════════ */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link, .drawer__link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === path || (href === "./" && path === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });

  /* ══════════════════════════════════════════════
     7. 검색바 (PC 드롭다운 + 모바일 전체화면)
     ══════════════════════════════════════════════ */
  var searchInput = document.getElementById("searchInput");
  var searchDropdown = document.getElementById("searchDropdown");
  var searchToggleBtn = document.getElementById("searchToggle");
  var searchFs = document.getElementById("searchFullscreen");
  var searchFsInput = document.getElementById("searchFsInput");
  var searchFsClose = document.getElementById("searchFsClose");

  var sectionMap = {
    products: "#products",
    always: "#always",
    seasonal: "#seasonal",
    order: "#order",
    experience: "#experience",
    cafe: "#cafe",
    story: "#story",
    visit: "#visit",
    faq: "#faq"
  };

  function scrollToSection(section) {
    var id = sectionMap[section];
    if (!id) return;
    var el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  // PC: 검색 인풋 포커스 → 드롭다운 열기
  if (searchInput && searchDropdown) {
    searchInput.addEventListener("focus", function () {
      searchDropdown.classList.add("is-open");
    });

    // 드롭다운 바깥 클릭 시 닫기
    document.addEventListener("click", function (e) {
      var box = searchInput.closest(".search-box");
      if (box && !box.contains(e.target)) {
        searchDropdown.classList.remove("is-open");
      }
    });

    // ESC로 닫기
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        searchDropdown.classList.remove("is-open");
        searchInput.blur();
      }
    });
  }

  // 카테고리 태그 + 인기검색어 클릭 → 해당 섹션으로 스크롤
  document.querySelectorAll(".search-tag, .popular-item").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var section = btn.dataset.section;
      var keyword = btn.dataset.keyword;

      // 검색 인풋에 키워드 채우기
      if (searchInput) searchInput.value = keyword;
      if (searchFsInput) searchFsInput.value = keyword;

      // 드롭다운/전체화면 닫기
      if (searchDropdown) searchDropdown.classList.remove("is-open");
      if (searchFs) {
        searchFs.classList.remove("is-open");
        searchFs.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }

      scrollToSection(section);
    });
  });

  // 모바일: 검색 아이콘 → 전체화면 검색 열기
  if (searchToggleBtn && searchFs) {
    searchToggleBtn.addEventListener("click", function () {
      searchFs.classList.add("is-open");
      searchFs.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (searchFsInput) {
        setTimeout(function () { searchFsInput.focus(); }, 100);
      }
    });
  }

  // 모바일: 취소 버튼 → 전체화면 닫기
  if (searchFsClose && searchFs) {
    searchFsClose.addEventListener("click", function () {
      searchFs.classList.remove("is-open");
      searchFs.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });
  }

  // 모바일: ESC로 전체화면 닫기
  if (searchFsInput && searchFs) {
    searchFsInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        searchFs.classList.remove("is-open");
        searchFs.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    });
  }
})();
