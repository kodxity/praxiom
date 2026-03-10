# Praxiom - UI Style Guide

> **Reference file:** `ui.html` in the workspace root is the authoritative visual spec.  
> All pages and components should match the component library defined there.

---

## 1. Core Aesthetic

**Glassmorphism/minimalism/doodle**  

---

## 2. Color Tokens

All colors are CSS custom properties on `:root`. Never use hardcoded hex values in components - always use the token.

```css
/* Backgrounds */
--bg:  #eeeae3   /* main page background */
--bg2: #e8e3db   /* slightly darker alt background */

/* Glass surfaces */
--glass:              rgba(255,255,255,0.68)
--glass-hover:        rgba(255,255,255,0.82)
--glass-strong:       rgba(255,255,255,0.90)
--glass-border:       rgba(255,255,255,0.52)
--glass-border-strong:rgba(255,255,255,0.78)

/* Ink (text hierarchy: darkest → faintest) */
--ink:  #18160f   /* primary text, headings */
--ink2: #2e2b22   /* secondary text */
--ink3: #5a5548   /* body copy, labels */
--ink4: #8a8274   /* muted text, metadata */
--ink5: #bfb8ad   /* placeholder, dividers */

/* Accent colors */
--sage:         #6b9478   /* primary brand / success / correct */
--sage-bg:      rgba(107,148,120,0.10)
--sage-border:  rgba(107,148,120,0.22)

--rose:         #b8604e   /* error / wrong / danger */
--rose-bg:      rgba(184,96,78,0.09)
--rose-border:  rgba(184,96,78,0.22)

--amber:        #b8853a   /* XP / reward / archon rank */
--amber-bg:     rgba(184,133,58,0.10)
--amber-border: rgba(184,133,58,0.22)

--slate:        #5878a0   /* info / seeker rank / hints */
--slate-bg:     rgba(88,120,160,0.10)
--slate-border: rgba(88,120,160,0.22)

--violet:       #7b6aab   /* legend rank / expert */
--violet-bg:    rgba(123,106,171,0.10)
--violet-border:rgba(123,106,171,0.22)
```

### Shadow tokens
```css
--shadow:    0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)
--shadow-lg: 0 16px 48px rgba(0,0,0,0.11), 0 4px 12px rgba(0,0,0,0.06)
--shadow-xl: 0 32px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08)
```

### Border radii
```css
--r:    14px   /* buttons, inputs, most cards */
--r-lg: 20px   /* glass cards (.g) */
--r-xl: 28px   /* theme containers, modals */
```

---

## 3. Typography

Four font families, each with a specific semantic role:

| Variable      | Font             | Use                                          |
|---------------|------------------|----------------------------------------------|
| `--ff-display`| Instrument Serif | Large headings, titles, italicised accents   |
| `--ff-body`   | DM Sans          | Body copy, paragraphs, default text          |
| `--ff-ui`     | Instrument Sans  | Button labels, nav links, table headers, UI  |
| `--ff-mono`   | JetBrains Mono   | Numbers, metadata, timestamps, code, badges  |

### Usage rules
- **Display** headings are **italic** - the italic slant is the brand personality.
- **Mono** is used for *all* numbers and metadata (ratings, XP, timestamps, problem numbers, rank labels).
- **UI** font is used for interactive elements - buttons, links, form labels, nav items.
- Body weight is typically `300` (light) for paragraph text; `500` for emphasis.
- Section labels (`.sec-label`) use mono at `10px`, `0.22em` letter-spacing, `--ink5` color, dashed bottom border.

### Size scale
```
Display hero:    clamp(40px, 5.5vw, 64px)
Page h1:         clamp(32px, 4vw, 52px)  
Section title:   22–28px, Instrument Serif italic
Card title:      17–22px, display
Body:            15–16px, 300 weight, 1.65–1.78 line-height
Small/meta:      12–13px
Mono micro:      9–11px
Badge/label:     9–10px, 0.08–0.22em letter-spacing
```

