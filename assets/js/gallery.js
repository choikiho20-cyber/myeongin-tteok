/**
 * 갤러리 — site-config.js 의 SITE.gallery 를 읽어 그리드로 그린다.
 * 사진을 늘리려면 site-config.js 만 고치면 된다.
 */
(function () {
  "use strict";
  var S = window.SITE || {};

  /* 방송·언론 자료가 없으면 메뉴에서 숨긴다 */
  var hasMedia = Array.isArray(S.media) && S.media.length > 0;
  document.querySelectorAll("[data-needs-media]").forEach(function (el) {
    if (hasMedia) el.removeAttribute("hidden");
  });

  var yr = document.getElementById("footerYear");
  if (yr) yr.textContent = new Date().getFullYear();

  var grid = document.getElementById("galGrid");
  if (!grid) return;

  var items = Array.isArray(S.gallery) ? S.gallery.slice() : [];
  var shown = items;

  function isVideo(it) {
    return it.video || /\.(mp4|webm)$/i.test(it.src || "");
  }

  function render(cat) {
    shown = cat === "all" ? items : items.filter(function (i) { return i.cat === cat; });
    grid.innerHTML = "";
    shown.forEach(function (it, idx) {
      var fig = document.createElement("button");
      fig.className = "gal-item";
      fig.type = "button";
      fig.setAttribute("data-idx", idx);
      fig.setAttribute("aria-label", (it.alt || "사진") + " 크게 보기");

      if (isVideo(it)) {
        var v = document.createElement("video");
        v.src = it.src;
        v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
        v.setAttribute("preload", "metadata");
        fig.appendChild(v);
        var badge = document.createElement("span");
        badge.className = "gal-item__badge";
        badge.textContent = "▶ 영상";
        fig.appendChild(badge);
      } else {
        var img = document.createElement("img");
        img.src = it.src;
        img.alt = it.alt || "";
        img.loading = "lazy";
        fig.appendChild(img);
      }

      var cap = document.createElement("span");
      cap.className = "gal-item__cap";
      cap.textContent = it.alt || "";
      fig.appendChild(cap);

      grid.appendChild(fig);
    });
    var empty = document.getElementById("galEmpty");
    if (empty) empty.hidden = shown.length > 0;
  }

  /* 분류 버튼 */
  var btns = document.querySelectorAll(".gal-filter__btn");
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      btns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      render(b.dataset.cat);
    });
  });

  /* ── 확대 보기 ─────────────────────────────── */
  var lb = document.getElementById("lightbox");
  var stage = document.getElementById("lbStage");
  var cap = document.getElementById("lbCap");
  var cur = 0;
  var lastFocus = null;

  function show(i) {
    if (!shown.length) return;
    cur = ((i % shown.length) + shown.length) % shown.length;
    var it = shown[cur];
    stage.innerHTML = "";
    if (isVideo(it)) {
      var v = document.createElement("video");
      v.src = it.src; v.controls = true; v.autoplay = true;
      v.loop = true; v.playsInline = true;
      stage.appendChild(v);
    } else {
      var img = document.createElement("img");
      img.src = it.src; img.alt = it.alt || "";
      stage.appendChild(img);
    }
    cap.textContent = (it.alt || "") + "  (" + (cur + 1) + " / " + shown.length + ")";
  }

  function open(i) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    show(i);
    document.getElementById("lbClose").focus();
  }

  function close() {
    lb.hidden = true;
    stage.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener("click", function (e) {
    var item = e.target.closest(".gal-item");
    if (item) open(parseInt(item.dataset.idx, 10));
  });

  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { show(cur - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
  });

  render("all");
})();
