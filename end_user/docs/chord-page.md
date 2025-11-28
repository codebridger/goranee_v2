# Page Specification: Chord View (v1.0)
**ID:** `PG-002`
**Role:** Core Product Utility (The "Workstation")

---

## 1. Page Goals & User Value
* **Primary Goal:** Provide a readable, distraction-free environment for musicians to play a song.
* **Secondary Goal:** Offer functional tools (Transpose, Auto-scroll) that adapt the content to the user's skill level.
* **Business Goal:** Increase "Time on Page" and drive "Favorites/Saves" (Registered User retention).

## 2. User Journey (The "Gig" Flow)
1.  **Setup:** User lands -> Checks Key (`Cm`) -> Uses **Transpose** tool to switch to `Am` (easier to play).
2.  **Play:** User hits **Auto-Scroll** -> Starts playing instrument -> Reads lyrics/chords hands-free.
3.  **Refine:** User pauses -> Clicks a chord name -> Sees **Chord Diagram** popup.
4.  **Finish:** User clicks "Heart" icon to save to their library.

---

## 3. UI Architecture & Sections

### 3.1 The Immersive Header
* **Visual:** Edge-to-edge background image of the artist (applied with `filter: blur(20px)` and dark overlay).
* **Content:**
    * **Song Title (H1):** White text, huge scale.
    * **Artist Name (H2):** Links to Profile.
    * **Metadata Chips:** Rhythm (e.g., "Kurdish 7/8"), Original Key, Difficulty Level.
* **Actions:** "Play Audio" (Circular button with `$grad-secondary`), "Save to Library" (Heart icon).

### 3.2 The Floating Toolbox (Sticky)
* **Component:** `Bar_Tool_Floating`
* **Placement:**
    * **Desktop:** Sticky on the left sidebar or top right.
    * **Mobile:** Fixed bottom bar (always visible).
* **Tools:**
    1.  **Transpose:** `[-]` `[Current Key]` `[+]`. *Action: Real-time regex replacement of chord text.*
    2.  **Auto-Scroll:** Play/Pause toggle + Speed Slider.
    3.  **Font Size:** `A-` / `A+`.

### 3.3 The Chord Sheet (Main Stage)
* **Component:** `Card_Sheet_Container`
* **Style:**
    * Background: `$surface-card` (White).
    * Shadow: `$shadow-card` (Soft lift).
    * Radius: `$radius-lg` (24px).
* **Typography Rules:**
    * **Lyrics:** `$font-body` (Inter/Noto Sans), `$text-primary`.
    * **Chords:** `$font-mono` (Roboto Mono), **Bold**, Color: `$text-accent` (#FF2E93).
    * **Line Height:** Generous (2.0) to prevent chords overlapping lyrics.
* **Interaction:** Clicking a chord text opens a "Chord Diagram" modal (e.g., how to play 'Cm').

### 3.4 Sidebar / Recommendations
* **Desktop:** Right column.
* **Mobile:** Below the chord sheet.
* **Content:**
    * **"More by [Artist]":** Mini-list of top 5 songs.
    * **"Similar Vibe":** Songs with the same Rhythm or Key.

---

## 4. Data Requirements
| Data Point           | Source             | Note                                    |
| :------------------- | :----------------- | :-------------------------------------- |
| **Chord Content**    | DB (Markdown/Text) | stored with `[Cm]` brackets for parsing |
| **Audio Source**     | YouTube API / MP3  | Linked via Admin ID                     |
| **Transposition**    | Client-side Logic  | Logic: `[C, C#, D...]` array shifting   |
| **User Save Status** | User Profile DB    | Checked on load                         |

## 5. Technical Behaviors & States

### 5.1 Transpose Logic
* **Default:** Load song in "Original Key".
* **Action:** If user clicks `+1`:
    * Identify all patterns matching chords (e.g., `Am`, `G#`).
    * Shift index in the 12-tone array.
    * Update DOM immediately (no page reload).

### 5.2 Auto-Scroll
* **Behavior:** Smooth JS scroll (`window.scrollBy`).
* **Speed:** Variable (Slow/Medium/Fast).
* **Stop Condition:** User manually scrolls or reaches bottom.

### 5.3 Mobile Responsiveness
* **Toolbox:** Moves to a fixed bottom drawer (`z-index: 100`) to ensure thumbs can reach "Scroll" and "Transpose" without blocking the view.
* **Font:** Minimum size locked to 14px to prevent unreadability.