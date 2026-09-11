# Beam Selector

Plant-floor AISC W-shape preliminary sizing desk.

**Not a stamped calculation.** Strong-axis bending, compact W-shapes, full lateral bracing assumed. No LTB, no connections, no impact factor.

## Live site

After GitHub Pages is enabled on `main` / root:

https://jacobchadwick.github.io/beam-selector/

Enable it once: repo **Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save**.

Then on the phone: open that URL in Chrome → menu → **Add to Home screen**.

## Layout

- `index.html` — UI
- `shapes.js` — W-shape properties (AISC-typical)
- `app.js` — span cases, diagrams, ASD checks, lightest-pass recommendation

## Checks

- Bending: `Mn/Ωb = Fy Zx / 1.67`
- Shear: `Vn/Ωv ≈ 0.6 Fy d tw / 1.50`
- Deflection: L/360 default (L/240, L/180, L/120 available)