---

## 4. Glass Cards (`.g`)

The primary surface primitive. Every content container should be a glass card.

```css
.g {
  background: rgba(255,255,255,0.68);
  backdrop-filter: blur(22px) saturate(1.5);
  border: 1px solid rgba(255,255,255,0.52);
  box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  border-radius: 20px;
}
```

**Rules:**
- Use `.g` for all cards, panels, and containers
- Use `.g-strong` for elevated surfaces (modals, dropdowns)
- Never use opaque white backgrounds - always frosted glass
- Cards hover: `translateY(-2px)` + `--shadow-lg`
- Padding is inline - add `style={{ padding: '24px 28px' }}` etc.

---

## 5. Buttons

All buttons share the `.btn` base class.

```
.btn-ink    → dark ink fill, white text (primary actions)
.btn-sage   → sage green fill, white text (positive/contest actions)
.btn-glass  → frosted glass, ink text (secondary)
.btn-ghost  → transparent, ink3 text, ink5 border (tertiary)
.btn-danger → rose tinted (destructive)
```

**Sizes:** `.btn-lg`, `.btn-sm`, `.btn-xs`  
**Icon button:** `.btn-icon` (38×38px, square)

Rules:
- Buttons have `border-radius: var(--r)` (14px)
- `font-family: var(--ff-ui)`, `font-size: 14px`, `font-weight: 500`
- `::after` pseudo with white overlay on hover (baked into `.btn`)
- `active` state: `scale(0.97)`
- Default padding: `12px 26px` (ink), `12px 22px` (others)

---

## 6. Tags & Badges

```html
<span class="tag">default</span>
<span class="tag tag-sage">success</span>
<span class="tag tag-rose">error</span>
<span class="tag tag-amber">xp / reward</span>
<span class="tag tag-slate">info</span>
<span class="tag tag-violet">expert</span>
```

Tags use `font-family: var(--ff-mono)`, `font-size: 10px`, `letter-spacing: 0.08em`, `border-radius: 100px`.

### Rank badges
```html
<span class="rank-badge rank-initiate">Initiate</span>  <!-- default, < 1400 -->
<span class="rank-badge rank-seeker">Seeker</span>       <!-- slate, 1400–1999 -->
<span class="rank-badge rank-legend">Legend</span>       <!-- violet, 2000–2399 -->
<span class="rank-badge rank-archon">Archon</span>       <!-- amber, 2400+ -->
```

**Important:** Rank names are always `Initiate / Seeker / Legend / Archon`. Never use Codeforces names (Newbie, Expert, Master etc.).

---

## 7. Layout

```
Max content width: 1360px  (var for most pages)
Leaderboard max:   760px
Profile max:       1100px
Side padding:      1.75rem (28px)
Section gap:       48–80px
Card gap:          16–20px
```

### Page structure
```html
<div style="position:relative; z-index:1; max-width:1360px; margin:0 auto; padding:48px 1.75rem 80px;">
  <!-- content -->
</div>
```

Ambient blobs (`.blobs`) are fixed, z-index 0. All content sits at z-index 1+.

---

## 8. Skeleton Screens

Every async data section needs a skeleton loading state.

```html
<!-- Text line -->
<div class="skel skel-t" style="width:80%"></div>

<!-- Small text -->
<div class="skel skel-t-sm" style="width:60%"></div>

<!-- Large text / heading -->
<div class="skel skel-t-lg" style="width:40%"></div>

<!-- Button shape -->
<div class="skel skel-btn" style="width:120px"></div>

<!-- Circle (avatar) -->
<div class="skel skel-circ" style="width:56px;height:56px"></div>
```

The `.skel` class provides the `rgba(0,0,0,0.065)` base and the `::after` gleam animation (1.7s, ease-in-out, infinite).

---

## 9. Leaderboard (`.lb-card`)

