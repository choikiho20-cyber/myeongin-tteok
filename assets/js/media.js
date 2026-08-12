/**
 * 방송·언론 — site-config.js 의 SITE.media 를 읽어 카드로 그린다.
 *
 * 화면 캡처를 올리지 않는다. 제목·언론사·날짜만 우리가 적고,
 * 누르면 원문(유튜브·기사)으로 나간다. 저작권 문제가 생기지 않는다.
 * 유튜브는 영상 ID 로 공식 썸네일을 불러온다.
 */
(function () {
  "use strict";
  var S = window.SITE || {};

  var yr = document.getElementById("footerYear");
  if (yr) yr.textContent = new Date().getFullYear();

  var grid = document.getElementById("mediaGrid");
  if (!grid) return;

  var all = Array.isArray(S.media) ? S.media.slice() : [];

  // 최신순
  all.sort(function (a, b) {
    return String(b.date || "").localeCompare(String(a.date || ""));
  });

  function ymd(d) {
    if (!d) return "";
    var p = String(d).split("-");
    return p.length >= 3 ? p[0] + "." + p[1] + "." + p[2] : String(d);
  }

  function linkOf(it) {
    if (it.type === "youtube" && it.youtubeId) {
      return "https://www.youtube.com/watch?v=" + it.youtubeId;
    }
    return it.url || "";
  }

  function card(it) {
    var href = linkOf(it);
    var a = document.createElement("a");
    a.className = "media-card";
    a.href = href || "#";
    if (href) { a.target = "_blank"; a.rel = "noopener"; }

    /* 썸네일 */
    var thumb = document.createElement("span");
    thumb.className = "media-card__thumb";

    if (it.type === "youtube" && it.youtubeId) {
      var img = document.createElement("img");
      img.src = "https://img.youtube.com/vi/" + it.youtubeId + "/hqdefault.jpg";
      img.alt = "";
      img.loading = "lazy";
      thumb.appendChild(img);
      var play = document.createElement("span");
      play.className = "media-card__play";
      play.textContent = "▶";
      thumb.appendChild(play);
    } else if (it.thumb) {
      var im2 = document.createElement("img");
      im2.src = it.thumb; im2.alt = ""; im2.loading = "lazy";
      thumb.appendChild(im2);
    } else {
      // 기사에는 대체로 쓸 수 있는 이미지가 없다 — 언론사명을 크게
      thumb.classList.add("media-card__thumb--text");
      var t = document.createElement("span");
      t.className = "media-card__outlet-big";
      t.textContent = it.outlet || "언론 보도";
      thumb.appendChild(t);
    }
    a.appendChild(thumb);

    /* 본문 */
    var body = document.createElement("span");
    body.className = "media-card__body";

    var meta = document.createElement("span");
    meta.className = "media-card__meta";
    var kind = document.createElement("span");
    kind.className = "media-card__kind";
    kind.textContent = it.type === "youtube" ? "영상" : "기사";
    meta.appendChild(kind);
    if (it.outlet) {
      var o = document.createElement("span");
      o.className = "media-card__outlet";
      o.textContent = it.outlet;
      meta.appendChild(o);
    }
    if (it.date) {
      var d = document.createElement("span");
      d.className = "media-card__date";
      d.textContent = ymd(it.date);
      meta.appendChild(d);
    }
    body.appendChild(meta);

    var h = document.createElement("span");
    h.className = "media-card__title";
    h.textContent = it.title || "(제목 없음)";
    body.appendChild(h);

    var go = document.createElement("span");
    go.className = "media-card__go";
    go.textContent = it.type === "youtube" ? "영상 보기 →" : "기사 원문 보기 →";
    body.appendChild(go);

    a.appendChild(body);
    return a;
  }

  function render(cat) {
    var list = cat === "all" ? all : all.filter(function (i) { return i.type === cat; });
    grid.innerHTML = "";
    list.forEach(function (it) { grid.appendChild(card(it)); });

    var empty = document.getElementById("mediaEmpty");
    var filter = document.querySelector(".media-filter");
    var note = document.querySelector(".media-note");

    if (all.length === 0) {
      // 자료가 하나도 없으면 분류 버튼·안내문까지 숨긴다
      if (empty) empty.hidden = false;
      if (filter) filter.hidden = true;
      if (note) note.hidden = true;
    } else {
      if (empty) empty.hidden = list.length > 0;
      if (filter) filter.hidden = false;
      if (note) note.hidden = false;
    }
  }

  var btns = document.querySelectorAll(".media-filter .gal-filter__btn");
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      btns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      render(b.dataset.mcat);
    });
  });

  render("all");
})();
