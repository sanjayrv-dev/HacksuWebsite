/* =============================================================================
   hacksu
   1. binary rain background
   2. scroll reveals
   3. top bar visibility
   ========================================================================== */

(function () {
  "use strict";

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

  /* --------------------------------------------------------------------------- */

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
