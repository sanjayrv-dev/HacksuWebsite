/* =============================================================================
   hacksu
   1. binary rain background
   2. scroll reveals
   3. top bar visibility
   ========================================================================== */

(function () {
  "use strict";

  // Update this whenever the Discord invite link expires — nothing else to touch.
  var DISCORD_INVITE = "https://discord.gg/gqnp5JEuG";

  var discordLink = document.getElementById("discord-link");
  if (discordLink) discordLink.href = DISCORD_INVITE;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------------
     1. Binary rain

     Each column drops a glyph one row at a time. The trails aren't drawn — they
     are the residue of previous frames, dimmed a little each frame by the
     translucent black fill in draw(). So `fade` and `speed` together decide how
     long a trail looks: slower fall + weaker fade = longer streaks.
     --------------------------------------------------------------------------- */

  var RAIN = {
    fontSize: 15,     // px — also sets column width (shrunk on narrow screens)
    speed: 0.20,      // rows advanced per frame; lower = slower fall
    fade: 0.010,      // trail length; LOWER = longer trail
    density: 0.92,    // fraction of columns active at once
    glow: 6,          // px of bloom on the leading glyph; 0 disables
    glitch: 0.02,     // odds per column per frame that a trail glyph mutates
    trailDim: 0.55,   // opacity of settled trail glyphs vs. the head

    // A gentle per-frame fade alone can never reach zero: at 8 bits per channel
    // the decay rounds back to itself once a pixel is dim enough, so spent
    // trails would linger forever as a green haze over the whole canvas. Every
    // few frames we take a bigger bite, which is large enough to round faint
    // pixels the rest of the way to transparent. The two rates together give
    // the same trail length as one steady fade, but on a genuinely black field.
    flushEvery: 3,
    flushFade: 0.10
  };

  var canvas = document.getElementById("rain");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (ctx) {
    var dpr, cols, rows;
    var drops, speeds, lastRow, lastChar;
    var bodyColor, headColor, glowColor;
    var raf = null;
    var frame = 0;

    // Pull the rain colour out of the stylesheet so :root stays the one knob.
    var accent = getComputedStyle(document.documentElement)
      .getPropertyValue("--rain").trim() || "#22ff88";

    var rgb = hexToRgb(accent);

    bodyColor = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + RAIN.trailDim + ")";
    // The head is the same hue lifted toward white — bright, but still green.
    headColor = "rgba(" + lift(rgb.r, 0.45) + "," + lift(rgb.g, 0.45) + "," + lift(rgb.b, 0.35) + ",0.98)";
    glowColor = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.9)";

    function hexToRgb(hex) {
      hex = hex.replace("#", "");
      if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      var n = parseInt(hex, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    // Move a channel `amount` of the way toward 255.
    function lift(v, amount) {
      return Math.round(v + (255 - v) * amount);
    }

    function bit() {
      return Math.random() < 0.5 ? "0" : "1";
    }

    function newSpeed() {
      return Math.random() < RAIN.density
        ? RAIN.speed * (0.65 + Math.random() * 0.8)
        : 0; // an inactive column — leaves gaps in the curtain
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Tighter columns on phones, so the curtain still reads as rain and not
      // as a handful of stray digits.
      RAIN.fontSize = window.innerWidth < 700 ? 12 : 15;

      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = RAIN.fontSize + "px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textBaseline = "top";

      var next = Math.ceil(window.innerWidth / RAIN.fontSize) + 1;

      // Preserve existing drop positions on resize so the rain doesn't restart.
      var pDrops = drops || [];
      var pSpeeds = speeds || [];

      cols = next;
      rows = Math.ceil(window.innerHeight / RAIN.fontSize);

      drops = new Array(cols);
      speeds = new Array(cols);
      lastRow = new Array(cols);
      lastChar = new Array(cols);

      for (var i = 0; i < cols; i++) {
        if (pDrops[i] !== undefined) {
          drops[i] = pDrops[i];
          speeds[i] = pSpeeds[i];
        } else {
          // Spread the starting heights across the screen and a little above it,
          // so the curtain is already mid-fall rather than arriving as one wave.
          drops[i] = Math.random() * rows * 1.3 - rows * 0.3;
          speeds[i] = newSpeed();
        }

        lastRow[i] = Math.floor(drops[i]);
        lastChar[i] = bit();
      }

      // The canvas is left transparent over the black page, so clearing it is
      // what "black" means here. Otherwise a resize shows stretched garbage.
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function drawGlyph(col, row, ch, isHead) {
      var x = col * RAIN.fontSize;
      var y = row * RAIN.fontSize;

      if (isHead && RAIN.glow) {
        ctx.shadowBlur = RAIN.glow;
        ctx.shadowColor = glowColor;
      }

      ctx.fillStyle = isHead ? headColor : bodyColor;
      ctx.fillText(ch, x, y);

      if (isHead && RAIN.glow) {
        ctx.shadowBlur = 0;
      }
    }

    function step() {
      var w = window.innerWidth;
      var h = window.innerHeight;

      // Erase a slice of what's already there — this is what makes the trails.
      // destination-out subtracts alpha instead of painting black over it, so
      // spent trails end up truly transparent rather than dark grey-green.
      frame++;

      var bite = (frame % RAIN.flushEvery === 0) ? RAIN.flushFade : RAIN.fade;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0," + bite + ")";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      for (var i = 0; i < cols; i++) {
        if (speeds[i] === 0) continue;

        var prev = lastRow[i];

        drops[i] += speeds[i];

        var row = Math.floor(drops[i]);

        // Only commit a glyph when the column actually advances a whole row.
        // Without this the head would redraw in place every frame and burn
        // itself into a solid bar.
        if (row !== prev) {
          // Demote the old head to a normal trail glyph so only one leads.
          if (prev >= 0 && prev < rows) {
            drawGlyph(i, prev, lastChar[i], false);
          }

          if (row >= 0 && row < rows) {
            lastChar[i] = bit();
            drawGlyph(i, row, lastChar[i], true);
          }

          lastRow[i] = row;
        }

        // Flip a glyph somewhere in the visible trail — the digits shimmer
        // instead of falling as rigid strings.
        if (Math.random() < RAIN.glitch) {
          var back = 1 + Math.floor(Math.random() * 16);
          var gRow = row - back;

          if (gRow >= 0 && gRow < rows) {
            drawGlyph(i, gRow, bit(), false);
          }
        }

        // Recycle once the head has cleared the bottom.
        if (row > rows + 2) {
          drops[i] = -Math.random() * rows * 0.9;
          lastRow[i] = Math.floor(drops[i]);
          speeds[i] = newSpeed();
        }
      }
    }

    function draw() {
      step();
      raf = requestAnimationFrame(draw);
    }

    // Run the simulation forward before the first paint, so the page opens on a
    // fully-formed curtain instead of an empty screen that fills in over ~10s.
    function warmUp(frames) {
      for (var n = 0; n < frames; n++) step();
    }

    resize();

    // The rain always animates, independent of prefers-reduced-motion — it's
    // decorative background texture, not motion the user has to track.
    warmUp(140);
    raf = requestAnimationFrame(draw);

    // Stop animating while the tab is hidden — no point burning battery.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize(); // clears the canvas, so rebuild the trails before painting
        warmUp(140);
      }, 150);
    });
  }

  /* ---------------------------------------------------------------------------
     2. Scroll reveals
     --------------------------------------------------------------------------- */

  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    for (var j = 0; j < revealables.length; j++) {
      revealables[j].classList.add("is-in");
    }
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    for (var k = 0; k < revealables.length; k++) {
      observer.observe(revealables[k]);
    }
  }

  /* ---------------------------------------------------------------------------
     3. Top bar — appears once the hero is behind you
     --------------------------------------------------------------------------- */

  var topbar = document.getElementById("topbar");

  if (topbar) {
    if (document.body.classList.contains("subpage")) {
      // Subpages have no tall hero to scroll past, so the topbar is visible
      // from the start instead of fading in on scroll.
      topbar.classList.add("is-visible");
    } else {
      var onScroll = function () {
        topbar.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.7);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------------------------------------------------------------------------
     4. Leadership crew carousel

     A continuously-drifting band of polaroids (see the "leadership" section
     in index.html), modeled on hackerhousecampus.com's member strip. The
     track's own width is capped to roughly three cards (.crew-track in
     styles.css), and the <li> list is a single roster duplicated once back
     to back, so this only ever has to loop translateX from 0 to -50% and
     wrap — with six distinct people in rotation and three shown at a time,
     nobody appears twice in the visible window at once.

     Driven by rAF instead of a CSS animation so hovering the band can ease
     the speed down smoothly rather than snapping to a hard pause — the
     per-polaroid color/scale reveal on hover is still plain CSS (:hover).
     --------------------------------------------------------------------------- */

  var crewTrack = document.getElementById("crewTrack");

  if (crewTrack && !reduceMotion) {
    var CREW_SPEED = 0.135;       // px/ms while idle — very fast carousel
    var CREW_HOVER_SPEED = 0.085; // px/ms while hovered — slows to previous idle speed
    var CREW_EASE = 0.05;         // how quickly speed transitions between the two

    var crewPos = 0;
    var crewSpeed = CREW_SPEED;
    var crewTargetSpeed = CREW_SPEED;
    var crewHalfWidth = 0;
    var crewLast = null;
    var crewRaf = null;

    function measureCrew() {
      // The list is the roster duplicated once, so half its width is one
      // full loop back to the start.
      crewHalfWidth = crewTrack.scrollWidth / 2;
    }

    function crewFrame(ts) {
      if (crewLast === null) crewLast = ts;
      var dt = Math.min(ts - crewLast, 100); // guard against tab-switch jumps
      crewLast = ts;

      crewSpeed += (crewTargetSpeed - crewSpeed) * CREW_EASE;
      crewPos += crewSpeed * dt;

      if (crewHalfWidth > 0 && crewPos >= crewHalfWidth) crewPos -= crewHalfWidth;

      crewTrack.style.transform = "translateX(" + (-crewPos) + "px)";
      crewRaf = requestAnimationFrame(crewFrame);
    }

    measureCrew();
    window.addEventListener("resize", measureCrew);

    var crewTrackEl = crewTrack.closest(".crew-track") || crewTrack;
    crewTrackEl.addEventListener("mouseenter", function () { crewTargetSpeed = CREW_HOVER_SPEED; });
    crewTrackEl.addEventListener("mouseleave", function () { crewTargetSpeed = CREW_SPEED; });

    crewRaf = requestAnimationFrame(crewFrame);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (crewRaf) cancelAnimationFrame(crewRaf);
        crewRaf = null;
      } else if (!crewRaf) {
        crewLast = null;
        crewRaf = requestAnimationFrame(crewFrame);
      }
    });
  }

  /* ---------------------------------------------------------------------------
     5. Partnerships form

     Posted to Formspree (see the form's `action` in partnerships.html) via
     fetch instead of a plain HTML submit, so a successful send swaps in a
     thank-you message in place of the form rather than navigating away to
     Formspree's own page. Checkbox groups have no native "pick at least one"
     validation, so that one check is done here.
     --------------------------------------------------------------------------- */

  var partnerForm = document.getElementById("partnerForm");

  if (partnerForm) {
    var interestError = document.getElementById("interestError");
    var formStatus = document.getElementById("formStatus");
    var sendBtn = partnerForm.querySelector(".btn-send");

    function interestChecked() {
      return partnerForm.querySelectorAll('input[name="interest"]:checked').length > 0;
    }

    // Clear the "pick at least one" error the moment one gets checked.
    var interestBoxes = partnerForm.querySelectorAll('input[name="interest"]');
    for (var b = 0; b < interestBoxes.length; b++) {
      interestBoxes[b].addEventListener("change", function () {
        if (interestChecked()) interestError.hidden = true;
      });
    }

    function showStatus(text, kind) {
      formStatus.textContent = text;
      formStatus.hidden = false;
      formStatus.className = "form-status" + (kind ? " " + kind : "");
    }

    partnerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!interestChecked()) {
        interestError.hidden = false;
        interestError.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
        return;
      }

      sendBtn.disabled = true;
      showStatus("sending…", "");

      fetch(partnerForm.action, {
        method: "POST",
        body: new FormData(partnerForm),
        headers: { "Accept": "application/json" }
      }).then(function (response) {
        if (response.ok) {
          partnerForm.hidden = true;
          showStatus("thanks — we'll be in touch soon.", "is-ok");
        } else {
          return response.json().then(function (data) {
            var msg = (data && data.errors && data.errors.map(function (er) { return er.message; }).join(", "))
              || "something went wrong — please email us directly instead.";
            showStatus(msg, "is-error");
            sendBtn.disabled = false;
          });
        }
      }).catch(function () {
        showStatus("something went wrong — please email us directly instead.", "is-error");
        sendBtn.disabled = false;
      });
    });
  }

  /* --------------------------------------------------------------------------- */

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
