# UX Refactor: Hero Section & Layout

## 1. Components
- **Create `SongInfoCard.vue`**:
  - Replaces `SongHeader`.
  - **Desktop Mode**: Vertical card for the sidebar. Includes Image, Title, Artist, Key, Rhythm, Play/Save buttons.
  - **Mobile Mode**: Compact row/stack. Minimal height.
- **Delete `SongHeader.vue`**: Remove unused component.

## 2. Page Layout (`tab/[id].vue`)
- **Desktop**:
  - Move Song Info to the **Right Sidebar** (Column 3).
  - Stack: `SongInfoCard` (Top) -> `SongSidebar` (Recommendations).
- **Mobile**:
  - Place `SongInfoCard` (Mobile variant) at the top of the content flow.
  - Remove the immersive full-width header.

## 3. Visuals
- Ensure `SongInfoCard` retains the "glass/blur" aesthetic but in a contained card format.
- Verify "Workstation" feel: Content (Chords) should be the first major element the user sees on Desktop (central column).
