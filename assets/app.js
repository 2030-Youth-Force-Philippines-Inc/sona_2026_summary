(function () {
  "use strict";
  var D = window.DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var TIER = { full: "Covered extensively", brief: "Mentioned briefly", none: "Not covered" };
  var TIER_SHORT = { full: "Full", brief: "Brief", none: "None" };
  var byN = function (n) { return D.SDGS.filter(function (s) { return s.n === n; })[0]; };
  var badge = function (n, label) {
    var s = byN(n);
    return '<span class="badge" style="background:' + s.color + ";color:" + (s.dark ? "#222" : "#fff") + '" title="SDG ' + n + ": " + esc(s.name) + '">' + (label || n) + "</span>";
  };

  /* ---------- KPI cards ---------- */
  var KPIS = [
    { sdg: 1, n: "3.5M", l: "families reached by 4Ps and Walang Gutom", t: "rep" },
    { sdg: 16, n: "₱25B", l: "recovered, frozen or preserved; ₱800M+ returned to Treasury", t: "rep" },
    { sdg: 3, n: "4.5M", l: "YAKAP check-ups among 25M registered Filipinos", t: "rep" },
    { sdg: 7, n: "45", sm: " of ~200", l: "power projects completed", t: "com",
      m: [[45, "#2f7d5f"], [31, "#d3a24a"], [124, "#c9ced6"]], c: "45 done · 31 more in 2026 · 124 by 2028 (as stated)" },
    { sdg: 2, n: "2.5M", sm: " of 8M", l: "families given rice (26,000+ tons)", t: "com", m: [[2.5, "#2f7d5f"], [5.5, "#c9ced6"]], c: "31% of the stated 8M-family goal" },
    { sdg: 15, n: "18M", sm: " of 100M", l: "coconut trees planted", t: "com", m: [[18, "#2f7d5f"], [82, "#c9ced6"]], c: "18% of the stated 100M-tree target" }
  ];
  $("#kpis").innerHTML = KPIS.map(function (k) {
    var meter = k.m ? '<div class="meter" aria-hidden="true">' + k.m.map(function (p) { return '<i style="width:' + p[0] / k.m.reduce(function (a, b) { return a + b[0]; }, 0) * 100 + "%;background:" + p[1] + '"></i>'; }).join("") + '</div><div class="mcap">' + k.c + "</div>" : "";
    return '<button class="kpi ' + k.t + '" data-sdg="' + k.sdg + '" aria-label="' + esc(k.n + (k.sm || "") + " " + k.l) + '. Open SDG ' + k.sdg + '.">' +
      '<div class="t">' + badge(k.sdg, "SDG " + k.sdg) + '<span class="chip ' + k.t + '">' + (k.t === "rep" ? "Reported" : "Commitment") + "</span></div>" +
      '<div class="n">' + k.n + (k.sm ? "<small>" + k.sm + "</small>" : "") + '</div><div class="l">' + esc(k.l) + "</div>" + meter + "</button>";
  }).join("");
  $$(".kpi").forEach(function (b) {
    b.addEventListener("click", function () { selectSdg(+b.dataset.sdg, true); });
  });

  /* ---------- SDG explorer ---------- */
  var state = { tier: "all", sdg: null };
  var tiles = $("#tiles"), bars = $("#bars"), detail = $("#detail");
  var maxP = Math.max.apply(null, D.SDGS.map(function (s) { return s.passages; }));

  tiles.innerHTML = D.SDGS.map(function (s) {
    return '<button class="tile ' + s.tier + '" data-n="' + s.n + '" role="listitem" aria-label="SDG ' + s.n + " " + esc(s.name) + ", " + TIER[s.tier] + '"><b>' + s.n + "</b><span>" + esc(s.name) + "</span></button>";
  }).join("");
  bars.innerHTML = D.SDGS.map(function (s) {
    return '<button class="brow ' + s.tier + '" data-n="' + s.n + '" aria-label="SDG ' + s.n + ": " + s.passages + ' passages"><span>SDG ' + s.n + '</span><span class="tr"><span class="fl" style="width:' + (s.passages / maxP * 100) + '%"></span></span><span>' + s.passages + "</span></button>";
  }).join("");

  function applyTier() {
    $$(".tile,.brow").forEach(function (el) {
      var s = byN(+el.dataset.n);
      el.classList.toggle("dim", state.tier !== "all" && s.tier !== state.tier);
    });
    $$("[data-tier]").forEach(function (p) {
      var on = p.dataset.tier === state.tier; p.classList.toggle("on", on); p.setAttribute("aria-pressed", on);
    });
  }
  $$("[data-tier]").forEach(function (p) {
    p.addEventListener("click", function () { state.tier = p.dataset.tier; applyTier(); });
  });

  function selectSdg(n, scroll) {
    state.sdg = n;
    var s = byN(n);
    $$(".tile,.brow").forEach(function (el) { el.classList.toggle("sel", +el.dataset.n === n); });
    var gapCls = s.tier === "none" ? "gapbox red" : "gapbox";
    detail.innerHTML =
      '<div class="meta">' + badge(n, "SDG " + n) + '<span class="chip ' + (s.tier === "full" ? "rep" : s.tier === "brief" ? "com" : "ins") + '">' + TIER[s.tier] + "</span>" +
      '<span class="fine" style="margin:0">' + s.passages + " passage" + (s.passages === 1 ? "" : "s") + " · targets " + esc(s.targets) + "</span></div>" +
      "<h3>" + esc(s.name) + "</h3>" +
      '<div class="row"><h4>What the address stated</h4><ul>' + s.claims.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="row"><h4>What remains unresolved</h4><p class="' + gapCls + '">' + esc(s.gap) + "</p></div>" +
      '<div class="row"><h4>Congressional lens</h4><p>' + esc(s.lens) + "</p></div>" +
      '<div class="row"><h4>Suggested indicator</h4><p>' + esc(s.indicator) + "</p></div>" +
      '<div class="row"><h4>Progress status</h4><p>Insufficient Data — no baseline, target or trend in the summary.</p></div>' +
      '<div class="row"><button class="btn" id="seeF">See related findings →</button></div>';
    $("#seeF").addEventListener("click", function () { $("#sdgSel").value = n; fState.sdg = String(n); renderFindings(); location.hash = "#findings"; });
    if (scroll) { location.hash = "#sdgs"; }
  }
  $$(".tile,.brow").forEach(function (el) { el.addEventListener("click", function () { selectSdg(+el.dataset.n); }); });
  applyTier(); selectSdg(7);

  /* ---------- Findings ---------- */
  var fState = { cls: "all", sdg: "all", q: "" };
  $("#classPills").innerHTML = '<button class="pill on" data-c="all" aria-pressed="true">All ' + D.FINDINGS.length + "</button>" +
    Object.keys(D.CLASSES).map(function (k) {
      var n = D.FINDINGS.filter(function (f) { return f.cls === k; }).length;
      return '<button class="pill" data-c="' + k + '" aria-pressed="false" title="' + esc(D.CLASSES[k].tip) + '">' + D.CLASSES[k].label + " · " + n + "</button>";
    }).join("");
  $("#sdgSel").innerHTML = '<option value="all">All goals</option>' + D.SDGS.map(function (s) { return '<option value="' + s.n + '">SDG ' + s.n + " · " + esc(s.name) + "</option>"; }).join("");
  $$("#classPills .pill").forEach(function (p) {
    p.addEventListener("click", function () {
      fState.cls = p.dataset.c;
      $$("#classPills .pill").forEach(function (x) { var on = x === p; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
      renderFindings();
    });
  });
  $("#sdgSel").addEventListener("change", function (e) { fState.sdg = e.target.value; renderFindings(); });
  $("#q").addEventListener("input", function (e) { fState.q = e.target.value.trim().toLowerCase(); renderFindings(); });
  var CHIP = { reported: "rep", commitment: "com", legislative: "leg", insufficient: "ins" };
  function hl(text) {
    var t = esc(text);
    if (!fState.q) return t;
    var q = esc(fState.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return t.replace(new RegExp("(" + q + ")", "ig"), "<mark>$1</mark>");
  }
  function renderFindings() {
    var list = D.FINDINGS.filter(function (f) {
      return (fState.cls === "all" || f.cls === fState.cls) &&
        (fState.sdg === "all" || f.sdgs.indexOf(+fState.sdg) > -1) &&
        (!fState.q || (f.text + " " + f.area).toLowerCase().indexOf(fState.q) > -1);
    });
    $("#count").textContent = "Showing " + list.length + " of " + D.FINDINGS.length + " findings";
    $("#findingList").innerHTML = list.length ? list.map(function (f) {
      return '<article class="fcard ' + f.cls + '"><div class="h"><span class="chip ' + CHIP[f.cls] + '">' + D.CLASSES[f.cls].label + "</span>" +
        f.sdgs.map(function (n) { return badge(n); }).join("") + '<span class="area">' + esc(f.area) + "</span></div><p>" + hl(f.text) + "</p></article>";
    }).join("") : '<p class="empty">No findings match these filters.</p>';
  }
  renderFindings();

  /* ---------- Congress action map ---------- */
  $("#acts").innerHTML = D.ACTIONS.map(function (a, i) {
    return '<article class="act" id="act-' + a.id + '"><h3>' + esc(a.title) + "</h3>" +
      '<div class="f"><b>Issue</b>' + esc(a.issue) + "</div>" +
      '<div class="f"><b>Congressional mechanism</b>' + esc(a.mechanism) + "</div>" +
      '<button class="more" aria-expanded="false" aria-controls="m-' + i + '">Show options and outcome</button>' +
      '<div class="more-c" id="m-' + i + '"><div class="f"><b>Options to examine</b><ul>' + a.options.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="f"><b>Expected public outcome</b>' + esc(a.outcome) + '</div><p class="lim">' + esc(a.limit) + "</p></div>" +
      '<div class="sdgs"><span class="fine" style="margin:0">SDG target</span>' + a.sdgs.map(function (t) { return badge(+t.split(".")[0], t); }).join("") + "</div></article>";
  }).join("");
  $$(".act .more").forEach(function (b) {
    b.addEventListener("click", function () {
      var art = b.closest(".act"), open = art.classList.toggle("open");
      b.setAttribute("aria-expanded", open); b.textContent = open ? "Hide options and outcome" : "Show options and outcome";
    });
  });

  /* ---------- Monitor ---------- */
  $("#chain").innerHTML = D.CHAIN.map(function (r, i) {
    return '<div class="crow" id="cr-' + i + '"><button aria-expanded="false" aria-controls="ask-' + i + '">' +
      '<span class="c"><span class="lab">Commitment</span>' + esc(r.commitment) + '</span><span class="ar">→</span>' +
      '<span><span class="lab">Evidence to request</span>' + esc(r.evidence) + '</span><span class="ar">→</span>' +
      '<span><span class="lab">Outcome to track</span>' + esc(r.outcome) + '</span><span class="ar">→</span>' +
      '<span class="sd"><span class="lab">SDG</span>' + esc(r.sdg) + '</span><span class="chev" aria-hidden="true">›</span></button>' +
      '<div class="ask" id="ask-' + i + '"><div><b>Oversight question:</b> ' + esc(r.ask) + "</div></div></div>";
  }).join("");
  $$(".crow>button").forEach(function (b) {
    b.addEventListener("click", function () { var row = b.parentNode, o = row.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
  });
  $("#qs").innerHTML = D.CHAIN.map(function (r) { return "<li>" + esc(r.ask) + "</li>"; }).join("");
  $("#copyQ").addEventListener("click", function () {
    var btn = this, text = D.CHAIN.map(function (r, i) { return (i + 1) + ". " + r.ask; }).join("\n");
    var done = function (m) { btn.textContent = m; setTimeout(function () { btn.textContent = "Copy questions"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done("Copied ✓"); }, function () { done("Copy not available"); });
    else done("Copy not available");
  });

  /* ---------- Youth Agenda ---------- */
  var ST = { a: ["Addressed", "s-a"], p: ["Partially addressed", "s-p"], n: ["Not addressed", "s-n"] };
  var yFilter = "all";
  var all = []; D.YOUTH.groups.forEach(function (g) { g.items.forEach(function (i) { all.push(i[1]); }); });
  var cnt = function (arr, k) { return arr.filter(function (x) { return x === k; }).length; };
  $("#ytotal").innerHTML = ["a", "p", "n"].map(function (k) {
    var c = cnt(all, k); return '<span class="' + ST[k][1] + '" style="width:' + c / all.length * 100 + '%">' + c + " " + ST[k][0].split(" ")[0] + "</span>";
  }).join("");
  $("#ystat").innerHTML = '<button class="pill on" data-y="all" aria-pressed="true">All ' + all.length + "</button>" +
    ["a", "p", "n"].map(function (k) { return '<button class="pill" data-y="' + k + '" aria-pressed="false">' + ST[k][0] + " · " + cnt(all, k) + "</button>"; }).join("");
  function renderYouth() {
    $("#ygroups").innerHTML = D.YOUTH.groups.map(function (g, gi) {
      var st = g.items.map(function (i) { return i[1]; });
      var vis = g.items.filter(function (i) { return yFilter === "all" || i[1] === yFilter; });
      var open = $("#yg-" + gi) ? $("#yg-" + gi).classList.contains("open") : false;
      return '<div class="yg' + ((open || yFilter !== "all") && vis.length ? " open" : "") + (vis.length ? "" : " none") + '" id="yg-' + gi + '"' + (vis.length ? "" : ' style="opacity:.4"') + '><button aria-expanded="false"><h3><span>' + esc(g.name) + '</span><span class="chev" aria-hidden="true">›</span></h3>' +
        '<div class="ymini" aria-hidden="true">' + ["a", "p", "n"].map(function (k) { return cnt(st, k) ? '<i class="' + ST[k][1] + '" style="width:' + cnt(st, k) / st.length * 100 + '%"></i>' : ""; }).join("") + "</div>" +
        '<div class="ycnt">' + cnt(st, "a") + " addressed · " + cnt(st, "p") + " partial · " + cnt(st, "n") + " not addressed</div></button>" +
        '<div class="yitems">' + vis.map(function (i) {
          return '<div class="yi"><span class="st ' + ST[i[1]][1] + '">' + ST[i[1]][0] + "</span>" + esc(i[0]) + '<span class="why">' + esc(i[2]) + "</span></div>";
        }).join("") + "</div></div>";
    }).join("");
    $$(".yg>button").forEach(function (b) {
      var g = b.parentNode; b.setAttribute("aria-expanded", g.classList.contains("open"));
      b.addEventListener("click", function () { var o = g.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
    });
  }
  $$("#ystat .pill").forEach(function (p) {
    p.addEventListener("click", function () {
      yFilter = p.dataset.y;
      $$("#ystat .pill").forEach(function (x) { var on = x === p; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
      renderYouth();
    });
  });
  renderYouth();

  /* ---------- nav highlight ---------- */
  var links = $$("#nav a");
  var secs = links.map(function (a) { return $(a.getAttribute("href")); });
  function onScroll() {
    var y = window.scrollY + 120, cur = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
