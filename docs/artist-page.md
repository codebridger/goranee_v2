# Page Specification: Artist Profile (v1.0)

**ID:** `PG-003`
**Role:** Archive & Discovery Hub

## 1. Page Goals & User Value

* **Primary Goal:** Allow users to explore the entire catalog of a specific artist.
* **Secondary Goal:** Connect users to "Similar Artists" to prolong the session.
* **Emotional Goal:** Celebrate the artist's identity through high-quality imagery and the "NeoBeat" aesthetic.

## 2. User Journey (Fan Flow)

1. **Arrival:** User clicks an artist name from a Song Card.
2. **Context:** User sees the Artist's face, bio, and "Total Views" stats.
3. **Selection:** User filters the song list by "Most Popular" to find the hits.
4. **Engagement:** User clicks "Follow" to get notified of new chord uploads.

## 3. UI Architecture & Sections

### 3.1 The "Halo" Header

* **Component:** `Header_Profile_Hero`
* **Visual Layering:**
    * **Background:** Wide banner (300px height) with a blurred, desaturated photo of the artist or a generic geometric pattern using `$grad-primary`.
    * **Avatar:** Massive Circle (160px) centered or left-aligned, overlapping the banner bottom edge by 50%.
    * **Border:** The Avatar has a 4px solid white border + a glowing outer ring using `$grad-secondary`.
* **Content:**
    * **Name (H1):** `$text-primary`, centered under avatar.
    * **Stats Row:** "24 Songs" • "15k Plays" • "8 Contributors".
    * **Bio:** Collapsible text block (Max 3 lines, "Read More" expands).

### 3.2 Action Bar

* **Placement:** Directly under the Bio.
* **Buttons:**
    * **Primary:** "Follow" (Gradient Pill).
    * **Secondary:** "Share Profile" (Icon Button).

### 3.3 Discography (The Content)

* **Layout:** Two-Column Layout (Desktop) / Stacked (Mobile).
* **Left Column (Filters & Top Hits):**
    * **"Popular Now":** List of top 5 songs with explicit numbering (1, 2, 3...) styled in `$text-accent`.
* **Right/Main Column (Full Catalog):**
    * **Controls:** Search Input ("Find a song...") + Sort Dropdown (Date / Name / Key).
    * **Grid:** Uses `Card_Song_Compact`.
        * *Difference from Home:* Smaller thumbnail, emphasis on Song Title and Key.
        * *Columns:* 3-across on Desktop.

### 3.4 Discovery Sidebar (or Bottom Section)

* **Title:** "Fans Also Like"
* **Component:** `List_Artist_Circular` (Reused from Homepage).
* **Logic:** Shows artists who share the same "Genre" or "Rhythm" tag.

## 4. Data Requirements

| Data Point             | Source                        | Refresh Rate    |
| :--------------------- | :---------------------------- | :-------------- |
| **Artist Details**     | `GET /api/artists/{id}`       | Static (Cached) |
| **Song List**          | `GET /api/artists/{id}/songs` | Real-time       |
| **User Follow Status** | Auth Token                    | Session Start   |
| **Related Artists**    | Graph DB / Tag Match          | Daily           |

## 5. Technical Behaviors & States

### 5.1 Sorting Logic

* **Default:** "Popularity" (Views Descending).
* **Client-Side:** The song list should be fetched once and filtered/sorted via JavaScript to ensure instant UI response (no reloading).

### 5.2 Empty States

* **No Songs:** If an artist exists but has no chords:
    * Show "Empty State" illustration (Ghost playing guitar).
    * CTA: "Be the first to contribute a song for [Artist Name]".

### 5.3 Mobile Responsiveness

* **Header:** Avatar shrinks to 100px.
* **Layout:** The "Top 5" list merges into the main list. The Sidebar ("Fans Also Like") moves to the very bottom of the page.