```html
<div class="g lb-card">
  <div class="lb-head">
    <div style="font-family:var(--ff-display);font-size:20px;">The Conclave</div>
    <div class="lb-filters">
      <button class="lb-filter active">All Time</button>
      <button class="lb-filter">This Week</button>
    </div>
  </div>

  <!-- Row -->
  <div class="lb-row">
    <span class="lb-rank gold">1</span>
    <div class="avatar avatar-sm">T</div>
    <div style="flex:1">
      <div class="lb-name">Username</div>
      <div class="lb-sub-info">
        <span class="rank-badge rank-archon">Archon</span>
        <span style="margin-left:6px">4 contests</span>
      </div>
    </div>
    <span class="lb-score" style="color:var(--amber)">2840</span>
  </div>
</div>
```

Colors: `gold → #b87a28` | `silver → #7a90a8` | `bronze → #a06848`

---

## 10. User Profile

Structure from ui.html Section F:

```html
<div class="g profile-hero">
  <div class="profile-top">
    <div class="avatar">V</div>
    <div>
      <div class="profile-name">Username</div>
      <div class="profile-handle">@username · joined Oct 2024</div>
      <span class="rank-badge rank-archon">⬡ ARCHON II</span>
    </div>
  </div>

  <!-- 4-column stat grid -->
  <div class="stat-grid">
    <div class="g stat-block">
      <div class="stat-val">63</div>
      <div class="stat-label">Solved</div>
    </div>
    <!-- ... -->
  </div>
</div>
```

Avatars:
- `.avatar` - 64px, circular, gradient background, display initials
- `.avatar-sm` - 36px (leaderboard rows)
- `.avatar-xs` - 28px (compact contexts)

---

## 11. Submission Rows (`.sub-row`)

```html
<div class="sub-row">
  <span class="verdict-chip v-correct">✓ Correct</span>
  <div style="flex:1">
    <div style="font-family:var(--ff-ui);font-size:14px;font-weight:500;">Problem Title</div>
    <div style="font-size:12px;color:var(--ink5);">Answer: 385</div>
  </div>
  <span class="tag">Number Theory</span>
  <span style="font-family:var(--ff-mono);font-size:10px;color:var(--ink5);">2 min ago</span>
</div>
```

Verdict classes: `.v-correct` | `.v-wrong` | `.v-pending`

---

## 12. Contest Themes

### Light theme (global)
Default glass card style, warm parchment background, sage accents.

### Dark theme (Jade City)
Applied via `.theme-jade` container when `theme.navVariant === 'dark'`.

```html
<div class="theme-jade">
  <div class="theme-jade-doodle"></div>
  <div class="theme-jade-overlay"></div>
  <div class="theme-jade-content">
    <p class="jade-eyebrow">JADE CITY · CONTEST</p>
    <h1 class="jade-title">The Demon Hunter's Trial</h1>
    <p class="jade-sub">Description text</p>
    <!-- Use jade-glass for inner panels -->
    <div class="jade-glass" style="padding:28px 32px">...</div>
    <!-- Buttons -->
    <a class="jade-btn-primary">Enter →</a>
    <a class="jade-btn-ghost">Standings</a>
  </div>
</div>
```

The `.theme-jade` background: `linear-gradient(160deg, #0d1a12, #112018, #0a140d)`  
All text inside is `rgba(200,240,200,0.92)` - pale green-white.

---

## 13. Problem Browser (`.prob-row` list view)

```html
<div class="g" style="overflow:hidden">
  <!-- Header -->
  <div style="padding:14px 20px 12px;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;gap:14px;">
    <span class="prob-num">#</span>
    <span style="flex:1;font-family:var(--ff-mono);font-size:10px;">TITLE</span>
    <span class="prob-topic">TOPIC</span>
    <span class="prob-rate">RATE</span>
    <span class="prob-xp">XP</span>
  </div>

  <!-- Row -->
  <div class="prob-row">
    <span class="prob-num">001</span>
    <div class="diff-dot diff-e"></div>   <!-- easy: sage -->
    <span class="prob-title">Title</span>
    <span class="prob-topic tag">Number Theory</span>
    <span class="prob-rate">72%</span>
    <span class="prob-xp">+80 XP</span>
    <div class="solved-icon">✓</div>   <!-- if solved -->
  </div>
</div>
```

