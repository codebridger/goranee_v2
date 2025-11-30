# Goranee.ir Design System (v1)

**Theme:** Electric Melody (Inspired by NeoBeat WP template)
**Philosophy:** Soft backgrounds, vibrant gradients, and organic geometry.

## 1. Design Tokens (The Foundations)

### 1.1 Color Palette

We utilize a semantic color system that adapts to Light and Dark modes.

**Primary Surfaces (Canvas)**

* `$surface-base`:
    * **Light:** `#FDF2F0` (Soft Blush) - *Main background.*
    * **Dark:** `#130A12` (Deep Void) - *Warm, deep purple-black.*

* `$surface-card`:
    * **Light:** `#FFFFFF` (Pure White) - *Cards, modals, sticky headers.*
    * **Dark:** `#1F121D` (Midnight) - *Slightly lighter purple-brown for depth.*

* `$surface-glass`:
    * **Light:** `rgba(255, 255, 255, 0.7)`
    * **Dark:** `rgba(19, 10, 18, 0.7)`

**Text & Content**

* `$text-primary`:
    * **Light:** `#2A1B28` (Deep Aubergine) - *Headings, main lyrics.*
    * **Dark:** `#EDDEEB` (Pale Pink / Off-White) - *Ensures high contrast without eye strain.*

* `$text-secondary`:
    * **Light:** `#6B5A68` (Muted Violet) - *Metadata, sub-labels.*
    * **Dark:** `#9CA3AF` (Cool Gray) - *Receded information.*

* `$text-accent`: `#FF2E93` (Hot Pink) - *Active states, links (remains consistent).*

**Borders & Dividers**

* `$border-subtle`:
    * **Light:** `#FBCFE8` (Pink 200)
    * **Dark:** `rgba(255, 255, 255, 0.1)` (10% White)

**Brand Gradients**

* `$grad-primary`: `linear-gradient(135deg, #FF2E93 0%, #8E2DE2 100%)` (Pink -> Purple)
  * *Usage: Primary buttons, active icons, featured borders.*

* `$grad-secondary`: `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)` (Cyan -> Blue)
  * *Usage: "New" badges, play buttons, functional tools.*

### 1.2 Typography

Multi-script support is mandatory (Latin & Arabic/Kurdish).

**Font Families**

1. **Headings (Latin):** *Montserrat* or *Poppins* (Weights: 700, 800).
2. **Headings (Kurdish):** *Rudaw* or *Noto Sans Kurdish* (Weights: 700).
3. **Body:** *Inter* or *Noto Sans* (Weights: 400, 500).
4. **Chords/Tablature:** *Roboto Mono* (Monospace is required for alignment).

**Type Scale (Desktop)**

* `H1` (Hero): 64px / Bold / -2% Letter Spacing
* `H2` (Section Title): 32px / Bold
* `H3` (Card Title): 20px / SemiBold
* `Body`: 16px / Regular / 1.5 Line Height
* `Caption`: 13px / Medium / Uppercase

### 1.3 Spacing & Geometry

* **Grid:** 8pt grid system.
* **Radius:**
  * `$radius-sm`: 8px (Inner elements, tags).
  * `$radius-md`: 16px (Standard cards).
  * `$radius-lg`: 24px (Modal containers, large panels).
  * `$radius-full`: 999px (Buttons, pills, artist avatars).

* **Shadows (Soft Glows):**
  * `$shadow-card`: `0 4px 20px rgba(42, 27, 40, 0.05)`
  * `$shadow-hover`: `0 10px 25px rgba(255, 46, 147, 0.25)` (Pink tinted shadow).

## 2. UI Components (The Building Blocks)

### 2.1 Buttons

**Primary (Gradient)**

* **Background:** `$grad-primary`
* **Text:** White, Bold.
* **Shape:** Full Pill (`border-radius: 999px`).
* **Interaction:** On Hover, `transform: translateY(-2px)` and shadow increases.

**Secondary (Ghost)**

* **Background:** Transparent.
* **Border:** 1px solid `$border-subtle`.
* **Text:** `$text-primary`.
* **Hover:** Background becomes `$surface-base` (opacity 0.5).

### 2.2 Cards

**Standard Song Card**

* **Container:** `$surface-card`.
* **Border:** 1px solid `$border-subtle` (Optional in Dark Mode).
* **Interaction:** Entire card is clickable. On hover, a "Play" button (Circle, `$grad-secondary`) fades in over the image.

**Artist Avatar**

* **Shape:** Perfect circle.
* **Border:** 3px transparent border with `background-origin: border-box` using `$grad-primary`.
* **Effect:** A soft, colored shadow underneath matching the dominant color of the artist's photo.

### 2.3 Navigation (Glassmorphism)

* **Behavior:** Sticky to top.
* **Style:** `$surface-glass` with `backdrop-filter: blur(12px)`.
* **Border:** 1px bottom border, `$border-subtle`.

### 2.4 Inputs & Search

* **Style:** Filled style, not outlined.
* **Background:**
    * **Light:** White.
    * **Dark:** `rgba(255, 255, 255, 0.05)`.
* **Text:** `$text-primary`.
* **Focus State:** Ring border utilizing `$grad-primary`.

## 3. Feedback & States

* **Loading:** "Skeleton" screens using a shimmering gradient from `$surface-base` to a slightly darker tone.
* **Success:** Green text/icon, but softer (`#00C853`).
* **Error:** Red text/icon (`#FF3D00`).

## 4. Iconography

* **Set:** Lucide React or Feather Icons.
* **Style:** Rounded stroke, 2px width.
* **Color:** Default to `$text-primary`. Active state uses `$grad-primary`.