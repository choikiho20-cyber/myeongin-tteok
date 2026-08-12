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
      up.onclick = function () { move(it, -1); };
      var down = document.createElement("button");
      down.type = "button"; down.className = "adm-mini"; down.textContent = "▼";
      down.title = "아래로";
      down.disabled = i === items.length - 1;
      down.onclick = function () { move(it, +1); };
      var del = document.createElement("button");
      del.type = "button"; del.className = "adm-mini adm-mini--del"; del.textContent = "삭제";
      del.onclick = function () {
        // 순번이 아니라 항목 자체로 찾는다.
        // 순번을 쓰면 목록이 다시 그려진 뒤 엉뚱한 것이 지워질 수 있다.
        var at = items.indexOf(it);
        if (at < 0) return;
        if (confirm("이 자료를 목록에서 뺄까요?\n\n" + (it.title || ""))) {
          items.splice(at, 1); save(); render();
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

  function move(it, dir) {
    var a = items.indexOf(it);
    var b = a + dir;
    if (a < 0 || b < 0 || b >= items.length) return;
    // 목록은 날짜 최신순으로 정렬된다. 그래서 순서를 바꾸려면 날짜를 맞바꾼다.
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
      var m = $("copyMsg");
      if (m) {
        m.textContent = items.length
          ? "✅ 복사했습니다. 카카오톡으로 담당자에게 붙여넣어 보내주세요."
          : "복사했습니다. (아직 추가한 자료가 없습니다)";
        m.hidden = false;
      }
      var b = $("btnCopy"); var old = b.textContent;
      b.textContent = "✅ 복사됨";
      setTimeout(function () {
        b.textContent = old;
        if (m) m.hidden = true;
      }, 4000);
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

  /* ══════════════════════════════════════════════════════
     제작사 전용 — 이 화면에서 바로 저장소에 반영한다.
     열쇠는 sessionStorage 에만 둔다(탭을 닫으면 사라짐).
     디스크에 남기지 않으려는 의도이므로 localStorage 로 바꾸지 말 것.
     ══════════════════════════════════════════════════════ */
  var REPO = "choikiho20-cyber/myeongin-tteok";
  var BRANCH = "master";
  var PATH = "media.json";
  var TK = "myeongin_dev_key";

  /* 기본은 탭 단위(sessionStorage). 사용자가 체크했을 때만 이 컴퓨터에 남긴다. */
  function tok() {
    try {
      return sessionStorage.getItem(TK) || localStorage.getItem(TK) || "";
    } catch (e) { return ""; }
  }
  function setTok(v, remember) {
    try {
      sessionStorage.removeItem(TK);
      localStorage.removeItem(TK);
      if (v) (remember ? localStorage : sessionStorage).setItem(TK, v);
    } catch (e) {}
    paintDev();
  }
  function isRemembered() {
    try { return !!localStorage.getItem(TK); } catch (e) { return false; }
  }
  function paintDev() {
    var has = !!tok();
    var s = $("devSetup"), r = $("devReady");
    if (s) s.hidden = has;
    if (r) r.hidden = !has;
    var w = $("devWhere");
    if (w) {
      w.textContent = has
        ? (isRemembered()
            ? "이 컴퓨터에 기억되어 있습니다."
            : "이 탭에서만 유효합니다. 탭을 닫으면 지워집니다.")
        : "";
    }
  }
  function devMsg(text, isError) {
    var m = $(isError ? "devError" : "devMsg");
    var other = $(isError ? "devMsg" : "devError");
    if (other) other.hidden = true;
    if (!m) return;
    m.textContent = text;
    m.hidden = !text;
  }

  /* 한글이 섞인 문자열을 base64 로 (GitHub API 가 요구하는 형식) */
  function b64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      "Authorization": "Bearer " + tok(),
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }, opts.headers || {});
    return fetch("https://api.github.com/repos/" + REPO + path, opts);
  }

  function publish() {
    if (!tok()) return;
    var btn = $("btnPublish");
    btn.disabled = true;
    devMsg("저장소를 확인하는 중...");

    api("/contents/" + PATH + "?ref=" + BRANCH)
      .then(function (r) {
        if (r.status === 401) throw new Error("열쇠가 올바르지 않습니다. 다시 확인해 주세요.");
        if (r.status === 403) throw new Error("이 저장소에 쓸 권한이 없는 열쇠입니다.");
        if (r.status === 404) return { sha: null };   // 파일이 없으면 새로 만든다
        if (!r.ok) throw new Error("저장소 확인 실패 (" + r.status + ")");
        return r.json();
      })
      .then(function (cur) {
        devMsg("홈페이지에 올리는 중...");
        return api("/contents/" + PATH, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "방송·언론 자료 갱신 (" + items.length + "건)",
            content: b64(jsonText()),
            branch: BRANCH,
            sha: cur.sha || undefined
          })
        });
      })
      .then(function (r) {
        if (!r.ok) {
          return r.json().then(function (e) {
            throw new Error(e.message || ("올리기 실패 (" + r.status + ")"));
          });
        }
        devMsg("✅ 반영했습니다. 1~2분 뒤 홈페이지에 나타납니다. " +
               "바로 확인하려면 강력 새로고침(Ctrl+Shift+R) 하세요.");
      })
      .catch(function (e) {
        devMsg(e.message || "알 수 없는 오류", true);
      })
      .then(function () { btn.disabled = false; });
  }

  var bUse = $("btnUseToken");
  if (bUse) {
    bUse.addEventListener("click", function () {
      var v = $("fToken").value.trim();
      if (!v) return devMsg("열쇠를 넣어주세요.", true);
      var remember = $("fRemember") && $("fRemember").checked;
      setTok(v, remember);
      $("fToken").value = "";
      devMsg(remember
        ? "등록했습니다. 이 컴퓨터에 기억되어 다음부터 안 넣으셔도 됩니다."
        : "등록했습니다. 이 탭에서만 유효합니다.");
    });
  }
  var bPub = $("btnPublish");
  if (bPub) bPub.addEventListener("click", publish);
  var bForget = $("btnForget");
  if (bForget) {
    bForget.addEventListener("click", function () {
      setTok("");
      devMsg("열쇠를 지웠습니다.");
    });
  }
  paintDev();

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
