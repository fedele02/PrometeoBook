# Design System — Prometeo Fine Dining (MASTER)

> Generated with UI UX Pro Max (`search.py --design-system --persist`) and then adapted to the
> restaurant's real brand. When a page file exists in `pages/`, its rules override this one.
> Tokens live in `src/app/globals.css` (`@theme`).

## Direction

Taken from the restaurant's own material (sign, printed menu, Facebook posts):
black, the gold of the logo, Trajan-style capitals, white sans-serif text, thin rules ending in a flame.
**Mobile first**: every decision is checked first at 320–430 px wide.

Kept from the skill: dark + gold palette, *Horizontal Scroll Journey* for the dishes, touch/accessibility rules.
Rejected from the skill (and why):
- *Liquid Glass* style → the skill itself flags poor performance and text contrast; looks generic.
- Playfair Display SC + Karla → the logo is a Trajan-like capital: Cinzel matches it, Hanken Grotesk matches the sans of their posts.
- Light background → the brand is black; light paper only on the booking page, where legibility wins.

## Color tokens

| Role | Token | Hex | Notes |
|---|---|---|---|
| Background | `ink` | `#0b0b0b` | main sections |
| Surface | `ink-2` | `#141413` | alternate sections, sheets |
| Surface 2 | `ink-3` | `#1d1c1a` | hover / admin |
| Text | `cream` | `#f2ede4` | 18.4:1 on ink |
| Muted text | `cream/70` | — | ≥ 9:1 on ink |
| Accent / CTA | `gold` | `#c8a55a` | 8.9:1 on ink · logo, prices, primary buttons |
| Gold on light | `gold-deep` | `#94742e` | only large text / decoration on paper |
| Booking surface | `paper` | `#f4efe6` | table linen, booking page only |
| Error | `ember` | `#e0763a` | |

Rules: no gradients as decoration (only photo scrims); gold never used for long body text;
no light/dark jumps between consecutive home sections — alternate `ink` / `ink-2` instead.

## Typography

| Use | Font | Size (mobile → desktop) |
|---|---|---|
| Display caps | Cinzel 400/500, uppercase, tracking .06em | 40 → 72 px |
| Quote / tagline | Cormorant Garamond italic | 28–34 → 56 px |
| Body | Hanken Grotesk 400/600 | 17 px, line-height 1.6 |
| Labels | Hanken 600 uppercase, tracking .22em | 12 px |

Body text never below 16 px on mobile; line length ≤ 70 characters.

## Spacing

8 px grid. Section padding 80 px mobile / 144 px desktop. Page gutter 24 px mobile / 40 px desktop.

## Components

- **Button**: rectangular (radius 2 px), min-height 52 px, uppercase 13 px tracking .18em.
  `btn-gold` primary (one per view), `btn-line` secondary, `link-arrow` tertiary. Pressed: opacity .85.
- **Navbar**: transparent over the hero photo, `ink/90 + blur` when scrolled; **no border, no gradient band**.
- **Mobile bar**: Chiama + Prenota, fixed bottom with safe-area, appears after the hero.
- **Photos**: square corners, captions on a bottom scrim; hover zoom ≤ 1.03 inside an overflow mask (no layout shift).
- **Callout** (from their posts): 1 px left rule, bold title, one line of text.
- **Sheet / modal**: bottom sheet on phones, drag only from the handle.

## Motion (Motion library)

Fade + slide-up 16 px, 600 ms, ease-out-expo, once per element; stagger 80 ms in lists.
Hover/press 150–300 ms. `MotionConfig reducedMotion="user"` everywhere. No parallax, no particles.

## Pre-delivery checklist

- [ ] 320, 360, 375, 390, 412, 430 px + landscape, 768, 1024, 1440: no horizontal scroll
- [ ] Touch targets ≥ 44×44 px, ≥ 8 px apart; `touch-action: manipulation`
- [ ] Contrast ≥ 4.5:1 for text; visible focus rings
- [ ] Images: WebP/AVIF via next/image, `sizes` set, hero `priority`
- [ ] No console errors; Lighthouse mobile ≥ 90 (performance, accessibility, best practices, SEO)
- [ ] No invented content: every text, price and review has a source (see README)
