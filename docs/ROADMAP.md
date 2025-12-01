# Goranee v2 Roadmap

This roadmap outlines the implementation plan to bring the Goranee v2 PRD to life, prioritizing core value (playing chords) and discovery.

## Phase 1: Core MVP & Navigation (Immediate Priority)

The goal is to have a browsable, usable site where users can find and play songs.

### 1. Homepage Completion (PG-001)
- [ ] **Navbar Interactions**: Implement scroll-based glass effect (transparent on hero, glass on scroll).
- [ ] **Search Wire-up**: Connect navbar search input to a functional results page or dropdown.
- [ ] **Mobile Responsiveness**: Ensure mobile menu and search behavior work smoothly.
- [ ] **Artist Reel Loading**: Add skeleton states for the artist carousel.
- [ ] **Routing**: Wire up "View All" links to `/artists` and `/discovery`.

### 2. Chord View "Workstation" (PG-002)
- [ ] **Route Implementation**: Create `pages/songs/[id].vue`.
- [ ] **Data Fetching**: Fetch full song details + chord sections from backend.
- [ ] **Immersive Header**: Blurred artist background, huge title, metadata chips.
- [ ] **Chord Sheet**: Bind the existing `ChordSheet.vue` to real backend data.
- [ ] **Floating Toolbox**:
    - [ ] **Transpose**: Implement regex-based key shifting (client-side).
    - [ ] **Auto-Scroll**: Variable speed scroll loop.
    - [ ] **Font Size**: Reactive controls for chord sheet text.
- [ ] **Recommendations**: "More by Artist" sidebar using `useTabService`.

### 3. Artist Profile (PG-003)
- [ ] **Route Implementation**: Create `pages/artists/[id].vue`.
- [ ] **Hero Header**: Halo avatar, stats, bio.
- [ ] **Discography Grid**:
    - [ ] "Popular Now" list (top 5).
    - [ ] Full searchable/sortable song grid.
- [ ] **Similar Artists**: Re-use the artist reel component for "Fans Also Like".

### 4. Discovery & Search
- [ ] **Search Page**: `pages/discovery.vue` (or `/search`).
    - [ ] Grid results with pagination/infinite scroll.
    - [ ] Filters: Genre, Key, Rhythm.
    - [ ] Empty state: "Request this song".
- [ ] **Artists Index**: `pages/artists/index.vue` listing all featured artists.

---

## Phase 2: Community & Engagement

Focus on user retention and content growth.

### 1. Authentication UI
- [ ] **Auth Modals**: Login / Register / Forgot Password UI using `useAuth`.
- [ ] **User Menu**: Avatar in navbar for logged-in users (Profile, Settings, Logout).
- [ ] **Anonymous Init**: Ensure `loginAsAnonymous` runs seamlessly for guests.

### 2. Social Features
- [ ] **Favorites**: "Heart" button on Song/Artist cards + "My Library" page.
- [ ] **Comments**:
    - [ ] Read-only comment list on Chord View.
    - [ ] "Post Comment" form (auth-gated).
- [ ] **User Submissions**:
    - [ ] `pages/upload.vue` for submitting new chords (Markdown editor).

---

## Phase 3: Monetization & Polish

Preparing for launch and revenue.

### 1. Monetization
- [ ] **Premium Gating**:
    - [ ] Lock "Download PDF" button.
    - [ ] Limit Transpose range for free users (optional).
- [ ] **Subscription UI**:
    - [ ] `pages/pricing.vue` with plan comparison.
    - [ ] "Upgrade" banners/badges.

### 2. Polish & Performance
- [ ] **Performance**: Image optimization (`<NuxtImg>`), lazy loading for heavy lists.
- [ ] **SEO**: Meta tags for songs/artists (OpenGraph images, descriptions).
- [ ] **Error Handling**: Global error toasts (e.g., "Network Error"), 404 pages.
- [ ] **Localization**: Full pass on `en.json` / `fa.json` for new pages.

---

## Status Legend
- [ ] Pending
- [x] Completed
- [~] In Progress

