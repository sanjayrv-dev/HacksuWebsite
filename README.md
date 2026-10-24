# hacksu room (3D site prototype)

Static site, no build step: `index.html` (three.js r128 from cdnjs, Archivo from Google Fonts) + `img/` (officer photos).
Pages (nav + clickable room objects): about, leadership, partnerships, resources, gallery, meetings, contact.
Placeholders still in [brackets]: club email, discord invite, instagram handle, meeting day/time/room, advisor blurb, sponsor logos, suitable-page URL.

## Branches

- `main` is the live site at hacksu.org (the current green-rain site). Don't push to it.
- `dev` is this room site. All work on the room happens here.

## Getting started

You need git and Python 3, plus collaborator access to https://github.com/sanjayrv-dev/HacksuWebsite (ask Sanjay).

```bash
git clone https://github.com/sanjayrv-dev/HacksuWebsite.git
cd HacksuWebsite
git switch dev
python -m http.server 4321
```

Then open http://localhost:4321. Use the local server: if you double-click `index.html` instead, some browsers won't load the photos.

## Making changes

1. `git switch dev` and `git pull` before you start.
2. Edit `index.html`. Content (pages, officers, events) is in the `content` block near the top of the script; the 3D room is under `3d`.
3. Refresh http://localhost:4321 to check it.
4. Commit and push to dev:

```bash
git add -A
git commit -m "describe your change"
git push origin dev
```

## Working with Claude

`CLAUDE.md` holds the project rules (branches, the "hacksu" spelling, how to preview), and Claude reads it automatically. Open this folder in Claude Code while on `dev`, and Claude previews the site with the `hacksu` launch config.

## Editing tips

- **Officers:** `OFFICERS` array: `[name, role, major, linkedin url]`. The photo is `img/<name>.jpg`. Keep the name lowercase.
- **Club name:** always written "hacksu" (lowercase).
- **Colors:** `:root` at the top of the `<style>` block. The accent is also switchable with the swatches in the top bar.
