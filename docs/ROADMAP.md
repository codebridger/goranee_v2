# Goranee v2 Roadmap

This roadmap outlines the high-level implementation epics for Goranee v2. Each item below represents a complex feature set that will require its own detailed technical implementation plan.

## Phase 1: Core MVP & Navigation (Immediate Priority)

The goal is to have a browsable, usable site where users can find and play songs.

### 1. Homepage Completion (PG-001)
*Refining the entry point to be responsive, interactive, and connected.*
- [x] **Navbar Interactions & State**:
    - [x] Implement scroll-aware background (transparent at top, frosted glass after 50px scroll).
    - [x] Manage mobile menu toggle state and animations.
    - [x] Ensure "Active Route" styling for navigation links.
- [~] **Global Search Integration**:
    - [x] Connect the Navbar search input to the `useTabService` or a dedicated search store.
    - [x] Implement a dropdown "Quick Results" preview and direct navigation to `/discovery?q=...` on submit.
    - [x] Handle mobile-specific search UI (expandable input or separate full-screen search overlay).
- [x] **Artist Reel & Skeleton Loading**:
    - [x] Implement proper loading states (Shimmer/Skeleton) for the `ArtistCard` carousel.
    - [x] Handle empty states and API errors gracefully (toast notifications).
- [x] **Routing & Navigation**:
    - [x] Wire up all "View All" and CTA links to their respective placeholder or real routes (`/artists`, `/discovery`, `/community`).

### 2. Chord View "Workstation" (PG-002)
*The core product experience: A distraction-free, feature-rich player for musicians.*
- [ ] **Dynamic Route & Data Layer (`pages/tab/[id].vue`)**:
    - Create the dynamic route to handle song IDs/slugs.
    - Implement `useSong(id)` composable to fetch full song details, including `sections`, `lines`, and `artists` population.
    - Handle 404s and loading states for the entire page view.
- [ ] **Immersive Header Component**:
    - Build a responsive header showing the Artist image (blurred/hero), Song Title, and Metadata (Key, Rhythm, Difficulty).
    - Integrate "Play Audio" (link to YouTube/MP3) and "Save to Library" actions.
- [ ] **Interactive Chord Sheet**:
    - Enhance `ChordSheet.vue` to accept raw chord-pro or structured JSON data.
    - Implement chord rendering logic that supports transposition (shifting notes dynamically).
    - Styling for readability: Large fonts, clear contrast, monospace chords.
- [ ] **Floating Toolbox (The "Deck")**:
    - **Transpose Engine**: Create a utility to shift chords (+/- semitones) and update the view instantly.
    - **Auto-Scroll**: Implement a smooth vertical scroll with adjustable speed slider (0.5x to 2x).
    - **Appearance Controls**: Font size toggles (A+/A-) and potentially High Contrast mode.
    - **Responsive Behavior**: Dock to bottom on mobile, sticky sidebar/float on desktop.
- [ ] **Sidebar & Recommendations**:
    - Fetch and display "More from this Artist" (top 5 songs).
    - Fetch "Similar Vibe" songs (based on Rhythm/Genre tags).

### 3. Artist Profile (PG-003)
*A hub for artist discovery and discography exploration.*
- [x] **Artist Route (`pages/artist/[id].vue`)**:
    - Fetch Artist profile data (bio, image, stats) and full song catalog.
- [x] **Hero & Bio Section**:
    - "Halo" Avatar styling with gradient borders.
    - Key stats display (Total Songs, Total Plays).
    - Collapsible "About" text for long bios.
- [x] **Discography & Catalog Grid**:
    - **Popularity List**: A stylized "Top 5" list with numbering (1-5) for their biggest hits.
    - **Full Catalog Filter**: A searchable, sortable grid of all songs (Sort by: Date, Popularity, Key).
- [x] **"Fans Also Like"**:
    - A horizontal reel of related artists (based on genre/era) to keep users browsing.

### 4. Discovery & Search Engine
*Helping users find specific content or explore new music.*
- [x] **Search Page (`pages/discovery.vue` or `/search`)**:
    - Accept query parameters (`?q=`, `?genre=`, `?key=`).
    - Implement a layout with Filters Sidebar (Desktop) / Drawer (Mobile) and Results Grid.
- [x] **Filtering Logic**:
    - Filter by Genre (Pop, Folklore, etc.), Key (Cm, Am...), and Rhythm.
    - Sort options (Newest, Most Viewed, A-Z).
- [x] **Results Grid**:
    - Efficient pagination or Infinite Scroll for large result sets.
    - Re-use `SongCard` with optimized props for list views.
    - "No Results" empty state with a "Request Song" CTA.
- [x] **Artists Index (`pages/artists/index.vue`)**:
    - A simple, paginated grid of all available artists, sortable by name or popularity.

---

## Phase 2: Community & Engagement

Focus on user retention, identity, and content growth.

### 1. Authentication & User Profile
- [ ] **Auth UI & Flows**:
    - Create attractive Login/Register modals (glassmorphism style).
    - Implement "Forgot Password" flow.
    - Handle auth persistence and token refresh in `useAuth`.
- [ ] **User Navigation**:
    - Dynamic Navbar state: Replace "Login" with User Avatar + Dropdown.
    - Dropdown actions: "My Profile", "My Library", "Settings", "Logout".
- [ ] **Anonymous Experience**:
    - Ensure the "Guest" experience is smooth (anonymous token handling) before forced registration.

### 2. Social Features & UGC
- [ ] **Favorites & Library**:
    - Implement "Toggle Favorite" action on all cards and headers.
    - Create `pages/library.vue` to list saved Songs and followed Artists.
- [ ] **Comments System**:
    - **Display**: Render comments on Chord View (User avatar, name, date, text).
    - **Action**: "Add Comment" form (requires login).
    - **API**: Connect to backend comment endpoints (CRUD).
- [ ] **User Submissions (`/upload`)**:
    - **Wizard UI**: A multi-step form for users to submit new chords.
        - Step 1: Metadata (Title, Artist, Key).
        - Step 2: Editor (Markdown/ChordPro text area).
        - Step 3: Review & Submit.

---

## Phase 3: Monetization & Polish

Preparing for launch, revenue generation, and production quality.

### 1. Monetization Layer
- [ ] **Premium Feature Gating**:
    - Identify premium actions (PDF Download, Advanced Transpose).
    - Implement a "Locked" UI state (padlock icon, disabled button).
    - Create an "Upgrade to Unlock" modal trigger.
- [ ] **Subscription Pages**:
    - `pages/pricing.vue`: Compare Free vs. Premium tiers.
    - Integration with payment gateway (Stripe/LemonSqueezy) or backend checkout initialization.

### 2. Polish, SEO & Performance
- [ ] **SEO Strategy**:
    - Dynamic `useHead` meta tags for every Song and Artist page (Title, Description, OG Image).
    - Sitemap generation.
- [ ] **Performance Optimization**:
    - Implement `<NuxtImg>` for optimized image delivery and format selection (WebP).
    - Code splitting for heavy components (e.g., the Toolbox, Comment Editor).
    - Virtual scrolling for very long song lists.
- [ ] **Error Handling & Localization**:
    - Global error boundary and Toast notification system.
    - 404 (Not Found) and 500 (Server Error) page designs.
    - Complete `en.json` / `fa.json` translation keys for all new features.

---

## Status Legend
- [ ] **Pending**: Not started.
- [~] **In Progress**: Currently being implemented.
- [x] **Completed**: Finished and verified.
