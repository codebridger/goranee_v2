# Chord View "Workstation" - Text Wireframes

## 1. Desktop View (Landscape)

**Layout Strategy:** 3-Column / Grid
- **Header:** Full-width immersive artist background.
- **Left Sidebar:** Sticky "Toolbox" for quick access while playing.
- **Center:** The "Paper" (Chord Sheet) - High contrast, focused reading area.
- **Right Sidebar:** Context & Discovery (Ads, Artist Top 5, Related).

```text
+-----------------------------------------------------------------------+
| [HEADER]                                                              |
|                                                                       |
|  (Artist Image Blurred Background)                                    |
|  +-----------------------------------------------------------------+  |
|  |  Song Title: "Xawnikan"                [Heart: Save] [Share]    |  |
|  |  Artist: Zakaria                       [ Play Audio Button ]    |  |
|  |  [Tag: 7/8 Rhythm] [Tag: Key: Am]      [Tag: Diff: Medium]      |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
|                                                                       |
|  [LEFT: TOOLBOX]      [CENTER: CHORD SHEET]       [RIGHT: SIDEBAR]    |
|  (Sticky Fixed)       (Scrollable Paper)          (Scrollable)        |
|                                                                       |
|  +--------------+    +-----------------------+    +-----------------+ |
|  | TRANSPOSE    |    | [Intro]               |    |                 | |
|  | [-] Am [+]   |    | Am        G           |    |  MORE BY        | |
|  | (Orig: Cm)   |    | Text line 1...        |    |  ZAKARIA        | |
|  |              |    |                       |    |  1. Song A      | |
|  | AUTO-SCROLL  |    | F         Em          |    |  2. Song B      | |
|  | [Play] [Stop]|    | Text line 2...        |    |  3. Song C      | |
|  | Speed: ==|-- |    |                       |    |                 | |
|  |              |    | [Verse 1]             |    |  SIMILAR VIBE   | |
|  | FONT SIZE    |    | Am        Dm          |    |  1. Song X      | |
|  | [A-] [A+]    |    | Lyrics go here...     |    |  2. Song Y      | |
|  |              |    |                       |    |                 | |
|  | OPTIONS      |    | G         C           |    |  [AD SPACE]     | |
|  | [ ] Show Dia |    | Lyrics go here...     |    |                 | |
|  | [ ] Dark Mode|    |                       |    |                 | |
|  +--------------+    | (Neon Pink Chords)    |    +-----------------+ |
|                      | (White Text on Dark)  |                        |
|                      |                       |                        |
|                      +-----------------------+                        |
|                                                                       |
+-----------------------------------------------------------------------+
| [FOOTER]                                                              |
+-----------------------------------------------------------------------+
```

---

## 2. Mobile View (Portrait)

**Layout Strategy:** Vertical Stack + Fixed Bottom Drawer
- **Thumb Zone:** All interactive "playing" tools are at the bottom.
- **Header:** Compact, focuses on Title/Artist.
- **Sheet:** Full width, maximized for readability.
- **Bottom Bar:** Floating toolbox (always visible).

```text
+-----------------------------------+
| [HEADER - Compact]                |
| = Menu              [Heart] [Search]|
|                                   |
|  Title: Xawnikan                  |
|  Artist: Zakaria                  |
|  [Play Audio >]                   |
+-----------------------------------+
| [CONTENT]                         |
|                                   |
|  [Intro]                          |
|  Am          G                    |
|  Text line 1...                   |
|                                   |
|  F           Em                   |
|  Text line 2...                   |
|                                   |
|  [Verse 1]                        |
|  Am          Dm                   |
|  Lyrics go here...                |
|                                   |
|  G           C                    |
|  Lyrics go here...                |
|                                   |
|  ...                              |
|  (Scrolls behind bottom bar)      |
|                                   |
|                                   |
|  [More by Zakaria]                |
|  1. Song A                        |
|  2. Song B                        |
|                                   |
+-----------------------------------+
| [FIXED BOTTOM TOOLBAR] (Z-Index)  |
| +-------------------------------+ |
| | [Transpose]   [Auto-Scroll]   | |
| |  [-] Am [+]    [Play/Pause]   | |
| +-------------------------------+ |
+-----------------------------------+
```

### Mobile Interaction Detail: "Transpose" Drawer
*When user taps "Transpose" in the bottom bar, a half-height drawer slides up.*

```text
+-----------------------------------+
|           (Background Dimmed)     |
+-----------------------------------+
| [DRAWER]                          |
|                                   |
|  Transpose Key                    |
|  Current: Am (Original: Cm)       |
|                                   |
|  [  -  ]   [  RESET  ]   [  +  ]  |
|                                   |
|  Capo Recommendation:             |
|  "Put Capo on 3rd Fret"           |
|                                   |
|           [ Close v ]             |
+-----------------------------------+
```

