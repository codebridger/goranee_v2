# Page Specification: Homepage (v1.1)

**ID:** `PG-001`
**Role:** Primary Entry Point & Discovery Engine

## 1. Page Goals & User Value

* **Primary Goal:** Enable users to find a specific song within < 5 seconds via Search.

* **Secondary Goal:** Inspire discovery through visual browsing (Trending, Artists) for users without a specific target.

* **Business Goal:** Drive conversion to "Registered User" via the Community/Upload CTAs.

## 2. User Journey (Core Flows)

1. **Direct Search:** User lands -> Types in Sticky Header Search -> Sees Instant Results -> Clicks Song.

2. **Exploration:** User lands -> Scrolls through "Trending" -> Plays Audio Preview on Hover -> Clicks Song Card.

3. **Artist Dive:** User sees "Featured Artist" in Hero -> Clicks CTA -> Navigates to `Artist_Profile`.

## 3. UI Architecture & Sections

### 3.1 Global Navigation (Sticky)

* **Component:** `Nav_Glass_Header`

* **Behavior:**

  * Scroll < 50px: Transparent background.

  * Scroll > 50px: Becomes `$surface-glass` (Blur 12px) with subtle shadow.

* **Elements:**

  * Logo (Left)

  * Search Bar (Center - Expandable on Mobile)

  * Auth Buttons (Right - Login / Explore CTA)

### 3.2 Hero Section (The "Hook")

* **Layout:** Split Layout (Text Left / Visual Right).

* **Content:**

  * **H1:** Dynamic Headline (e.g., "Play the Melody").

  * **CTA Primary:** "Start Playing" (Links to `/chords`).

  * **CTA Secondary:** "Submit Chord" (Links to `/upload`).

* **Visual:** Large cutout image of a featured Kurdish artist.

* **Mobile Adaption:** Stacked layout. Visual moves to top, text below.

### 3.3 Discovery Grid (Trending Songs)

* **Data Source:** `GET /api/songs/trending?limit=8`

* **Component:** `Card_Song_Standard`

* **Grid Layout:**

  * Desktop: 4 columns.

  * Tablet: 2 columns.

  * Mobile: 1 column (or horizontal swipe carousel).

* **Interaction:**

  * **Hover:** Card lifts `-4px`, Play button fades in (Opacity 0 -> 100).

  * **Click:** Navigates to `Chord_View`.

### 3.4 Artist Reel

* **Component:** `List_Artist_Circular`

* **Layout:** Horizontal scroll container (hide scrollbars).

* **Item:** `Avatar_Circle_Large` (120px) + Name Label.

* **Behavior:** Snaps to center on swipe.

### 3.5 Community Pulse (Footer Pre-roll)

* **Purpose:** Social Proof. Shows the platform is alive.

* **Content:** Last 3 comments or "User X uploaded Song Y".

* **Style:** Chat bubble aesthetic using `$surface-card`.

## 4. Data Requirements

| **Data Point** | **Source** | **Refresh Rate** | 
| **Featured Artist** | CMS / Admin Setting | Daily | 
| **Trending Songs** | Algo (Views last 7d) | Hourly | 
| **New Arrivals** | Database (Created Date) | Real-time | 
| **User Status** | Auth Token | Session Start | 

## 5. Edge Cases & States

* **Loading:**

  * Hero: Shows grey/pink gradient pulse.

  * Grid: Display 8 `Skeleton_Card` components.

* **Error (API Fail):**

  * Show "Connection Lost" toast in top right.

  * Grid fallback: Show "Offline Mode" cached songs if available.

* **Empty State (Search):**

  * If no results found: Show "Request this song" CTA button immediately.