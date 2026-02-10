# Design System Architecture

This workspace ships a token-based design system that mirrors the architecture used by the DaaS backend UI, while staying framework-agnostic and brand-neutral.

## Overview

The design system has three layers:

1. **Design tokens** in `app/design-tokens.css` (single source of truth)
2. **Mantine theme mapping** in `lib/theme.ts` (tokens -> component defaults)
3. **Global overrides** in `app/globals.css` (Mantine class-level tweaks)

## Files

```
app/design-tokens.css   # Color, typography, spacing, radius, shadow tokens
app/globals.css         # Base styles + Mantine overrides
lib/theme.ts            # Mantine createTheme() using CSS variables
components/ColorSchemeToggle.tsx  # Optional light/dark toggle
```

## Token Strategy

Tokens are defined with the `--ds-` prefix and use CSS custom properties so themes can be swapped without rebuilding.

```css
:root {
  --ds-primary: #5925dc;
  --ds-gray-600: #344054;
  --ds-spacing-4: 1rem;
  --ds-radius: 0.375rem;
}
```

## Mantine Theme Mapping

`lib/theme.ts` maps token values into Mantine, so all components inherit the system defaults automatically.

```ts
import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "primary",
  fontFamily: "var(--ds-font-family)",
  spacing: {
    sm: "var(--ds-spacing-4)"
  }
});
```

## Dark Mode

Dark mode is handled with the `[data-mantine-color-scheme="dark"]` selector in `design-tokens.css`. Mantine uses `ColorSchemeScript` and `defaultColorScheme="auto"` in the root layout.

## How To Customize

1. Update token values in `app/design-tokens.css`.
2. Extend `lib/theme.ts` for component-level defaults.
3. Add any global overrides in `app/globals.css`.

## Notes

- Tokens are intentionally generic and brand-neutral.
- Keep new UI code using Mantine theme values or token variables rather than hard-coded hex values.
