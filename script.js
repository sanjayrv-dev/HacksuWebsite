/* ==========================================================================
   ##########################  EDIT HERE  ##########################
   Routine updates (links, officers, meetings) only touch this block.
   ========================================================================== */
var SITE = {
  clubName: "hacksu",
  timezone: "America/New_York",            // IANA zone used to show times and build calendar files
  discordUrl: "https://discord.gg/BFRrXmbS5S",
  instagramUrl: "https://www.instagram.com/_hacksu/",
  linkedinUrl: "",                          // add the club LinkedIn page here; empty hides it
  contactEmail: "hacksuhq@gmail.com",       // empty hides it
  customLinks: [                            // shown on Contact + Resources. icon: link | external | mail | doc | suitable
    { label: "Suitable Page", note: "our official KSU org page", url: "https://app.suitable.co/student-organizations/yEZS8w8H6rpR?tab=profile", icon: "suitable" }
  ]
};

/* Officers, in display order. pos = object-position for the photo crop. */
var OFFICERS = [
  { name: "Sanjay",  role: "President",            major: "CS + Math", color: "#22ff88", pos: "60% 45%", photo: "images/officers/sanjay.jpg",  linkedin: "https://www.linkedin.com/in/sanjayrv" },
  { name: "Prannav", role: "Vice President",       major: "ME",        color: "#22d3ee", pos: "50% 30%", photo: "images/officers/prannav.jpg", linkedin: "https://www.linkedin.com/in/saiprannavmurali/" },
  { name: "Akshat",  role: "Secretary",            major: "CPE",       color: "#a78bfa", pos: "50% 50%", photo: "images/officers/akshat.jpg",  linkedin: "https://www.linkedin.com/in/sai-akshat-chitta/" },
  { name: "Alex",    role: "Head of Marketing",    major: "CPE",       color: "#60a5fa", pos: "50% 28%", photo: "images/officers/alex.jpg",    linkedin: "https://www.linkedin.com/in/alexander-rostovtsev-941ab938a/" },
  { name: "Amrit",   role: "Reservation Delegate", major: "ISyE",       color: "#fbbf24", pos: "50% 38%", photo: "images/officers/amrit.jpg",   linkedin: "https://www.linkedin.com/in/amrit-sarangi-758019316/" },
  { name: "Ishika",  role: "Treasurer",            major: "ISyE",      color: "#fb7185", pos: "50% 20%", photo: "images/officers/ishika.jpg",  linkedin: "https://www.linkedin.com/in/ishikav18/" }
];

/* Meetings. Order does not matter; they are sorted, and past ones disappear on their own.
   start = local wall time in SITE.timezone, "YYYY-MM-DDTHH:mm".
   dateTBD: true  -> "to be announced", no calendar buttons.
   onlineUrl set  -> shows a Join button instead of a map.
   mapEmbedUrl    -> optional exact Google Maps embed URL; otherwise the address is searched.

   Example (copy, uncomment, edit):
   {
     id: "meeting-2026-10-15",
     name: "Kickoff Meeting",
     details: "What we will cover and what to bring.",
     start: "2026-10-15T18:00",
     durationMinutes: 90,
     locationName: "Student Center, Room 000",
     address: "Kennesaw State University, Kennesaw, GA",
     mapQuery: "", mapEmbedUrl: "", onlineUrl: ""
   }
*/
var EVENTS = [];
/* ##########################  END OF CONFIG  ########################## */


