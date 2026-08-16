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

  var all = [];

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

  var drawn = 0;   // 첫 화면에 보이는 카드는 지연 로딩하지 않는다

  function card(it) {
    drawn++;
    var lazy = drawn > 3 ? "lazy" : "eager";
    var href = linkOf(it);
    var bigOutlet = false;
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
      img.loading = lazy;
      thumb.appendChild(img);
      var play = document.createElement("span");
      play.className = "media-card__play";
      play.textContent = "▶";
      thumb.appendChild(play);
    } else if (it.thumb) {
      var im2 = document.createElement("img");
      im2.src = it.thumb; im2.alt = ""; im2.loading = lazy;
      thumb.appendChild(im2);
    } else {
      // 기사에는 대체로 쓸 수 있는 이미지가 없다 — 언론사명을 크게
      thumb.classList.add("media-card__thumb--text");
      var t = document.createElement("span");
      t.className = "media-card__outlet-big";
      t.textContent = it.outlet || "언론 보도";
      thumb.appendChild(t);
      bigOutlet = true;   // 아래 메타에서 언론사명을 또 쓰지 않는다
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
    // 썸네일 자리에 언론사명을 크게 넣은 경우엔 여기서 또 쓰지 않는다
    if (it.outlet && !bigOutlet) {
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

  /* 두 묶음을 한 화면에 모두 보여준다.
     영상은 썸네일이 있어 눈에 잘 띄므로 항상 위에 둔다. */
  var GROUPS = [
    { type: "youtube", label: "📺 방송·영상" },
    { type: "article", label: "📰 신문·기사" },
  ];

  function group(def) {
    var list = all.filter(function (i) { return i.type === def.type; });
    if (!list.length) return null;

    var wrap = document.createElement("section");
    wrap.className = "media-group";

    var h = document.createElement("h2");
    h.className = "media-group__h";
    var name = document.createElement("span");
    name.textContent = def.label;
    h.appendChild(name);
    var cnt = document.createElement("span");
    cnt.className = "media-group__cnt";
    cnt.textContent = list.length + "건";
    h.appendChild(cnt);
    wrap.appendChild(h);

    var g = document.createElement("div");
    g.className = "media-grid";
    list.forEach(function (it) { g.appendChild(card(it)); });
    wrap.appendChild(g);
    return wrap;
  }

  function render() {
    grid.innerHTML = "";
    drawn = 0;
    GROUPS.forEach(function (def) {
      var sec = group(def);
      if (sec) grid.appendChild(sec);
    });

    var empty = document.getElementById("mediaEmpty");
    var note = document.querySelector(".media-note");
    if (empty) empty.hidden = all.length > 0;
    if (note) note.hidden = all.length === 0;
  }

  /* 자료는 media.json 에서 읽는다.
     (site-config.js 는 자바스크립트라 손으로 고치다 깨뜨리기 쉬워 분리했다.
      관리 화면 admin-media.html 에서 이 파일을 만들어 올린다) */
  function boot(list) {
    all = Array.isArray(list) ? list.slice() : [];
    all.sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
    render();
  }

  fetch("media.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : []; })
    .catch(function () { return Array.isArray(S.media) ? S.media : []; })
    .then(boot);
})();
