# Design System Strategy: Streetwise Sophistication

## 1. Overview & Creative North Star: "The Urban Concierge"

The creative North Star for this design system is **"The Urban Concierge."** It represents a departure from the sterile, corporate "SaaS-blue" landscape, opting instead for an editorial experience that feels human, energetic, and authoritative.

We are blending "Streetwise Trust"—the reliability of a local guide who knows every corner—with "Disrupfun"—the vibrant energy of a brand that isn't afraid to break conventions. This design system moves away from rigid, boxy templates in favor of **intentional asymmetry, overlapping glass surfaces, and a high-contrast typographic scale**. We treat the screen like a premium physical space where depth is felt through tonal layering rather than artificial lines.

---

## 2. Color & Surface Philosophy

Our palette is anchored by the vibrant "Disrupfun" energy of the logo, balanced against deep, trustworthy neutrals.

### The Color Tokens

- **Primary Spectrum:** `primary` (#a82b49) and `primary-container` (#ff738b). These represent the heartbeat of the platform—vibrant, warm, and inviting.
- **Secondary Energy:** `secondary` (#8a4c00) and `secondary-container` (#ffc697). Used for moments of "Streetwise" action and highlights.
- **Trust Anchors:** `on-background` (#2d2f31) and `inverse-surface` (#0c0e10). Use these for high-contrast typography to ensure authority and legibility.

### Surface Governance

- **The "No-Line" Rule:** We explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. Use `surface-container-low` sections sitting on a `surface` background to define areas.
- **Surface Hierarchy:** Create depth by nesting. A `surface-container-lowest` card should live on top of a `surface-container-low` section. This creates a soft, tactile lift.
- **The "Glass & Gradient" Rule:** For floating elements or top-level navigation, use Glassmorphism. Implement `surface` colors at 80% opacity with a `20px` backdrop-blur.
- **Signature Textures:** For Hero sections and primary CTAs, use a linear gradient from `primary` to `primary-container` at a 135-degree angle. This provides a "soul" to the UI that flat colors cannot achieve.

---

## 3. Typography: Editorial Authority

We use a high-contrast scale to create an editorial feel that guides the eye.

- **Headlines (Plus Jakarta Sans):** This is our "Friendly Professional." It is rounded enough to feel approachable but structured enough to command trust.
  - _Display-LG (3.5rem):_ Use for big, disruptive statements with `-2%` letter spacing.
  - _Headline-MD (1.75rem):_ Our standard for page headers.
- **Body (Manrope):** We use Manrope for its exceptional legibility and modern, clean geometric forms.
  - _Body-LG (1rem):_ Standard reading text. Ensure a line height of `1.6` to give the content room to breathe.
- **The Hierarchy Goal:** Use `on-surface` for headers and `on-surface-variant` for body text. This subtle tonal shift creates an immediate visual hierarchy that feels sophisticated and intentional.

---

## 4. Elevation & Depth: Tonal Layering

Shadows and borders are secondary; layering is primary.

- **The Layering Principle:** Depth is achieved by "stacking" the `surface-container` tiers.
- **Ambient Shadows:** When an element must "float" (like a primary button or a profile card), use an extra-diffused shadow.
  - _Token:_ `box-shadow: 0px 20px 40px rgba(45, 47, 49, 0.06);` (shadow color is a tinted version of `on-surface`, never pure black)
- **The "Ghost Border" Fallback:** If a container needs more definition (e.g., in high-density data views), use the `outline_variant` token at **15% opacity**. This creates a "suggestion" of a boundary without cluttering the UI.
- **Soft Roundness Scale:**
  - `md (1.5rem)`: Standard for cards and major containers.
  - `full (9999px)`: Reserved for buttons and status chips to maintain the "Disrupfun" energy.

---

## 5. Components

### Buttons: The "Bone" Aesthetic

- **Primary:** High-energy gradient (Primary to Primary Container). Shape: `full` (pill-shaped). For a subtle nod to Blue, the hover state can include a slight "bounce" animation.
- **Tertiary:** `on-surface` text with no background. On hover, a `surface-container-high` background fades in with an `md` corner radius.

### Cards: The Nested Experience

- No borders. No dividers.
- Use `surface-container-lowest` for the card body.
- Use vertical white space (`spacing-8`) to separate the header, content, and actions.
- **Dog-Themed Accent:** Use a subtle `outline-variant` (at 10% opacity) "paw print" watermark in the bottom right corner of empty-state cards.

### Input Fields: Clean & Streetwise

- **Background:** `surface-container-low`.
- **Active State:** Transitions to `surface-container-lowest` with a `primary` ghost border (20% opacity).
- **Shape:** `sm` (0.5rem) for a more "business-stable" feel compared to the playful buttons.

### Additional Signature Component: "The Match Chip"

- A custom component for matchmaking. It uses a `secondary-container` background with `on-secondary-container` text. The shape is a unique "bone" profile (rounded ends, slightly pinched middle) to lean into the brand personality during the core matchmaking experience.

---

## 6. Do's and Don'ts

### Do:

- **Do** use asymmetrical layouts. Place a large image off-center with text overlapping on a `surface-container-lowest` glass panel.
- **Do** use the `spacing-12` and `spacing-16` tokens for section margins. Breathing room is a sign of luxury.
- **Do** use the gradient sparingly. It should be a reward for the user's eye, not a distraction.

### Don't:

- **Don't** use 1px solid dividers to separate list items. Use `surface-container-low` background shifts or simply `spacing-4`.
- **Don't** use "default" grey shadows. Always tint your shadows with the `on-surface` color at very low opacities.
- **Don't** crowd the interface. If it feels tight, increase the spacing by one tier in the scale.
- **Don't** overdo the dog theme. It should be a "secret handshake" for the user, not a cartoon. Subtle icons and "bone" shapes in button profiles are enough.