(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function h(tag, props) {
    var el = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (v === undefined || v === null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else el.setAttribute(k, v === true ? "" : String(v));
    });
    for (var i = 2; i < arguments.length; i++) {
      var kid = arguments[i];
      if (kid === null || kid === undefined || kid === false) continue;
      el.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    }
    return el;
  }
  function str(v) { return typeof v === "string" ? v.trim() : ""; }
  function safeUrl(u) { u = str(u); return /^(https?:\/\/|mailto:)/i.test(u) ? u : ""; }
  function safeHttps(u) { u = str(u); return /^https:\/\//i.test(u) ? u : ""; }

  /* ---------- icons (trusted constants only) ---------- */
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  var ICONS = {
    instagram: '<svg ' + S + '><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>',
    calendar: '<svg ' + S + '><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    pin: '<svg ' + S + '><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg ' + S + '><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    external: '<svg ' + S + '><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>',
    menu: '<svg ' + S + '><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg ' + S + '><path d="M6 6l12 12M18 6L6 18"/></svg>',
    download: '<svg ' + S + '><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    suitable: '<svg ' + S + '><defs><clipPath id="sc"><path d="M5 3h14v10c0 4-3.5 6.5-7 8-3.5-1.5-7-4-7-8z"/></clipPath></defs><path d="M5 3h14v10c0 4-3.5 6.5-7 8-3.5-1.5-7-4-7-8z"/><g clip-path="url(#sc)"><path d="M3 11L11 3M3 17L17 3M7 21L21 7M13 22l8-8"/></g></svg>',
    link: '<svg ' + S + '><path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/></svg>',
    mail: '<svg ' + S + '><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    doc: '<svg ' + S + '><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    share: '<svg ' + S + '><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    chevron: '<svg ' + S + '><path d="M6 9l6 6 6-6"/></svg>',
    video: '<svg ' + S + '><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4z"/></svg>'
  };
  function icon(name) {
    var span = document.createElement("span");
    span.innerHTML = ICONS[name] || ICONS.link;
    return span.firstChild;
  }

  /* ---------- toast ---------- */
  var toastEl = $("#toast"), toastTimer = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2800);
  }

  /* ---------- scroll reveal ---------- */
  var revealIO = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries, o) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); o.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }) : null;
  function observe(root) {
    $$(".reveal:not(.in)", root).forEach(function (el) {
      if (revealIO) revealIO.observe(el); else el.classList.add("in");
    });
  }

  /* ---------- static bits: icons, links, year ---------- */
  function applySite() {
    $$("[data-icon]").forEach(function (el) { if (!el.firstChild) el.innerHTML = ICONS[el.getAttribute("data-icon")] || ""; });
    $$("[data-link]").forEach(function (el) {
      var u = safeUrl(SITE[el.getAttribute("data-link")]);
      if (u) el.setAttribute("href", u); else el.hidden = true;
    });
    var email = str(SITE.contactEmail);
    $$("[data-email]").forEach(function (a) {
      if (/^[^\s@]+@[^\s@]+$/.test(email)) {
        a.href = "mailto:" + email;
        a.hidden = false;
        if (a.hasAttribute("data-email-text")) a.textContent = email;
      } else a.hidden = true;
    });
    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- mobile menu ---------- */
  function initMenu() {
    var btn = $("#nav-toggle"), nav = $("#site-nav");
    if (!btn || !nav) return;
    function setOpen(open, refocus) {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (!open && refocus) btn.focus();
    }
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && btn.getAttribute("aria-expanded") === "true") setOpen(false, true);
    });
    nav.addEventListener("click", function (ev) { if (ev.target.closest("a")) setOpen(false); });
    document.addEventListener("click", function (ev) {
      if (btn.getAttribute("aria-expanded") === "true" && !nav.contains(ev.target) && !btn.contains(ev.target)) setOpen(false);
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 820) setOpen(false); });
  }

  /* ---------- binary rain (decorative) ---------- */
  function initRain() {
    var canvas = $("#rain");
    var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx) return;

    var R = { fontSize: 15, speed: 0.2, fade: 0.01, density: 0.92, glow: 6, glitch: 0.02, trailDim: 0.55, flushEvery: 3, flushFade: 0.1 };
    var dpr, cols, rows, drops, speeds, lastRow, lastChar, frame = 0, raf = null, vw = 0, vh = 0;

    var hex = (getComputedStyle(document.documentElement).getPropertyValue("--rain").trim() || "#00ff41").replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var n = parseInt(hex, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function lift(v, a) { return Math.round(v + (255 - v) * a); }
    var bodyColor = "rgba(" + r + "," + g + "," + b + "," + R.trailDim + ")";
    var headColor = "rgba(" + lift(r, 0.45) + "," + lift(g, 0.45) + "," + lift(b, 0.35) + ",0.98)";
    var glowColor = "rgba(" + r + "," + g + "," + b + ",0.9)";

    function bit() { return Math.random() < 0.5 ? "0" : "1"; }
    function newSpeed() { return Math.random() < R.density ? R.speed * (0.65 + Math.random() * 0.8) : 0; }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth; vh = window.innerHeight;
      R.fontSize = vw < 700 ? 12 : (vw > 1700 ? 18 : 15);
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = R.fontSize + "px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textBaseline = "top";
      var pD = drops || [], pS = speeds || [];
      cols = Math.ceil(vw / R.fontSize) + 1;
      rows = Math.ceil(vh / R.fontSize);
      drops = new Array(cols); speeds = new Array(cols); lastRow = new Array(cols); lastChar = new Array(cols);
      for (var i = 0; i < cols; i++) {
        if (pD[i] !== undefined) { drops[i] = pD[i]; speeds[i] = pS[i]; }
        else { drops[i] = Math.random() * rows * 1.3 - rows * 0.3; speeds[i] = newSpeed(); }
        lastRow[i] = Math.floor(drops[i]);
        lastChar[i] = bit();
      }
      ctx.clearRect(0, 0, vw, vh);
    }

    function glyph(col, row, ch, head) {
      if (head && R.glow) { ctx.shadowBlur = R.glow; ctx.shadowColor = glowColor; }
      ctx.fillStyle = head ? headColor : bodyColor;
      ctx.fillText(ch, col * R.fontSize, row * R.fontSize);
      if (head && R.glow) ctx.shadowBlur = 0;
    }

    function step() {
      frame++;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0," + (frame % R.flushEvery === 0 ? R.flushFade : R.fade) + ")";
      ctx.fillRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = "source-over";
      for (var i = 0; i < cols; i++) {
        if (speeds[i] === 0) continue;
        var prev = lastRow[i];
        drops[i] += speeds[i];
        var row = Math.floor(drops[i]);
        if (row !== prev) {
          if (prev >= 0 && prev < rows) glyph(i, prev, lastChar[i], false);
          if (row >= 0 && row < rows) { lastChar[i] = bit(); glyph(i, row, lastChar[i], true); }
          lastRow[i] = row;
        }
        if (Math.random() < R.glitch) {
          var gRow = row - 1 - Math.floor(Math.random() * 16);
          if (gRow >= 0 && gRow < rows) glyph(i, gRow, bit(), false);
        }
        if (row > rows + 2) {
          drops[i] = -Math.random() * rows * 0.9;
          lastRow[i] = Math.floor(drops[i]);
          speeds[i] = newSpeed();
        }
      }
    }
    function warmUp(f) { for (var k = 0; k < f; k++) step(); }
    function loop() { step(); raf = requestAnimationFrame(loop); }
    function start() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      resize();
      warmUp(140);
      if (!reduceMotion.matches && !document.hidden) raf = requestAnimationFrame(loop);
    }

    start();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
      else if (!raf && !reduceMotion.matches) raf = requestAnimationFrame(loop);
    });
    var rt = 0, lastW = window.innerWidth;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        /* mobile browsers fire resize as the URL bar hides; only rebuild on real width changes */
        if (Math.abs(window.innerWidth - lastW) < 2 && window.innerHeight <= vh) return;
        lastW = window.innerWidth;
        start();
      }, 200);
    });
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", start);
  }

  /* ---------- officers + modal ---------- */
  function initOfficers() {
    var grids = $$("[data-officers]");
    if (!grids.length) return;

    grids.forEach(function (grid) {
      OFFICERS.forEach(function (o) {
        var btn = h("button", { class: "officer reveal", type: "button", "aria-label": o.name + ", " + o.role + ". View details", style: "--c:" + o.color + ";--pos:" + o.pos },
          h("img", { src: o.photo, alt: "", loading: "lazy", decoding: "async", width: 400, height: 500 }),
          h("div", { class: "officer-info" },
            h("div", { class: "officer-name", text: o.name }),
            h("div", { class: "officer-role", text: o.role }),
            h("div", { class: "officer-major", text: o.major })));
        btn.addEventListener("click", function () { openModal(o, btn); });
        grid.appendChild(btn);
      });
      observe(grid);
    });

    var modal = $("#officer-modal");
    if (!modal) return;
    var box = $(".modal-box", modal), closeBtn = $("#om-close"), last = null;

    function openModal(o, trigger) {
      last = trigger;
      box.style.setProperty("--c", o.color);
      box.style.setProperty("--pos", o.pos);
      $("#om-photo").src = o.photo;
      $("#om-photo").alt = o.name;
      $("#om-name").textContent = o.name;
      $("#om-role").textContent = o.role;
      $("#om-major").textContent = o.major;
      var link = $("#om-link"), u = safeHttps(o.linkedin);
      link.hidden = !u;
      if (u) link.href = u;
      modal.classList.add("is-open");
      document.body.classList.add("no-scroll");
      closeBtn.focus();
    }
    function closeModal() {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      if (last) last.focus();
    }
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "Tab") {   /* keep focus inside the dialog */
        var f = $$("a[href]:not([hidden]), button", box);
        var first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- connect + resource link cards ---------- */
  function linkItems(includeSocial) {
    var items = [];
    if (includeSocial) {
      var d = safeUrl(SITE.discordUrl), i = safeUrl(SITE.instagramUrl), l = safeUrl(SITE.linkedinUrl), em = str(SITE.contactEmail);
      if (d) items.push({ label: "Discord", note: "announcements, team-ups, late-night debugging", url: d, icon: "discord" });
      if (i) items.push({ label: "Instagram", note: "@_hacksu", url: i, icon: "instagram" });
      if (l) items.push({ label: "LinkedIn", note: "follow the club", url: l, icon: "linkedin" });
      if (/^[^\s@]+@[^\s@]+$/.test(em)) items.push({ label: "Email", note: em, url: "mailto:" + em, icon: "mail" });
    }
    (Array.isArray(SITE.customLinks) ? SITE.customLinks : []).forEach(function (c) {
      var u = c && safeUrl(c.url);
      if (u) items.push({ label: str(c.label) || u, note: str(c.note), url: u, icon: ICONS[c.icon] ? c.icon : "link" });
    });
    return items;
  }
  function renderLinks(grid, items) {
    if (!items.length) { grid.appendChild(h("p", { class: "notice", text: "Links coming soon." })); return; }
    items.forEach(function (it) {
      var mail = /^mailto:/i.test(it.url);
      var a = h("a", { class: "link-card reveal", href: it.url },
        h("span", { class: "ico" }, icon(it.icon)),
        h("span", { class: "label" }, it.label, it.note ? h("small", { text: it.note }) : null));
      if (!mail) {
        a.target = "_blank"; a.rel = "noopener noreferrer";
        var x = icon("external"); x.setAttribute("class", "ext"); a.appendChild(x);
      }
      grid.appendChild(a);
    });
    observe(grid);
  }
  function initLinks() {
    $$("[data-links]").forEach(function (g) { renderLinks(g, linkItems(g.getAttribute("data-links") === "all")); });
  }

  /* ======================================================================
     Meetings engine (time zones, calendar links, .ics, map, countdown)
     ====================================================================== */
  var TZ = (function () {
    try { new Intl.DateTimeFormat("en-US", { timeZone: SITE.timezone }); return SITE.timezone; }
    catch (e) { return "America/New_York"; }
  })();

  var partsFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  function partsOf(ts) {
    var o = {};
    partsFmt.formatToParts(new Date(ts)).forEach(function (p) { if (p.type !== "literal") o[p.type] = parseInt(p.value, 10); });
    return { y: o.year, mo: o.month, d: o.day, h: o.hour % 24, mi: o.minute, s: o.second };
  }
  function tzOffset(ts) {
    var p = partsOf(ts);
    return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ts / 1000) * 1000;
  }
  function wallToUtc(y, mo, d, hh, mi) {
    var guess = Date.UTC(y, mo - 1, d, hh, mi, 0), o1 = tzOffset(guess), t = guess - o1, o2 = tzOffset(t);
    if (o2 !== o1) t = guess - o2;
    return t;
  }
  function parseWall(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?$/.exec(str(s));
    if (!m) return NaN;
    var y = +m[1], mo = +m[2], d = +m[3], hh = +m[4], mi = +m[5], chk = new Date(Date.UTC(y, mo - 1, d, hh, mi));
    if (mo < 1 || mo > 12 || hh > 23 || mi > 59 || chk.getUTCMonth() !== mo - 1 || chk.getUTCDate() !== d) return NaN;
    return wallToUtc(y, mo, d, hh, mi);
  }
  function pad(n) { n = String(n); return n.length < 2 ? "0" + n : n; }
  function compactLocal(ts) { var p = partsOf(ts); return p.y + pad(p.mo) + pad(p.d) + "T" + pad(p.h) + pad(p.mi) + pad(p.s); }
  function compactUtc(ts) { return new Date(ts).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  var whenFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  var whenYearFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  function formatWhen(ts) { return (partsOf(ts).y === partsOf(Date.now()).y ? whenFmt : whenYearFmt).format(new Date(ts)); }
  function tzLongName() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "long" }).formatToParts(new Date());
      for (var i = 0; i < parts.length; i++) if (parts[i].type === "timeZoneName") return parts[i].value.replace(/ (Standard|Daylight) Time$/, " Time");
    } catch (e) { /* ignore */ }
    return TZ;
  }

  function normalise(list) {
    var out = [], seen = {};
    (Array.isArray(list) ? list : []).forEach(function (raw, i) {
      if (!raw || typeof raw !== "object") return;
      var tbd = raw.dateTBD === true, dur = Number(raw.durationMinutes), startMs = NaN;
      if (!isFinite(dur) || dur <= 0) dur = 60;
      if (!tbd) {
        startMs = parseWall(raw.start);
        if (isNaN(startMs)) { console.warn("Skipping event \"" + (raw.id || raw.name || i) + "\": invalid start (expected YYYY-MM-DDTHH:mm)"); return; }
      }
      var id = str(raw.id) || ("event-" + i);
      if (seen[id]) id += "-" + i;
      seen[id] = true;
      out.push({
        id: id, name: str(raw.name) || "Untitled meeting", details: str(raw.details), tbd: tbd,
        startMs: startMs, endMs: tbd ? NaN : startMs + dur * 60000,
        locationName: str(raw.locationName), address: str(raw.address), mapQuery: str(raw.mapQuery),
        mapEmbedUrl: safeHttps(raw.mapEmbedUrl), onlineUrl: safeUrl(raw.onlineUrl)
      });
    });
    return out;
  }
  var ALL = normalise(EVENTS);

  function upcoming(now) {
    return {
      dated: ALL.filter(function (e) { return !e.tbd && e.endMs > now; }).sort(function (a, b) { return a.startMs - b.startMs; }),
      tbd: ALL.filter(function (e) { return e.tbd; })
    };
  }
  function sigOf(u) { return u.dated.map(function (e) { return e.id; }).join("|") + "#" + u.tbd.map(function (e) { return e.id; }).join("|"); }

  function mapQueryOf(e) { return e.mapQuery || e.address || e.locationName; }
  function hasMap(e) { return !e.onlineUrl && !!(e.mapEmbedUrl || mapQueryOf(e)); }
  function mapEmbedSrc(e) { return e.mapEmbedUrl || ("https://www.google.com/maps?q=" + encodeURIComponent(mapQueryOf(e)) + "&output=embed"); }
  function mapOpenUrl(e) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapQueryOf(e)); }
  function locationLine(e) {
    var p = [];
    if (e.locationName) p.push(e.locationName);
    if (e.address && e.address !== e.locationName) p.push(e.address);
    if (!p.length && e.onlineUrl) p.push("Online");
    return p.join(", ");
  }
  function descriptionOf(e) { var d = e.details; if (e.onlineUrl) d += (d ? "\n\n" : "") + "Join online: " + e.onlineUrl; return d; }

  function googleUrl(e) {
    return "https://calendar.google.com/calendar/render?" + [
      "action=TEMPLATE", "text=" + encodeURIComponent(e.name),
      "dates=" + compactLocal(e.startMs) + "/" + compactLocal(e.endMs), "ctz=" + encodeURIComponent(TZ),
      "details=" + encodeURIComponent(descriptionOf(e)), "location=" + encodeURIComponent(locationLine(e))
    ].join("&");
  }
  function outlookUrl(e) {
    var iso = function (ts) { return new Date(ts).toISOString().replace(/\.\d{3}Z$/, "Z"); };
    return "https://outlook.live.com/calendar/0/deeplink/compose?" + [
      "path=" + encodeURIComponent("/calendar/action/compose"), "rru=addevent", "subject=" + encodeURIComponent(e.name),
      "startdt=" + encodeURIComponent(iso(e.startMs)), "enddt=" + encodeURIComponent(iso(e.endMs)),
      "body=" + encodeURIComponent(descriptionOf(e)), "location=" + encodeURIComponent(locationLine(e))
    ].join("&");
  }

  function icsEscape(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n"); }
  function foldLine(line) {
    var enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    var out = [], cur = "", bytes = 0, limit = 75;
    for (var ch of line) {
      var len = enc.encode(ch).length;
      if (bytes + len > limit) { out.push(cur); cur = ""; bytes = 0; limit = 74; }
      cur += ch; bytes += len;
    }
    out.push(cur);
    return out.join("\r\n ");
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "club"; }
  function buildIcs(events) {
    var stamp = compactUtc(Date.now()), domain = slug(SITE.clubName) + ".calendar";
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//" + icsEscape(SITE.clubName) + "//Meetings//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:" + icsEscape(SITE.clubName + " meetings")];
    events.forEach(function (e) {
      lines.push("BEGIN:VEVENT", "UID:" + e.id.replace(/[^A-Za-z0-9._-]/g, "-") + "-" + compactUtc(e.startMs) + "@" + domain, "DTSTAMP:" + stamp,
        "DTSTART:" + compactUtc(e.startMs), "DTEND:" + compactUtc(e.endMs), "SUMMARY:" + icsEscape(e.name));
      var d = descriptionOf(e), loc = locationLine(e);
      if (d) lines.push("DESCRIPTION:" + icsEscape(d));
      if (loc) lines.push("LOCATION:" + icsEscape(loc));
      if (e.onlineUrl) lines.push("URL:" + e.onlineUrl);
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.map(foldLine).join("\r\n") + "\r\n";
  }
  function downloadIcs(events, filename) {
    var url = URL.createObjectURL(new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" }));
    var a = h("a", { href: url, download: filename, style: "display:none" });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast("Calendar file downloaded");
  }

  function copyText(text) {
    function legacy() {
      var ta = h("textarea", { readonly: true, style: "position:fixed;top:0;left:0;opacity:0" });
      ta.value = text; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove(); return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, legacy);
    return Promise.resolve(legacy());
  }
  function shareEvent(e) {
    var text = e.name + "\n" + formatWhen(e.startMs) + (locationLine(e) ? "\n" + locationLine(e) : "") + (e.details ? "\n\n" + e.details : "");
    var url = location.href.split("#")[0];
    function fallback() { copyText(text + "\n" + url).then(function (ok) { toast(ok ? "Details copied" : "Could not copy"); }); }
    if (navigator.share) {
      navigator.share({ title: e.name, text: text, url: url }).catch(function (err) { if (!err || err.name !== "AbortError") fallback(); });
    } else fallback();
  }

  function extLink(cls, iconName, label, href) {
    return h("a", { class: cls, href: href, target: "_blank", rel: "noopener noreferrer" }, icon(iconName), label);
  }
  function calendarActions(e, small) {
    var cls = "btn" + (small ? " btn-sm" : "");
    var ics = h("button", { class: cls, type: "button" }, icon("download"), "Download .ics");
    ics.addEventListener("click", function () { downloadIcs([e], slug(e.id) + ".ics"); });
    return h("div", null, h("span", { class: "action-label", text: "Add to calendar" }),
      h("div", { class: "actions" }, extLink(cls, "calendar", "Google", googleUrl(e)), extLink(cls, "calendar", "Outlook", outlookUrl(e)), ics));
  }
  function mapBlock(e, lazy) {
    var frame = h("div", { class: "map-frame" }, h("div", { class: "map-fallback", text: "Map loading. If it stays blank, use the Open in Maps link." }));
    function load() {
      if (frame.querySelector("iframe")) return;
      frame.appendChild(h("iframe", { title: "Map showing " + (e.locationName || e.address || "meeting location"), src: mapEmbedSrc(e), loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: true }));
    }
    var el = h("div", { class: "map-wrap" }, frame, h("div", { class: "map-links" }, extLink("btn btn-sm", "external", "Open in Maps", mapOpenUrl(e))));
    if (!lazy) load();
    return { el: el, load: load };
  }

  function buildEvent(e, featured) {
    var meta = h("div", { class: "meta" },
      h("div", { class: "meta-row" }, icon("clock"), h("span", { class: "when", text: e.tbd ? "Date & time to be announced" : formatWhen(e.startMs) })));
    if (e.locationName || e.address) {
      meta.appendChild(h("div", { class: "meta-row" }, icon(e.onlineUrl ? "video" : "pin"),
        h("span", { class: "where" }, e.locationName || e.address,
          (e.locationName && e.address && e.address !== e.locationName) ? h("small", { text: e.address }) : null)));
    } else if (e.onlineUrl) {
      meta.appendChild(h("div", { class: "meta-row" }, icon("video"), h("span", { class: "where", text: "Online" })));
    }

    var card = h("article", { class: "card event reveal" + (featured ? " featured" : ""), "aria-labelledby": "t-" + e.id });
    var actions = h("div", { class: "stack" });
    if (e.onlineUrl) actions.appendChild(h("div", { class: "actions" }, extLink("btn btn-primary" + (featured ? " btn-lg" : ""), "video", "Join online", e.onlineUrl)));
    if (e.tbd) actions.appendChild(h("span", { class: "tba-note", text: "Calendar buttons appear once the date is set." }));
    else actions.appendChild(calendarActions(e, !featured));
    if (featured) {
      var share = h("button", { class: "btn", type: "button" }, icon("share"), "Share details");
      share.addEventListener("click", function () { shareEvent(e); });
      actions.appendChild(h("div", { class: "actions" }, share));
    }
    var left = h("div", { class: "stack" }, h("h4", { id: "t-" + e.id, text: e.name }), meta, e.details ? h("p", { class: "details", text: e.details }) : null, actions);

    var mapOn = hasMap(e);
    if (featured) {
      var body = h("div", { class: "featured-body" + (mapOn ? " has-map" : "") }, left);
      if (mapOn) body.appendChild(mapBlock(e, false).el);
      card.appendChild(body);
    } else {
      card.appendChild(left);
      if (mapOn) {
        var mb = mapBlock(e, true);
        var chev = icon("chevron"); chev.setAttribute("class", "chev");
        var det = h("details", { class: "map-details" }, h("summary", null, icon("pin"), "Show map", chev), mb.el);
        det.addEventListener("toggle", function () { if (det.open) mb.load(); });
        card.appendChild(det);
      }
    }
    return card;
  }

  function initMeetings() {
    var root = $("#meetings-root"), chipWrap = $("#next-chip-wrap");
    if (!root && !chipWrap) return;
    var limit = root ? parseInt(root.getAttribute("data-limit"), 10) || 0 : 0;  /* 0 = show everything */
    var lastSig = null, countdownEl = null;
    var tz = $("#tz-label"); if (tz) tz.textContent = tzLongName();

    function countdownText(e, now) {
      if (now >= e.startMs) return "happening now";
      var mins = Math.floor((e.startMs - now) / 60000);
      if (mins < 1) return "starting in under a minute";
      var d = Math.floor(mins / 1440), hr = Math.floor((mins % 1440) / 60), m = mins % 60;
      return "in " + (d ? d + "d " : "") + hr + "h " + m + "m";
    }
    function renderChip(next, now) {
      if (!chipWrap) return;
      chipWrap.textContent = "";
      countdownEl = null;
      if (!next) { chipWrap.appendChild(h("a", { class: "chip", href: "meetings.html" }, h("span", { class: "dot" }), "Next meeting: TBA")); return; }
      countdownEl = h("strong", { text: countdownText(next, now) });
      chipWrap.appendChild(h("a", { class: "chip", href: "meetings.html" }, h("span", { class: "dot" }), "Next:", h("span", { text: next.name }), "\u00b7", countdownEl));
    }
    function socials() {
      var wrap = h("div", { class: "hero-cta" }), d = safeUrl(SITE.discordUrl), i = safeUrl(SITE.instagramUrl);
      if (d) wrap.appendChild(extLink("btn btn-primary", "discord", "Join Discord", d));
      if (i) wrap.appendChild(extLink("btn", "instagram", "Follow on Instagram", i));
      return wrap;
    }

    function render(now) {
      var u = upcoming(now), next = u.dated[0] || null, sig = sigOf(u);
      renderChip(next, now);
      if (!root || sig === lastSig) return;
      lastSig = sig;
      root.textContent = "";

      if (!u.dated.length && !u.tbd.length) {
        root.appendChild(h("div", { class: "card empty reveal" },
          h("h3", { text: "No meetings on the calendar yet" }),
          h("p", { text: "We are locking in the next one. Join our Discord or follow us on Instagram and you will be the first to know." }),
          socials()));
        observe(root);
        return;
      }
      if (next) {
        root.appendChild(h("div", { class: "sub-head" }, h("h3", null, h("span", { class: "eyebrow", text: "Up next" }), "Next meeting")));
        root.appendChild(buildEvent(next, true));
        var rest = u.dated.slice(1);
        if (limit) rest = rest.slice(0, limit);
        if (u.dated.length > 1) {
          var head = h("div", { class: "sub-head" }, h("h3", null, h("span", { class: "eyebrow", text: "Coming soon" }), "Future meetings"));
          var all = h("button", { class: "btn btn-sm", type: "button" }, icon("download"), "Add all (.ics)");
          all.addEventListener("click", function () { var cur = upcoming(Date.now()).dated; downloadIcs(cur.length ? cur : u.dated, slug(SITE.clubName) + "-meetings.ics"); });
          head.appendChild(all);
          root.appendChild(head);
          var grid = h("div", { class: "future-grid" });
          rest.forEach(function (e) { grid.appendChild(buildEvent(e, false)); });
          root.appendChild(grid);
        }
      } else {
        root.appendChild(h("p", { class: "notice", text: "No meeting dates are set yet. We will announce dates on Discord and Instagram." }));
      }
      if (u.tbd.length) {
        root.appendChild(h("div", { class: "sub-head" }, h("h3", null, h("span", { class: "eyebrow", text: "Stay tuned" }), "To be announced")));
        var g2 = h("div", { class: "future-grid" });
        u.tbd.forEach(function (e) { g2.appendChild(buildEvent(e, false)); });
        root.appendChild(g2);
      }
      observe(root);
    }
    function tick() {
      var now = Date.now(), u = upcoming(now);
      if (sigOf(u) !== lastSig) { render(now); return; }
      if (countdownEl && u.dated[0]) countdownEl.textContent = countdownText(u.dated[0], now);
    }
    render(Date.now());
    setInterval(tick, 30000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) tick(); });
  }

  /* ---------- boot ---------- */
  applySite();
  initMenu();
  initRain();
  initOfficers();
  initLinks();
  initMeetings();
  observe(document);
})();
