# Role
You are an expert Frontend Developer and UI/UX Designer specialized in building immersive, media-heavy web applications.

# Task
Create a "Cinematic Hero Carousel" component for home page.
The design features a full-screen width, immersive dark-themed slider that displays artist imagery and chord data.

# Tech Stack
- Styling: Tailwind CSS

# Visual Design Specifications

## 1. Main Container (The Stage)
- **Dimensions:** Full viewport width, fixed height (approx. 600px to 700px).
- **Background:** Deep dark base color (`#130A12`).
- **Layout:** Flex row.
- **Overlay:** A strong linear gradient overlay from Left to Right (`from-[#130A12] via-[#130A12]/90 to-transparent`) to ensure text readability on the left side while revealing the artist image on the right.

## 2. Navigation Bar (Overlay)
- Position: Absolute top, full width, z-index 50.
- Background: Transparent (or very subtle gradient down).
- Content (Right to Left / RTL support):
  - Brand Logo (Right).
  - Navigation Links (Center).
  - Search Input & User Profile (Left).
- Text Color: White/Light Gray.

## 3. Active Slide Content (Left Aligned)
Positioned over the dark gradient area on the left.
- **Typography:**
  - **Title:** "Xam (Sorrow)" -> Text size 5xl/6xl, Bold, White.
  - **Artist Info:** "Zakaria Abdulla" -> Text size lg, Text-Gray-400.
  - **Badges:** Small pill-shaped badges next to artist name (e.g., "Cm", "Slow") with pink bg/text variations.
- **Chord Preview Block (Crucial):**
  - Font: Monospace (`font-mono`).
  - Style: A transparent block showing 2-3 lines of lyrics.
  - Chord Color: Neon Pink (`#FF2E93`) e.g., `[Cm]`.
  - Lyric Color: Light Gray (`#E5E7EB`).
  - Text size: XL.
- **Action Buttons:**
  - Primary: "Play" (or "شروع به پخش") -> Gradient Background (Pink `#FF2E93` to Purple), rounded-full, with Play icon.
  - Secondary: "Send Chord" (or "ارسال آکورد") -> Transparent with White Border, rounded-full.

## 4. Artist Image (Right Side)
- A high-resolution image of the artist (e.g., a man in a suit on a stage).
- It should blend seamlessly into the background thanks to the gradient overlay mentioned in Section 1.

## 5. The "Peek" Next Slide (Far Right)
- A vertical slice (approx 10-15% width) of the *next* slide's image should be visible on the far right edge.
- **Effect:** Darkened/Dimmed and slightly blurred to indicate it is not active.
- **Navigation Control:** A circular "Next" button with a chevron icon (`>`) floating vertically centered over this peek area.

## 6. Pagination
- Small circular dots centered at the bottom of the hero container.
- Active dot is Pink (`#FF2E93`) and elongated; inactive dots are gray circles.

## 7. Bottom Transition
- The bottom edge of the hero section must cut off sharply to white/light pink (`#FDF2F0`) to reveal the "Discovery" grid section below.

# Example Data Structure
Adapt the below stracture with the actual song object from database.
```json
const slides = [
  {
    id: 1,
    title: "Xam (Sorrow)",
    artist: "Zakaria Abdulla",
    badges: ["Cm", "Slow"],
    image: "/path-to-zakaria.jpg",
    lyrics: [
      { chord: "[Cm]", text: "Ewa disan baran bari..." },
      { chord: "[Gm]", text: "Firmesk la chawm..." }
    ]
  },
  // ... more slides
]