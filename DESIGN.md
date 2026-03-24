# Subscription & Billing Design System

This document outlines the design foundation extracted from the Stitch 'Subscription & Billing' project.

## Typography
* **Headlines / Display:** Manrope
* **Body / Labels:** Inter

## Theme Configuration
* **Color Mode:** Light
* **Roundness:** ROUND_FOUR
* **Base Custom Color:** `#0F172A`
* **Spacing Scale:** 3

## Color Palette (CSS Variables)
Use these variables or equivalent tailwind configurations to apply the extracted palette to your frontend.

```css
:root {
  /* Background & Surface */
  --background: #f7f9fb;
  --on-background: #191c1e;
  --surface: #f7f9fb;
  --surface-bright: #f7f9fb;
  --surface-dim: #d8dadc;
  --surface-tint: #565e74;
  --surface-variant: #e0e3e5;
  --on-surface: #191c1e;
  --on-surface-variant: #45464d;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f2f4f6;
  --surface-container: #eceef0;
  --surface-container-high: #e6e8ea;
  --surface-container-highest: #e0e3e5;
  --inverse-surface: #2d3133;
  --inverse-on-surface: #eff1f3;

  /* Primary */
  --primary: #000000;
  --on-primary: #ffffff;
  --primary-container: #131b2e;
  --on-primary-container: #7c839b;
  --primary-fixed: #dae2fd;
  --primary-fixed-dim: #bec6e0;
  --on-primary-fixed: #131b2e;
  --on-primary-fixed-variant: #3f465c;
  --inverse-primary: #bec6e0;

  /* Secondary */
  --secondary: #545f73;
  --on-secondary: #ffffff;
  --secondary-container: #d5e0f8;
  --on-secondary-container: #586377;
  --secondary-fixed: #d8e3fb;
  --secondary-fixed-dim: #bcc7de;
  --on-secondary-fixed: #111c2d;
  --on-secondary-fixed-variant: #3c475a;

  /* Tertiary */
  --tertiary: #000000;
  --on-tertiary: #ffffff;
  --tertiary-container: #23005c;
  --on-tertiary-container: #9466ff;
  --tertiary-fixed: #e9ddff;
  --tertiary-fixed-dim: #d0bcff;
  --on-tertiary-fixed: #23005c;
  --on-tertiary-fixed-variant: #5516be;

  /* Error */
  --error: #ba1a1a;
  --on-error: #ffffff;
  --error-container: #ffdad6;
  --on-error-container: #93000a;

  /* Outlines */
  --outline: #76777d;
  --outline-variant: #c6c6cd;
}
```

---

# Design System Specification: The Editorial Content Engine

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built to transform a standard SaaS tool into a premium, editorial experience for content creators. Our Creative North Star is **The Digital Curator**. Unlike generic platforms that rely on rigid grids and heavy borders, this system treats the interface as a high-end digital gallery. 

We break the "template" look through **intentional asymmetry** and **high-contrast typography scales**. By leveraging expansive whitespace and tonal depth, we ensure that the UI recedes, allowing the creator’s content to remain the undisputed protagonist. The aesthetic is "Soft Minimalism"—sophisticated, silent, and structurally authoritative.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep blacks and cool grays, punctuated by a singular, high-energy accent of electric violet.

### Palette Highlights
*   **Primary (#000000):** Used for high-impact structural elements and key typography.
*   **Tertiary/Accent (#9466ff / #23005c):** Our "Electric Violet" signature. Use sparingly for critical CTAs and progress indicators.
*   **Surface Hierarchy:** We utilize the `surface-container` tiers to create a physical sense of "nesting" rather than a flat digital grid.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. 
*   Boundaries must be defined solely through background color shifts. 
*   *Example:* A navigation sidebar using `surface-container-low` should sit directly against a `surface` background. The shift in tone is the divider.

### The Glass & Gradient Rule
To move beyond a "standard" SaaS feel:
*   **Glassmorphism:** For floating overlays (modals, dropdowns, or hovering toolbars), use `surface-container-lowest` at 80% opacity with a `20px` backdrop-blur.
*   **Signature Textures:** Main CTAs should utilize a subtle linear gradient transitioning from `primary` to `primary_container` (Deep Navy) to provide a "soul" and depth that flat hex codes lack.

---

## 3. Typography: Editorial Authority
We use a dual-sans-serif approach to balance character with readability.

*   **Display & Headlines (Manrope):** Our "Voice." Manrope’s geometric yet warm curves provide a modern, high-end feel. 
    *   *Usage:* Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero headers to create an editorial impact.
*   **Body & Labels (Inter):** Our "Utility." Inter is chosen for its exceptional legibility at small sizes. 
    *   *Usage:* `body-md` (0.875rem) is the workhorse for creator workflows.

**Hierarchy Note:** Always maintain a high contrast between headlines and body. If a headline is `headline-lg`, ensure the surrounding body text is at least three steps down the scale to maintain the "Editorial" look.

---

## 4. Elevation & Depth
In this system, depth is a result of light and layering, not artificial lines.

*   **The Layering Principle:** Achieve hierarchy by "stacking" surface tiers. Place a `surface-container-lowest` (Pure White) card on top of a `surface-container-low` background. This creates a soft, natural "lift."
*   **Ambient Shadows:** When an element must "float" (e.g., a dragged content block), use an extra-diffused shadow:
    *   *Shadow:* `0px 24px 48px rgba(25, 28, 30, 0.06)` (using a tinted version of `on-surface`).
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., input fields), use the `outline-variant` token at **20% opacity**. Never use 100% opaque borders.

---

## 5. Component Guidelines

### Buttons
*   **Primary:** A deep gradient from `primary` to `primary_container`. High-contrast `on_primary` text. Radius: `md` (0.375rem).
*   **Secondary:** Ghost style. No background, only a `label-md` weight text in `primary`.
*   **Tertiary (The Accent):** Used for "Create" or "Publish" actions. Background: `tertiary_container` with `on_tertiary_container` text.

### Cards & Content Blocks
*   **Strict Rule:** Forbid the use of divider lines within cards. 
*   **Separation:** Use the Spacing Scale (specifically `8` or `10`—2.75rem to 3.5rem) to create clear content groups. Use a shift to `surface-container-high` for hover states.

### Input Fields
*   **Minimalist State:** No bottom line or full box. Use a subtle `surface-container-highest` background fill with a `sm` (0.125rem) bottom radius.
*   **Focus State:** The background shifts to `surface-container-lowest` and a "Ghost Border" of `tertiary` (Electric Violet) appears at 30% opacity.

### Navigation: The Floating Dock
For content creators, the workspace is sacred. Use a "Floating Dock" for secondary tools:
*   **Style:** `surface-container-lowest` at 85% opacity, `xl` (0.75rem) corner radius, and a large ambient shadow.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** embrace asymmetry. It’s okay for a sidebar to be wider than the content if it balances the visual weight of a headline.
*   **Do** use `spacing-20` (7rem) between major sections. Whitespace is a functional tool, not a "waste of space."
*   **Do** use the `surface-tint` to subtly color-code different creator modes (e.g., "Edit" vs. "Preview").

### Don't:
*   **Don't** use 1px solid black borders. It breaks the "Digital Curator" illusion and makes the tool feel like a spreadsheet.
*   **Don't** use standard "Drop Shadows." If the shadow looks like a shadow, it’s too dark. It should look like "ambient occlusion."
*   **Don't** crowd the interface. If a screen feels busy, increase the spacing scale values by two levels before removing features.
