/**
 * 방송·언론 자료 관리 화면
 *
 * 왜 이렇게 만들었나
 *  - site-config.js 는 자바스크립트라 쉼표 하나만 틀려도 홈페이지 전체가 멈춘다.
 *    그래서 언론 자료만 media.json 으로 떼어냈다.
 *  - 사람이 JSON 을 손으로 쓰면 또 틀린다. 폼으로 받아 파일을 만들어 준다.
 *  - GitHub 토큰을 이 화면에 넣지 않는다. 토큰이 브라우저에 남으면 위험하다.
 *    대신 파일을 내려받아 GitHub 웹 화면에 올리게 한다.
 */
(function () {
  "use strict";

  var LS_KEY = "myeongin_media_draft";
  var items = [];

  var $ = function (id) { return document.getElementById(id); };

  /* ── 유튜브 주소에서 영상 번호 뽑기 ── */
  function youtubeId(url) {
    if (!url) return "";
    var m =
      url.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
      url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
      url.match(/youtube\.com\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  }

  function esc(s) { return String(s == null ? "" : s); }

  /* ── 저장 / 불러오기 (브라우저에만 임시 보관) ── */
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) items = JSON.parse(raw) || [];
    } catch (e) { items = []; }
  }

  /* ── 서버에 이미 올라간 자료 불러오기 ── */
  function loadServer() {
    return fetch("media.json?t=" + Date.now())
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  function sortItems() {
    items.sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }

  function jsonText() {
    return JSON.stringify(items, null, 2) + "\n";
  }

  /* ── 화면 그리기 ── */
  function render() {
    sortItems();
    var list = $("list");
    list.innerHTML = "";

    items.forEach(function (it, i) {
      var row = document.createElement("div");
      row.className = "adm-item";

      var th = document.createElement("div");
      th.className = "adm-item__thumb";
      if (it.type === "youtube" && it.youtubeId) {
        var img = document.createElement("img");
        img.src = "https://img.youtube.com/vi/" + it.youtubeId + "/mqdefault.jpg";
        img.alt = "";
        th.appendChild(img);
      } else {
        th.classList.add("adm-item__thumb--text");
        th.textContent = it.outlet || "기사";
      }
      row.appendChild(th);

      var body = document.createElement("div");
      body.className = "adm-item__body";

      var meta = document.createElement("div");
      meta.className = "adm-item__meta";
      var kind = document.createElement("span");
      kind.className = "adm-item__kind";
      kind.textContent = it.type === "youtube" ? "영상" : "기사";
      meta.appendChild(kind);
      var om = document.createElement("span");
      om.textContent = esc(it.outlet);
      meta.appendChild(om);
      if (it.date) {
        var dm = document.createElement("span");
        dm.className = "adm-item__date";
        dm.textContent = esc(it.date);
        meta.appendChild(dm);
      }
      body.appendChild(meta);

      var t = document.createElement("div");
      t.className = "adm-item__title";
      t.textContent = esc(it.title);
      body.appendChild(t);

      var link = document.createElement("a");
      link.className = "adm-item__url";
      link.href = it.type === "youtube"
        ? "https://www.youtube.com/watch?v=" + it.youtubeId
        : (it.url || "#");
      link.target = "_blank"; link.rel = "noopener";
      link.textContent = "링크 열어보기 ↗";
      body.appendChild(link);

      row.appendChild(body);

      var tools = document.createElement("div");
      tools.className = "adm-item__tools";
      var up = document.createElement("button");
      up.type = "button"; up.className = "adm-mini"; up.textContent = "▲";
      up.title = "위로";
      up.disabled = i === 0;
      up.onclick = function () { swap(i, i - 1); };
      var down = document.createElement("button");
      down.type = "button"; down.className = "adm-mini"; down.textContent = "▼";
      down.title = "아래로";
      down.disabled = i === items.length - 1;
      down.onclick = function () { swap(i, i + 1); };
      var del = document.createElement("button");
      del.type = "button"; del.className = "adm-mini adm-mini--del"; del.textContent = "삭제";
      del.onclick = function () {
        if (confirm("이 자료를 목록에서 뺄까요?\n\n" + (it.title || ""))) {
          items.splice(i, 1); save(); render();
        }
      };
      tools.appendChild(up); tools.appendChild(down); tools.appendChild(del);
      row.appendChild(tools);

      list.appendChild(row);
    });

    $("listEmpty").hidden = items.length > 0;
    $("cnt").textContent = items.length + "건";
    $("jsonOut").textContent = jsonText();
  }

  function swap(a, b) {
    if (b < 0 || b >= items.length) return;
    // 날짜순 정렬이 기본이라, 손으로 옮기면 날짜를 맞바꿔 순서를 고정한다
    var t = items[a].date; items[a].date = items[b].date; items[b].date = t;
    save(); render();
  }

  /* ── 추가 ── */
  function showError(msg) {
    var e = $("formError");
    if (!msg) { e.hidden = true; return; }
    e.textContent = msg; e.hidden = false;
  }

  function currentType() {
    var r = document.querySelector('input[name="mtype"]:checked');
    return r ? r.value : "youtube";
  }

  function add() {
    showError("");
    var type = currentType();
    var url = $("fUrl").value.trim();
    var title = $("fTitle").value.trim();
    var outlet = $("fOutlet").value.trim();
    var date = $("fDate").value;

    if (!url) return showError("주소를 붙여넣어 주세요.");
    if (!title) return showError("제목을 적어주세요.");
    if (!outlet) return showError("방송사 또는 언론사를 적어주세요.");

    var it = { type: type, title: title, outlet: outlet, date: date || "" };

    if (type === "youtube") {
      var yid = youtubeId(url);
      if (!yid) {
        return showError("유튜브 주소가 아닌 것 같습니다. " +
          "youtube.com/watch?v=... 또는 youtu.be/... 형태여야 합니다.");
      }
      it.youtubeId = yid;
    } else {
      if (!/^https?:\/\//i.test(url)) {
        return showError("주소는 http:// 또는 https:// 로 시작해야 합니다.");
      }
      it.url = url;
    }

    var dup = items.some(function (x) {
      return (x.youtubeId && x.youtubeId === it.youtubeId) ||
             (x.url && x.url === it.url);
    });
    if (dup && !confirm("같은 주소가 이미 목록에 있습니다. 그래도 추가할까요?")) return;

    items.push(it);
    save(); render();
    clearForm();
    $("fUrl").focus();
  }

  function clearForm() {
    $("fUrl").value = ""; $("fTitle").value = "";
    $("fOutlet").value = ""; $("fDate").value = "";
    showError("");
  }

  /* ── 내려받기 / 복사 ── */
  function download() {
    var blob = new Blob([jsonText()], { type: "application/json;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "media.json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
  }

  function copy() {
    var txt = jsonText();
    var done = function () {
      var b = $("btnCopy"); var old = b.textContent;
      b.textContent = "✅ 복사했습니다";
      setTimeout(function () { b.textContent = old; }, 1800);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(done, function () { fallback(txt, done); });
    } else { fallback(txt, done); }
  }
  function fallback(txt, done) {
    var ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { alert("복사에 실패했습니다."); }
    ta.remove();
  }

  /* ── 주소 입력 도움말 ── */
  function updateHint() {
    var type = currentType();
    var hint = $("urlHint");
    var input = $("fUrl");
    if (type === "youtube") {
      hint.textContent = "유튜브 주소를 붙여넣으면 영상 번호를 자동으로 찾아냅니다.";
      input.placeholder = "예) https://www.youtube.com/watch?v=abc123XYZ_1";
    } else {
      hint.textContent = "기사 원문 주소를 그대로 붙여넣으세요. 기사 내용은 복사하지 마세요.";
      input.placeholder = "예) https://www.inews365.com/news/article.html?no=123456";
    }
  }

  /* ── 시작 ── */
  document.querySelectorAll('input[name="mtype"]').forEach(function (r) {
    r.addEventListener("change", updateHint);
  });
  $("btnAdd").addEventListener("click", add);
  $("btnClear").addEventListener("click", clearForm);
  $("btnDownload").addEventListener("click", download);
  $("btnCopy").addEventListener("click", copy);
  $("fUrl").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); $("fTitle").focus(); }
  });

  updateHint();
  load();

  // 서버에 이미 올라간 자료가 있는데 브라우저에 임시본이 없으면 그걸 가져온다
  loadServer().then(function (srv) {
    if (Array.isArray(srv) && srv.length && items.length === 0) {
      items = srv;
      save();
    }
    render();
  });
})();
