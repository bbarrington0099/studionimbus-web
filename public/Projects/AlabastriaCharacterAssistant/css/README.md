# CSS Module Structure

This directory contains the modular CSS files for the Alabastria Character Assistant. The CSS has been organized into logical modules for better maintainability and organization.

## File Structure

### Main File
- **`../style.css`** - Main CSS file that imports all modules and contains global variables, base styles, animations, and utility classes

### CSS Modules
- **`navigation.css`** - Navigation bar, logo, title, color mode toggle, and footer styles
- **`layout.css`** - Main layout structure, sections, welcome content, and basic page organization
- **`components.css`** - Reusable UI components like buttons, cards, details/summary elements, and badges
- **`character.css`** - Character-specific styles including relationships, races, classes, and subrace hierarchies
- **`guild.css`** - Guild-related styles including member cards, staff displays, quest reports, and guild navigation
- **`timeline.css`** - Timeline display and modal popup styles
- **`responsive.css`** - All responsive design rules for tablets, mobile devices, and accessibility features

## Global Variables

All CSS custom properties (variables) are defined in the main `style.css` file and are available to all modules:

### Color Palette
- `--parchment-light`, `--parchment-dark` - Background colors
- `--ink-dark`, `--ink-light` - Text colors
- `--glass-bg`, `--ocean-blue`, `--mountain-brown` - Primary theme colors
- `--desert-tan`, `--ice-blue`, `--volcanic-red`, `--gold-accent` - Accent colors

### UI Variables
- `--border-radius` - Standard border radius (8px)
- `--shadow-light`, `--shadow-dark` - Box shadow presets
- `--transition` - Standard transition timing (all 0.3s ease)
- `--text-shadow-light`, `--text-shadow-dark` - Text shadow presets

## Theme System

The application supports both light and dark modes through CSS classes:
- `.lightMode` - Light theme styles
- `.darkMode` - Dark theme styles

## Responsive Design

The responsive design is handled in `responsive.css` with breakpoints at:
- **768px and below** - Tablet styles
- **480px and below** - Mobile styles
- **1200px and above** - Large screen optimizations

Additional responsive features:
- Print styles for better printing
- High contrast mode support
- Reduced motion support for accessibility

## Usage

The HTML file only needs to import the main `style.css` file:

```html
<link rel="stylesheet" href="style.css">
```

All modules are automatically imported through CSS `@import` statements in the main file.

## Maintenance

When making changes:
1. **Global changes** - Edit `style.css` (variables, base styles, animations)
2. **Navigation changes** - Edit `navigation.css`
3. **Layout changes** - Edit `layout.css`
4. **Component changes** - Edit `components.css`
5. **Character features** - Edit `character.css`
6. **Guild features** - Edit `guild.css`
7. **Timeline/modal features** - Edit `timeline.css`
8. **Responsive issues** - Edit `responsive.css`

## Backup

The original monolithic CSS file has been preserved as `style-original-backup.css` for reference.