Difficulty dot classes: `.diff-e` (easy/sage) | `.diff-m` (medium/amber) | `.diff-h` (hard/rose) | `.diff-x` (expert/violet)

---

## 14. Animations

All enter animations: use `.fade-in`, `.fade-in-d`, `.fade-in-d2`, `.fade-in-d3` (staggered 0.12s each).

```html
<div class="g fade-in">First card</div>
<div class="g fade-in-d">Second (delayed)</div>
<div class="g fade-in-d2">Third</div>
```

For list items with custom delay:
```tsx
style={{ animation: 'fade-in 0.52s both', animationDelay: `${i * 0.04}s` }}
```

Other utilities: `.scale-in`, `.slide-left` for directional reveals.  
Spinner: `<span class="spin" />` (white border) or `<span class="spin spin-dk" />` (dark).

---

## 15. Section Labels

Used to label major sections (from ui.html sidebar):
```html
<p class="sec-label">B - Problem Browser</p>
```

This renders as: small 5px bullet · SMALL MONO TEXT · dashed underline.

---

## 16. Inputs

```html
<input class="input" placeholder="Search…" />
<input class="input-math" placeholder="enter answer" />  <!-- large centered math input -->
```

States: `.input-err` (rose border) | `.input-ok` (sage border)  
Focus: `border-color: var(--ink3)` + subtle box-shadow.

The math answer input (`.input-math`) is 26px mono text, centered, with 2px border and `border-radius: var(--r-lg)`.

---

## 17. Tailwind v4 Compatibility

**This project uses Tailwind v4** (`@import "tailwindcss"`). Tailwind utility classes **do not reliably apply** for layout. 

**Never use these for layout in components:**
- `flex`, `items-center`, `gap-*`, `px-*`, `py-*`, `space-y-*`
- `text-xl`, `font-semibold`, `text-muted-foreground`  
- `bg-card`, `bg-muted`, `from-card`, `to-muted/50`
- `md:grid-cols-2`, `md:col-span-2`

**Instead, always use:**
- Inline `style={{ ... }}` for all layout
- The explicit CSS classes defined in `globals.css` (`.g`, `.btn-*`, `.tag-*`, `.rank-badge`, etc.)

---

## 18. Custom Cursor (GONE)

Implemented in `CustomCursor.tsx` - renders a simplified Windows arrow cursor (SVG polygon) on pointer:fine devices only.

- Arrow tip aligns with actual pointer coordinates
- **Idle:** dark ink fill (`var(--ink2)`) with white outline for visibility
- **Hover** (over interactive elements): fill turns sage green, slight scale up
- **Click:** scale down, lower opacity

The cursor is injected in `layout.tsx` before the ambient blobs.

---

## 19. Quick Reference Checklist

When building a new page/component, verify:

- [ ] All layout uses inline styles or explicit CSS classes (no Tailwind v4 layout utilities)
- [ ] Text in headings uses `var(--ff-display)` (Instrument Serif, italic)
- [ ] Metadata/numbers use `var(--ff-mono)` (JetBrains Mono)
- [ ] All colors reference CSS custom properties, not hardcoded hex
- [ ] Cards use `.g` (glass) - not white backgrounds
- [ ] Rank names are Initiate / Seeker / Legend / Archon (not Codeforces names)
- [ ] Loading states use `.skel` gleam animation
- [ ] Fade-in animations applied to cards (`.fade-in`, `.fade-in-d`, `.fade-in-d2`)
- [ ] Contest hero uses dark Jade City theme if `theme.navVariant === 'dark'`
- [ ] Buttons use `.btn` base + variant class (`.btn-ink`, `.btn-sage`, `.btn-ghost`, etc.)
