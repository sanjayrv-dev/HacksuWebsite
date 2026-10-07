# hacksu

Static site, no build step. Six pages share one stylesheet and one script.

```
index.html  leadership.html  meetings.html  resources.html  partnership.html  contact.html
styles.css   design tokens in :root, responsive breakpoints
script.js    config block at the top + rain, menu, officers, meetings engine
```

Run locally: `python -m http.server 4321`, then open http://localhost:4321

## Routine edits (all in the `EDIT HERE` block at the top of script.js)

- **Links / email**: `SITE` (Discord, Instagram, LinkedIn, email, extra links shown on Contact + Resources).
- **Officers**: `OFFICERS` array (photos live in `images/officers/`).
- **Meetings**: `EVENTS` array. Times are in `SITE.timezone`; past meetings vanish automatically; the
  next one gets a countdown chip, map, and Google/Outlook/.ics buttons. Empty array shows a "no meetings yet" card.
- **Colours / fonts**: `:root` in styles.css (`--rain` also recolours the binary rain).

Nav/footer markup is repeated in each HTML file; edit all six when changing it.
