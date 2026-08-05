# hacksu

Static site. No build step, no dependencies — three files.

```
index.html    content
styles.css    design system (all knobs live in :root)
script.js     binary rain, scroll reveals, top bar
```

## Run it

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321. (Opening `index.html` directly works too, but a
server is closer to how it'll actually be hosted.)

## Things you'll want to change first

**Social links** — `index.html`, the `.social` nav. Discord and Instagram are
live; **linkedin is still an `href="#"` placeholder**. Add an email one by
copying a line and using `href="mailto:you@example.com"`.

**Colors** — `styles.css`, `:root`. `--rain` sets the binary green; the JS reads
it from there, so changing that one value recolors the background.

**Rain feel** — `script.js`, the `RAIN` object at the top:

| knob | does |
|---|---|
| `fontSize` | column width and character size |
| `speed` | how fast drops fall — lower is slower |
| `fade` | trail length — **lower is longer** |
| `density` | fraction of columns active; lower leaves more gaps |
| `glow` | bloom on the leading digit; `0` turns it off |
| `glitch` | how often digits flicker mid-trail |
| `trailDim` | brightness of the trail vs. the bright head |
| `flushEvery` / `flushFade` | keeps the background truly black — see below |

Two notes on that last pair. A single gentle per-frame fade can never actually
reach zero: at 8 bits per channel the decay rounds a dim pixel back to itself,
so spent trails pile up into a permanent green haze. Every `flushEvery` frames
the code takes a bigger bite (`flushFade`) that's large enough to round faint
pixels the rest of the way out. If you lower `fade` for even longer trails and
the black starts looking milky, raise `flushFade` slightly.

The rain is also simulated forward ~140 frames before the first paint, so the
page opens on a full curtain instead of filling in over several seconds.

## Adding sections later

Copy a `<section class="section">` block. Put `reveal` on anything that should
fade up as it scrolls into view — the observer picks it up automatically.

The students and patrons sections were left out on purpose. When you add them,
they slot in after `#about`.

## Deploying

Any static host works. Drag the folder into Netlify, or push to GitHub and turn
on Pages — there's nothing to compile.
