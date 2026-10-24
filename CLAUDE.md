# hacksu website: notes for Claude

## Branches (important)
- `main` = the live site at hacksu.org (GitHub Pages serves `main`). Never commit to, merge into, or push to `main` unless the user explicitly asks to launch/deploy.
- `dev` = the 3D room site (this branch). All work happens here. "push" means `git push origin dev`.
- `git pull` on `dev` before starting; another person works on this branch too.

## The site
- Single static page: `index.html` (inline CSS + JS, three.js r128 from cdnjs) + `img/` officer photos. No build step.
- Preview with `.claude/launch.json`: `hacksu` on Mac (python3), `hacksu-windows` on Windows (python). Both run http.server on port 4321. Opening `index.html` as a file won't load the photos.
- Content lives in the `content` block of the script (`OFFICERS`, `PAGES`, `EVENTS`); the 3D room is under `3d`.
- `OFFICERS` entries are `[name, role, major, linkedin url]`; photo is `img/<name>.jpg`. Photos are b&w until hovered; clicking asks before opening LinkedIn.
- Keep the existing design (black, Archivo, lowercase text, accent swatches) unless asked to change it.

## Writing
- The club name is always "hacksu": lowercase, single k. Never "HackKSU" or "KSU CS Club".
- If any other spelling (names, places, companies) looks wrong, ask before changing it.
- Things still in [brackets] are placeholders waiting for real info; don't invent values for them.
