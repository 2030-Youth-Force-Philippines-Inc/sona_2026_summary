(function () {
  "use strict";
  var D = window.DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var TIER = { full: "Covered extensively", brief: "Mentioned briefly", none: "Not covered" };
  var PACE_TXT = { onpace: "On pace to reach 2030 targets.", improving: "Improving since 2015, but slower than needed for 2030.", regress: "Regressing — moving away from 2030 targets.", nodata: "Insufficient indicators to assess pace." };
  var TIER_SHORT = { full: "Extensive", brief: "Brief", none: "None" };
  var byN = function (n) { return D.SDGS.filter(function (s) { return s.n === n; })[0]; };
  var ARROW = '<svg class="ic" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CHECK = '<svg class="ic" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>';
  var ALERT = '<svg class="ic" viewBox="0 0 24 24"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/></svg>';
  var CHEV = '<svg class="ic chev" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>';

  function badge(n, label) {
    if (n === "All") return '<span class="badge" style="background:#13315c">All 17</span>';
    var s = byN(+n);
    return '<span class="badge" style="background:' + s.color + ";color:" + (s.dark ? "#222" : "#fff") + '" title="SDG ' + n + ": " + esc(s.name) + '">' + (label || n) + "</span>";
  }
  function dot(n) { var s = byN(n); return '<span class="dot" style="background:' + s.color + ";color:" + (s.dark ? "#222" : "#fff") + '">' + n + "</span>"; }
  function donut(segs, size, stroke, center) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r, tot = segs.reduce(function (a, s) { return a + s.v; }, 0), off = 0;
    var arcs = segs.map(function (s) {
      var len = s.v / tot * c, el = '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="' + stroke + '" stroke-dasharray="' + len + " " + (c - len) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/>';
      off += len; return el;
    }).join("");
    return '<svg viewBox="0 0 ' + size + " " + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="' + esc(segs.map(function (s) { return s.v + " " + s.label; }).join(", ")) + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#e9edf3" stroke-width="' + stroke + '"/>' + arcs +
      '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="' + size * 0.2 + '" font-weight="600" fill="#1f2937">' + center + "</text></svg>";
  }

  /* ---------- KPI row ---------- */
  var KPIS = [
    { t: "SDGs covered", n: "9", sm: "of 17", c: "rep", s: "extensively · 4 briefly · 4 not covered", href: "#sdgs" },
    { t: "Crisis relief committed", n: "₱60B+", sm: "Commitment", c: "com", s: "~7.5M families, through year-end", href: "#congress" },
    { t: "Legislative requests", n: "4", sm: "proposed", c: "rep", s: "tax, EPIRA, solar, building/waste laws", href: "#congress" },
    { t: "Youth Agenda calls", n: "3", sm: "of 33", c: "com", s: "addressed · 16 partial · 14 not addressed", href: "#youth" }
  ];
  $("#kpis").innerHTML = KPIS.map(function (k) {
    return '<a class="kpi" href="' + k.href + '"><div class="t">' + k.t + ARROW + '</div><div class="n">' + k.n + "<small class=\"" + k.c + "\">" + k.sm + '</small></div><div class="s">' + k.s + "</div></a>";
  }).join("");

  /* ---------- line chart: stated power-project trajectory ---------- */
  (function () {
    var pts = [["Now", 45, 80], ["End 2026", 76, 280], ["2028", 200, 470]], base = 200, k = 0.9;
    var y = function (v) { return base - v * k; };
    var grid = [0, 50, 100, 150, 200].map(function (v) { return '<line x1="50" x2="500" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#e6e9f0"/><text x="40" y="' + (y(v) + 4) + '" text-anchor="end" font-size="12" fill="#9aa3b2">' + v + "</text>"; }).join("");
    var poly = pts.map(function (p) { return p[2] + "," + y(p[1]); }).join(" ");
    var area = "M" + pts[0][2] + "," + base + " L" + poly.replace(/ /g, " L") + " L" + pts[2][2] + "," + base + " Z";
    var marks = pts.map(function (p, i) {
      return '<circle cx="' + p[2] + '" cy="' + y(p[1]) + '" r="5.5" fill="' + (i === 0 ? "#2d6cb4" : "#fff") + '" stroke="#2d6cb4" stroke-width="2.5"/>' +
        '<text x="' + p[2] + '" y="' + (y(p[1]) - 12) + '" text-anchor="middle" font-size="13" font-weight="600" fill="#1f2937">' + p[1] + "</text>" +
        '<text x="' + p[2] + '" y="224" text-anchor="middle" font-size="12.5" fill="#6b7587">' + p[0] + "</text>";
    }).join("");
    $("#lineChart").innerHTML = '<svg viewBox="0 0 520 236" role="img" aria-label="Cumulative power projects: 45 completed now, 76 by end 2026, 200 by 2028 as stated">' + grid +
      '<path d="' + area + '" fill="#2d6cb4" opacity=".1"/><polyline points="' + pts[0][2] + "," + y(45) + " " + pts[1][2] + "," + y(76) + '" fill="none" stroke="#2d6cb4" stroke-width="2.5" stroke-dasharray="6 5"/>' +
      '<polyline points="' + pts[1][2] + "," + y(76) + " " + pts[2][2] + "," + y(200) + '" fill="none" stroke="#2d6cb4" stroke-width="2.5" stroke-dasharray="6 5"/>' + marks +
      '<text x="80" y="' + (y(45) + 26) + '" font-size="11.5" fill="#2d6cb4" text-anchor="middle">completed (reported)</text></svg>';
  })();

  /* ---------- bar chart: passages per SDG ---------- */
  var maxP = 10;
  (function () {
    var x0 = 34, slot = 30, y0 = 186, k = 16;
    var grid = [0, 5, 10].map(function (v) { var y = y0 - v * k; return '<line x1="30" x2="550" y1="' + y + '" y2="' + y + '" stroke="#e6e9f0"/><text x="24" y="' + (y + 4) + '" text-anchor="end" font-size="12" fill="#9aa3b2">' + v + "</text>"; }).join("");
    var bars = D.SDGS.map(function (s, i) {
      var cx = x0 + i * slot + slot / 2, h = Math.max(s.passages * k, s.passages ? 2 : 0), tx = cx;
      var sym = s.tier === "full" ? '<circle cx="' + cx + '" cy="222" r="4.5" fill="#2f7d5f"/>'
        : s.tier === "brief" ? '<circle cx="' + cx + '" cy="222" r="4" fill="#fff" stroke="#c98a1d" stroke-width="1.5"/><path d="M' + cx + ",218 a4 4 0 0 1 0 8 z" + '" fill="#e0a02f"/>'
        : '<circle cx="' + cx + '" cy="222" r="4" fill="#fff" stroke="#c0453d" stroke-width="1.5"/>';
      return '<g class="bar-g" data-n="' + s.n + '" tabindex="0" role="button" aria-label="SDG ' + s.n + " " + esc(s.name) + ": " + s.passages + " passages, " + TIER[s.tier] + '"><title>SDG ' + s.n + " · " + esc(s.name) + ": " + s.passages + " passages · " + TIER[s.tier] + "</title>" +
        '<rect x="' + (cx - slot / 2) + '" y="14" width="' + slot + '" height="226" fill="transparent"/>' +
        '<rect class="sel-ring" x="' + (cx - 13) + '" y="' + (y0 - h - 3) + '" width="26" height="' + (h + 6) + '" rx="5" fill="none" stroke="#13315c" stroke-width="2" opacity="0"/>' +
        (s.passages ? '<rect class="b" x="' + (cx - 10) + '" y="' + (y0 - h) + '" width="20" height="' + h + '" rx="4" fill="' + s.color + '"/>' : '<rect class="b" x="' + (cx - 10) + '" y="' + (y0 - 2) + '" width="20" height="2" rx="1" fill="#c0453d"/>') +
        '<text x="' + tx + '" y="' + (y0 - h - 7) + '" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2937">' + s.passages + "</text>" +
        '<text x="' + cx + '" y="206" text-anchor="middle" font-size="12" fill="#6b7587">' + s.n + "</text>" + sym + "</g>";
    }).join("");
    $("#barChart").innerHTML = '<svg viewBox="0 0 560 236">' + grid + bars + "</svg>";
  })();

  /* ---------- reported results, commitment vs delivery, gaps, alerts ---------- */
  var TOP = [[1, "Social protection", "4Ps and Walang Gutom", "3.5M families"], [2, "Rice distribution", "toward an 8M-family goal", "26,000+ tons"],
    [3, "Preventive health", "YAKAP check-ups", "4.5M"], [11, "Housing", "4PH built or funded", "500,000+ homes"],
    [2, "Land reform", "titles to beneficiaries", "400,000+ titles"], [4, "Skills placement", "TVET", "81%"]];
  $("#topRes").innerHTML = TOP.map(function (r) {
    return '<div class="row">' + dot(r[0]) + '<span class="nm">' + r[1] + "<small>" + r[2] + '</small></span><span class="v">' + r[3] + '</span><span class="chip rep">Reported</span></div>';
  }).join("");

  var CVD = [[7, "Power projects completed", "45 of ~200", 45 / 200 * 100, "22%"], [2, "Families given rice", "2.5M of 8M", 31.25, "31%"],
    [15, "Coconut trees planted", "18M of 100M", 18, "18%"], [16, "Returned to Treasury", "₱800M+ of ~₱25B recovered, frozen or preserved", 3.2, "3%+"]];
  $("#cvd").innerHTML = CVD.map(function (r) {
    return '<div class="prog">' + dot(r[0]) + '<span class="nm">' + r[1] + "<small>" + (r[0] === 16 ? r[2] : "") + '</small></span><span class="track" role="img" aria-label="' + r[4] + '"><i style="width:' + r[3] + '%"></i></span><span class="v">' + (r[0] === 16 ? "₱0.8B+" : r[2]) + '</span><span class="pct">' + r[4] + "</span></div>";
  }).join("");

  $("#gaps").innerHTML = D.SDGS.filter(function (s) { return s.tier === "none"; }).map(function (s) {
    return '<div class="row">' + dot(s.n) + '<span class="nm">' + esc(s.name) + "<small>" + esc(s.claims[0].length > 70 ? s.claims[0].slice(0, 68) + "…" : s.claims[0]) + '</small></span><span class="v">' + s.passages + ' passage' + (s.passages === 1 ? "" : "s") + '</span><span class="track" style="width:70px"><i style="width:' + s.passages / 9 * 100 + '%;background:#ef7b6b"></i></span></div>';
  }).join("");
  $("#gapNote").textContent = "A coverage gap in the speech does not by itself show the goal is unmet. PSA and UN baselines are needed to assess status. Bars scale to the most-covered goal (9 passages).";

  var ALERTS = [
    ["", "SDG 6, 12, 14, 15 — no stated targets", "Ask agencies for baselines and plans", "4 of 17"],
    ["", "Crisis relief runs only to year-end", "No results-monitoring mechanism was described", "₱60B+"],
    ["am", "24-hour relief aim is untested", "Review readiness after the next major event", "919 sites"],
    ["am", "Informal-sector protection undefined", "No policy on legal protection or fair wages was described", "80,000+ covered"]
  ];
  $("#alerts").innerHTML = ALERTS.map(function (a) {
    return '<div class="alert"><span class="ai ' + a[0] + '">' + ALERT + "</span><div><b>" + a[1] + "</b><p>" + a[2] + '</p></div><span class="m ' + a[0] + '">' + a[3] + "</span></div>";
  }).join("");

  /* ---------- SDG explorer ---------- */
  var state = { tier: "all", sdg: null };
  var detail = $("#detail");
  $("#tiles").innerHTML = D.SDGS.map(function (s) {
    return '<button class="tile ' + s.tier + '" data-n="' + s.n + '" role="listitem" aria-label="SDG ' + s.n + " " + esc(s.name) + ", " + TIER[s.tier] + '"><b>' + s.n + "</b><span>" + esc(s.name) + '</span><span class="tr">' + TIER_SHORT[s.tier] + "</span></button>";
  }).join("");

  function applyTier() {
    $$(".tile,.bar-g").forEach(function (el) {
      var s = byN(+el.dataset.n);
      el.classList.toggle("dim", state.tier !== "all" && s.tier !== state.tier);
    });
    $$("[data-tier]").forEach(function (p) { var on = p.dataset.tier === state.tier; p.classList.toggle("on", on); p.setAttribute("aria-pressed", on); });
  }
  $$("[data-tier]").forEach(function (p) { p.addEventListener("click", function () { state.tier = p.dataset.tier; applyTier(); }); });

  function selectSdg(n, scroll) {
    state.sdg = n;
    var s = byN(n);
    $$(".tile,.bar-g").forEach(function (el) { el.classList.toggle("sel", +el.dataset.n === n); });
    var chipCls = s.tier === "full" ? "rep" : s.tier === "brief" ? "com" : "ins";
    detail.innerHTML =
      '<div class="meta">' + badge(n, "SDG " + n) + '<span class="chip ' + chipCls + '">' + TIER[s.tier] + "</span>" +
      '<span class="note">' + s.passages + " passage" + (s.passages === 1 ? "" : "s") + " · targets " + esc(s.targets) + "</span></div>" +
      "<h3>" + esc(s.name) + "</h3>" +
      '<div class="row2"><h4>What the address stated</h4><ul>' + s.claims.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="row2"><h4>What remains unresolved</h4><p class="gapbox' + (s.tier === "none" ? " red" : "") + '">' + esc(s.gap) + "</p></div>" +
      '<div class="row2"><h4>Congressional lens</h4><p>' + esc(s.lens) + "</p></div>" +
      '<div class="row2"><h4>Suggested indicator</h4><p>' + esc(s.indicator) + "</p></div>" +
      '<div class="row2"><h4>PSA pace of progress (data as of May 2026)</h4><p>' + PACE_TXT[s.pace] + '</p></div>' +
      '<div class="row2"><button class="btn" id="seeF">See related findings →</button></div>';
    $("#seeF").addEventListener("click", function () { $("#sdgSel").value = n; fState.sdg = String(n); renderFindings(); location.hash = "#findings"; });
    if (scroll) location.hash = "#sdgs";
  }
  $$(".tile").forEach(function (el) { el.addEventListener("click", function () { selectSdg(+el.dataset.n); }); });
  $$(".bar-g").forEach(function (el) {
    el.addEventListener("click", function () { selectSdg(+el.dataset.n, true); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSdg(+el.dataset.n, true); } });
  });
  applyTier(); selectSdg(7);

  /* ---------- Findings ---------- */
  var fState = { cls: "all", sdg: "all", q: "" };
  $("#classPills").innerHTML = '<button class="on" data-c="all" aria-pressed="true">All ' + D.FINDINGS.length + "</button>" +
    Object.keys(D.CLASSES).map(function (k) {
      var n = D.FINDINGS.filter(function (f) { return f.cls === k; }).length;
      return '<button data-c="' + k + '" aria-pressed="false" title="' + esc(D.CLASSES[k].tip) + '">' + D.CLASSES[k].label + " · " + n + "</button>";
    }).join("");
  $("#sdgSel").innerHTML = '<option value="all">All goals</option>' + D.SDGS.map(function (s) { return '<option value="' + s.n + '">SDG ' + s.n + " · " + esc(s.name) + "</option>"; }).join("");
  $$("#classPills button").forEach(function (p) {
    p.addEventListener("click", function () {
      fState.cls = p.dataset.c;
      $$("#classPills button").forEach(function (x) { var on = x === p; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
      renderFindings();
    });
  });
  $("#sdgSel").addEventListener("change", function (e) { fState.sdg = e.target.value; renderFindings(); });
  $("#q").addEventListener("input", function (e) { fState.q = e.target.value.trim().toLowerCase(); renderFindings(); });
  $("#goSearch").addEventListener("click", function () { setTimeout(function () { $("#q").focus({ preventScroll: true }); }, 400); });
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

  /* ---------- Recommendations (congressional action map) ---------- */
  $("#acts").innerHTML = D.ACTIONS.map(function (a, i) {
    return '<div class="rec" id="act-' + a.id + '"><button aria-expanded="false" aria-controls="m-' + i + '"><span class="ck">' + CHECK + "</span><span><b>" + esc(a.title) + "</b><small>" + esc(a.short) + '</small></span><span class="sd">' +
      a.sdgs.map(function (t) { return badge(t === "All" ? "All" : t.split(".")[0], t); }).join("") + "</span>" + CHEV + "</button>" +
      '<div class="more" id="m-' + i + '"><h4>Issue</h4><p>' + esc(a.issue) + "</p><h4>Congressional mechanism</h4><p>" + esc(a.mechanism) + "</p><h4>Options to examine</h4><ul>" +
      a.options.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul><h4>Expected public outcome</h4><p>" + esc(a.outcome) + '</p><p class="lim">' + esc(a.limit) + "</p></div></div>";
  }).join("");
  $$(".rec>button").forEach(function (b) {
    b.addEventListener("click", function () { var r = b.parentNode, o = r.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
  });
  $(".rec>button").click();

  /* ---------- Monitor ---------- */
  $("#chain").innerHTML = D.CHAIN.map(function (r, i) {
    return '<div class="crow"><button aria-expanded="false" aria-controls="ask-' + i + '">' +
      '<span class="c"><span class="lab">Commitment</span>' + esc(r.commitment) + "</span>" +
      '<span><span class="lab">Evidence to request</span>' + esc(r.evidence) + "</span>" +
      '<span><span class="lab">Outcome to track</span>' + esc(r.outcome) + "</span>" +
      '<span class="sd"><span class="lab">SDG target</span>' + esc(r.sdg) + "</span>" + CHEV + "</button>" +
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
  var ST = { a: ["Addressed", "s-a", "#2f7d5f"], p: ["Partially addressed", "s-p", "#e0a02f"], n: ["Not addressed", "s-n", "#ef7b6b"] };
  var yFilter = "all", all = [];
  D.YOUTH.groups.forEach(function (g) { g.items.forEach(function (i) { all.push(i[1]); }); });
  var cnt = function (arr, k) { return arr.filter(function (x) { return x === k; }).length; };
  $("#dYouth").innerHTML = donut(["a", "p", "n"].map(function (k) { return { v: cnt(all, k), color: ST[k][2], label: ST[k][0] }; }), 150, 20, all.length + "<tspan font-size=\"11\" fill=\"#6b7587\" x=\"50%\" dy=\"1.6em\">calls</tspan>");
  $("#yLegend").innerHTML = ["a", "p", "n"].map(function (k) { return '<span><i style="background:' + ST[k][2] + '"></i>' + ST[k][0] + " · " + cnt(all, k) + "</span>"; }).join("");
  $("#gbars").innerHTML = D.YOUTH.groups.map(function (g) {
    var st = g.items.map(function (i) { return i[1]; });
    return '<div class="gb"><span>' + esc(g.name) + '</span><span class="tr">' + ["a", "p", "n"].map(function (k) { return cnt(st, k) ? '<i class="' + ST[k][1] + '" style="width:' + cnt(st, k) / st.length * 100 + '%"></i>' : ""; }).join("") + "</span><span>" + st.length + "</span></div>";
  }).join("");
  var tc = { full: 9, brief: 4, none: 4 };
  var MINIS = [["Covered extensively", tc.full, 17, "#2f7d5f"], ["Mentioned briefly", tc.brief, 17, "#e0a02f"], ["Not covered", tc.none, 17, "#ef7b6b"], ["Youth calls addressed", 3, 33, "#2d6cb4"]];
  $("#minis").innerHTML = MINIS.map(function (m) {
    return '<div class="mini">' + donut([{ v: m[1], color: m[3], label: m[0] }, { v: m[2] - m[1], color: "#e9edf3", label: "other" }], 84, 11, m[1]) + "<b>" + m[0] + "</b>of " + m[2] + "</div>";
  }).join("");
  $("#ystat").innerHTML = '<button class="on" data-y="all" aria-pressed="true">All ' + all.length + "</button>" +
    ["a", "p", "n"].map(function (k) { return '<button data-y="' + k + '" aria-pressed="false">' + ST[k][0] + " · " + cnt(all, k) + "</button>"; }).join("");
  function renderYouth() {
    $("#ygroups").innerHTML = D.YOUTH.groups.map(function (g, gi) {
      var st = g.items.map(function (i) { return i[1]; });
      var vis = g.items.filter(function (i) { return yFilter === "all" || i[1] === yFilter; });
      var prev = $("#yg-" + gi), open = prev ? prev.classList.contains("open") : false;
      return '<div class="yg' + ((open || yFilter !== "all") && vis.length ? " open" : "") + '" id="yg-' + gi + '"' + (vis.length ? "" : ' style="opacity:.4"') + '><button aria-expanded="false"><h3><span>' + esc(g.name) + "</span>" + CHEV + "</h3>" +
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
  $$("#ystat button").forEach(function (p) {
    p.addEventListener("click", function () {
      yFilter = p.dataset.y;
      $$("#ystat button").forEach(function (x) { var on = x === p; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
      renderYouth();
    });
  });
  renderYouth();

  /* ---------- title menu ---------- */
  var mb = $("#menuBtn"), ml = $("#menuList");
  function setMenu(o) { ml.hidden = !o; mb.setAttribute("aria-expanded", o); }
  mb.addEventListener("click", function (e) { e.stopPropagation(); setMenu(ml.hidden); });
  document.addEventListener("click", function (e) { if (!ml.contains(e.target)) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); mb.focus(); } });
  ml.addEventListener("click", function () { setMenu(false); });
})();
