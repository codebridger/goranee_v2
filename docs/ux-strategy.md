# UX Strategy Proposal: Goranee v2

**Version:** 1.0
**Role:** Core User Experience Principles & Guidelines

---

## 1. Executive Summary
The goal of Goranee v2 is to empower Kurdish music lovers and musicians by providing the best online platform for discovering, learning, and playing Kurdish song chords. 

This proposal outlines the foundational UX principles required to merge the functional utility of a musician’s workstation with the emotional resonance of the "Electric Melody" design system.

---

## 2. Core UX Philosophy: " The Connected Stage"
Our design treats the screen not just as a website, but as a **digital music stand**. The interface must be invisible when the user is playing, but immersive when the user is discovering. We bridge the gap between technical utility (chords) and cultural identity (Kurdish artistry).

---

## 3. The 5 Pillars of Experience

### Pillar I: Native at Heart (Cultural Integrity)
**Concept:** The platform must feel natively Kurdish while adhering to global web standards.
* **Typography:** We utilize a dual-script system. Headings in Kurdish use *Rudaw* or *Noto Sans Kurdish*, while Western chords use *Roboto Mono* for strict alignment.
* **Directionality:** The UI supports fluid switching between RTL (Lyrics/UI) and LTR (Chords/Search). The navigation bar and hero section specifically account for RTL support.
* **Guideline:** Never force Kurdish text into a Latin layout. Give the script breathing room (Line Height: 2.0).

### Pillar II: Designed for the Gig (Contextual Utility)
**Concept:** We assume the user is holding an instrument in a potentially dimly lit room.
* **The "Workstation" View:** The Chord Page is the core utility. It features a "Distraction-free" environment where the header and tools can recede.
* **Thumb-Zone Ergonomics:** On mobile, essential tools (Transpose, Auto-scroll) are placed in a fixed bottom drawer to ensure thumbs can reach them without blocking the lyrics.
* **High Contrast:** We utilize "Neon Pink" (`#FF2E93`) for chords against "Deep Void" (`#130A12`) backgrounds to ensure glanceability from a distance.

### Pillar III: The 5-Second Rule (Speed to Value)
**Concept:** Discovery must be instant.
* **Search First:** A sticky global search bar ensures users can find a song within < 5 seconds of landing.
* **Instant Transpose:** Functional changes (key changes) happen strictly client-side via Regex replacement to prevent page reloads and break the user's flow.

### Pillar IV: Electric Immersion (Visual Engagement)
**Concept:** Encouraging exploration through mood and aesthetics.
* **Glassmorphism:** We use `$surface-glass` with blur effects to create depth, making the content feel like it is floating above the artwork.
* **Soft Glows:** Shadows are not just black; they are tinted (e.g., Pink tinted shadow) to create a warm, inviting atmosphere that matches the "NeoBeat" theme.

### Pillar V: Community Loops (Retention)
**Concept:** Every dead-end is a new path.
* **Continuous Discovery:** We avoid empty endpoints. An artist page leads to "Similar Artists"; a song page leads to "Similar Vibe".
* **Social Proof:** We highlight community activity (e.g., "8 Contributors") to encourage the user to move from a passive consumer to an active contributor.

---

## 4. Accessibility & Inclusion (WCAG)
To ensure the platform is usable by all musicians:

1.  **Color Blindness:** We will not rely solely on color to denote interactive elements. Chords are distinguished by Bold weight and Brackets `[Cm]` in addition to color.
2.  **Minimum Font Size:** Mobile fonts are locked to a minimum of 14px to prevent unreadability during playback.
3.  **Touch Targets:** All interactive elements (Play buttons, Transpose toggles) must meet the minimum touch target size (44x44px), specifically the large circular actions in the header.

---

## 5. Measure of Success
We will evaluate the UX based on the KPIs defined in the PRD:

* **Time on Page (Chord View):** Indicates successful usage of the "Workstation."
* **Search Latency:** Success = User finds result in < 5 seconds.
* **Transpose Usage:** High usage indicates the tool is accessible and valuable.
* **Return Rate:** Users saving songs to "Favorites" proves the ecosystem value.

---

## 6. Next Steps
1.  **Wireframing:** Translate these principles into low-fidelity wireframes for the *Chord View* and *Mobile Drawer*.
2.  **Prototyping:** Test the "Auto-Scroll" speed and "Transpose" logic with real musicians.