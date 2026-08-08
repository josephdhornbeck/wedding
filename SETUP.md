# Joseph & Maria — Wedding Site (v3) Setup & Editing Guide

Your site is now a **seven-page site** that shares one look and one nav. It's already
live at **josephandmaria2027.com** (GitHub Pages + Porkbun DNS + HTTPS are done).
This guide covers the new structure, the one file you edit for almost everything,
and how to finish the invite-code RSVP system.

---

## What's in the folder

**Pages (upload all of these):**
`index.html` (Home) · `story.html` · `faq.html` (Info) · `party.html` ·
`registry.html` · `rsvp.html` · `fun.html`

**Shared assets:**
- `assets/config.js` — **the one file you edit for almost everything** (dates, venues,
  password, registry, timeline, gallery, wedding party, trivia, polls).
- `assets/styles.css` — the whole design system + the liquid-glass nav.
- `assets/nav.js`, `gate.js`, `render.js`, `weather.js`, `rsvp.js`, `fun.js` — behavior.

**Data:** `images/`, `fonts/`, `apps-script/Code.gs` (the RSVP + fun backend).

**Not part of the website** (do NOT upload): `guest-list-template.xlsx`,
`Wedding website landscape.pdf`, and any `.zip`.

> Every editable value is marked `TODO` in `assets/config.js`. Open it in any text
> editor (or on GitHub) and fill things in as they firm up.

---

## Part A — Finish the invite-code RSVP system

The RSVP now works by **invite code**: each household gets a unique code (printed on
their invitation), types it, and RSVPs for everyone in their party with checkboxes.
Plus-ones appear **only** for people you flag, and can't RSVP themselves.

**1. Fill the workbook.** Open `guest-list-template.xlsx`:
- **Households** tab: 160 unique invite codes are pre-generated. Keep one row per
  invitation; add a Household Label (for your eyes). Delete unused rows.
- **Guests** tab: one row per invited person — their Party ID (matches Households),
  their name, and `Y`/`N` for Has Plus-One.

**2. Import it into your Google Sheet.** In `Wedding RSVPs`:
`File → Import → Upload → guest-list-template.xlsx → Insert new sheet(s)`.
You now have `Households` and `Guests` tabs in your private sheet.

**3. Update the backend.** In the sheet: `Extensions → Apps Script`. Select all, delete,
paste the new `apps-script/Code.gs`, **Save**.

**4. Run the one-time setup.** In the editor's function dropdown pick **`setupSheets`**,
click **▶ Run**, approve permissions. It creates the `RSVPs`, `Guestbook`, and `Polls`
tabs (and tells you if the workbook import is missing).

**5. Publish it.** `Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy`.
The Web app URL stays the same. **This step is required after every Code.gs change.**

**6. Open the RSVP** when invitations mail: set `RSVP_OPEN: true` in `assets/config.js`
and re-upload it. (Leave it `false` until then — guests see a "save the date" note.)

> Headcount later: on the `RSVPs` tab, `=COUNTIF(D:D,"Yes")` = total attending.
> Re-submitting a code replaces that party's old rows (no duplicates).

---

## Part B — Password gate

The site is behind a simple password (a "locked screen door" — it deters strangers but
isn't military-grade; your real private data lives only in the Google Sheet). In
`assets/config.js` set **`GATE_PASSWORD`** to the word you'll print on invitations.
To turn it off entirely, set `GATE_ENABLED: false`.

---

## Part C — Registry & honeymoon fund

In `assets/config.js`:
- **`MYREGISTRY_URL`** — create a free MyRegistry account (adds items from any store,
  tracks purchases so nothing's bought twice), then paste your page URL. It embeds
  right into the Registry page.
- **`VENMO_USER`** — your Venmo username (no `@`). Adds a one-tap "Give with Venmo"
  button. For the day-of QR, drop a `images/venmo-qr.png` (export from the Venmo app).

---

## Part D — Content (all in `assets/config.js`)

- **Venues** — set the reception `name` and `address` (address auto-builds Google/Apple/
  Waze links and the timeline stop).
- **`RSVP_DEADLINE`** — shows on Home, RSVP, and FAQ.
- **`TIMELINE`** — the hour-by-hour schedule.
- **`GALLERY`** — story-page photos + captions (add images to `images/`).
- **`PARTY_ADULTS`** (16: photo + name + role + one-liner) and **`PARTY_KIDS`**
  (flower girls + bridal security — **first names only**).
- **`TRIVIA`** and **`POLLS`** — the Fun page games.
- The **welcome note** (Home), **dress code**, and **FAQ** answers are text inside
  `index.html` and `faq.html` — search for `TODO`.

Party photos go in `images/` (e.g. `images/party/abby.jpg`) and are referenced by the
`photo:` field.

---

## Part E — Guestbook & polls (Fun page)

- **Guestbook:** messages land on a `Guestbook` tab with an **Approved?** checkbox.
  Nothing shows on the site until you tick the box — so you always see notes first.
- **Polls:** votes tally live on a `Polls` tab; results show right after a guest votes.

---

## Uploading updates to the live site

On GitHub (repo `wedding`): `Add file → Upload files`, drag in the changed files
(keep the `assets/`, `images/`, `fonts/` folder structure), **Commit changes**.
Live in about a minute. To edit one value, you can also click the file on github.com,
hit the ✏️ pencil, change it, and commit.

---

## Your homework checklist

- [ ] Reception venue name + address
- [ ] Full timeline hours (`TIMELINE`)
- [ ] Welcome note (Home) — or ask and we'll draft it
- [ ] `RSVP_DEADLINE`
- [ ] Guest workbook filled + imported; Code.gs pasted, `setupSheets` run, re-deployed
- [ ] `GATE_PASSWORD`
- [ ] MyRegistry URL + Venmo username (+ optional `images/venmo-qr.png`)
- [ ] Wedding party names / roles / one-liners / photos
- [ ] Gallery photos + captions
- [ ] Trivia questions + poll questions
- [ ] When invitations mail: `RSVP_OPEN: true`
