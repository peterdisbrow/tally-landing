
# Clock Naming and Color Customization

## Overview
Add the ability to name clocks (editable title displayed above the time) and change the clock's display color from a set of broadcast-standard color presets.

## Features

### 1. Clock Name
- A clickable/editable text label displayed above the main time display
- Defaults to the mode name (e.g., "Clock", "Count Up", "Countdown")
- Click to edit inline, press Enter or click away to confirm
- Subtle styling that doesn't distract from the time display
- Keyboard shortcut: **N** to focus the name field

### 2. Color Picker
- A palette icon button in the top toolbar (next to the font and timezone buttons)
- Opens a panel with preset color options:
  - Red (current default)
  - Green
  - Amber/Yellow
  - Blue
  - Cyan
  - White
  - Magenta/Pink
- Selected color applies to: main time digits, active mode button highlights, mini-clock text, and UI accents
- Keyboard shortcut: **K** to cycle through colors
- The overtime (pulse) and warning (yellow) states will still override the color when active

## Technical Details

### State additions in `Clock.tsx`
- `clockName: string` -- defaults to `""` (shows mode name when empty)
- `clockColor: string` -- stores the current hex color, defaults to `#ef4444` (red-500)
- `editingName: boolean` -- tracks inline editing state
- `showColorPicker: boolean` -- toggles color panel

### Color presets constant
```text
COLOR_PRESETS = [
  { label: "Red",     value: "#ef4444" },
  { label: "Green",   value: "#22c55e" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Cyan",    value: "#06b6d4" },
  { label: "White",   value: "#ffffff" },
  { label: "Magenta", value: "#d946ef" },
]
```

### UI changes
- **Name display**: Rendered above the main clock `motion.div`, as an `input` when editing or a `span` when not. Styled with `font-mono text-sm uppercase tracking-widest` in the selected color at reduced opacity.
- **Color picker button**: A `Palette` icon (from lucide-react) added to the top toolbar row, opening a panel similar to the existing font/timezone pickers.
- **Color application**: Replace hardcoded `text-red-500` classes with inline `style={{ color: clockColor }}` on the time display, mode buttons, and accent elements. Overtime and warning states override with their own colors.

### Keyboard shortcut updates
- **N** -- Focus clock name for editing
- **K** -- Cycle to next color preset
- Help panel updated with new shortcuts

### Files modified
- `src/pages/Clock.tsx` -- All changes contained in this single file
