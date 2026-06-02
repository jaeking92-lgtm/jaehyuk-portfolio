Carpenter Hero Character Set
============================

Purpose
- Hero/Main section mascot only.
- Use as a PNG/WebP layer between `atelier-wide-bg` and `atelier-wide-table`.
- Recommended layer order: background -> character -> foreground table.

Files
1. carpenter-hero-idle-front
   - Default idle pose / basic front view.
2. carpenter-hero-calm-blink
   - Calm blink pose / optional subtle idle variation.
3. carpenter-hero-wave
   - Greeting pose / use on click or first visit.
4. carpenter-hero-look-right
   - Looking-right pose / use for mouse-follow or scroll attention.

Folders
- png/: transparent PNG, normalized 1200 x 1700 canvas.
- webp/: transparent WebP, normalized 1200 x 1700 canvas, lighter for web.
- preview/: contact sheet for quick visual checking.

Suggested HTML
<img class="hero-character" src="assets/hero/carpenter/carpenter-hero-idle-front.webp" alt="" />

Suggested use
- Default: carpenter-hero-idle-front.webp
- Hover/soft idle: carpenter-hero-look-right.webp or carpenter-hero-calm-blink.webp
- Click/greeting: carpenter-hero-wave.webp

Note
- These images have transparent backgrounds and the same canvas size to reduce layout jump when swapping images.
