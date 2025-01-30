# NowNowNow Widget Side Panel Specification

## Overview
The NowNowNow widget consists of a floating action button (FAB) and a sliding side panel that provides an immersive chat-like experience. The widget seamlessly integrates into any webpage while maintaining a non-intrusive presence.

## Floating Action Button (FAB)
- **Position**: Fixed to either left or right side of viewport (configurable)
- **Size**: Customizable (default: 90px diameter)
- **Color**: Customizable via data-button-color attribute
- **Shape**: Perfect circle with subtle drop shadow
- **Icon**: "Now" text in modern sans-serif font
- **Hover Effect**: 
  - Gentle scale transform (1.05)
  - Transition: 200ms ease-in-out
  - Subtle shadow expansion

## Side Panel Animation
### Opening Animation
1. **Trigger**: Click on FAB
2. **Panel Slide**:
   - Initial state: translateX(-100%) or translateX(100%) based on position
   - Animation: 
     - Duration: 300ms
     - Timing: cubic-bezier(0.4, 0, 0.2, 1)
     - Transform: translateX(0)
3. **Backdrop**:
   - Fade in: opacity 0 → 0.5
   - Background: rgba(0, 0, 0, 0.5)
   - Duration: 200ms
4. **Content Fade**:
   - Staggered entrance of elements
   - Duration: 150ms per element
   - Timing: ease-out

### Closing Animation
1. **Trigger**: Click outside or close button
2. **Panel Slide**:
   - Reverse of opening animation
   - Slightly faster duration (250ms)
3. **Backdrop**:
   - Fade out: opacity 0.5 → 0
   - Duration: 200ms
4. **Content**:
   - Quick fade out (150ms)
   - Scale slightly (0.98)

## Panel Layout
- **Dimensions**: 
  - Width: 400px on desktop, 100% on mobile
  - Height: 100vh
- **Structure**:
  1. Header Bar
     - Logo/Title
     - Close button (×)
  2. Main Content Area
     - Scrollable container
     - Custom scrollbar styling
  3. Footer (if needed)
     - Action buttons
     - Status indicators

## Visual Design
- **Theme Support**:
  - Light/Dark modes via data-theme
  - Customizable accent colors
- **Border Radius**:
  - Panel: 12px on open side
  - Inner elements: 8px
- **Shadow**:
  - Layer 1: 0 0 10px rgba(0,0,0,0.1)
  - Layer 2: 0 0 30px rgba(0,0,0,0.05)

## Responsive Behavior
### Mobile (<768px)
- Full-width panel
- Bottom sheet option for better UX
- Adjusted animations for performance

### Tablet (768px - 1024px)
- Maintained 400px width
- Adjusted FAB positioning

### Desktop (>1024px)
- Standard side panel behavior
- Optional wider layout (configurable)

## Accessibility
- **ARIA Attributes**:
  - role="dialog"
  - aria-modal="true"
  - aria-labelledby="panel-title"
- **Keyboard Navigation**:
  - ESC to close
  - Tab trap within panel
  - Focus management

## Performance Considerations
- **CSS Transforms** for animations (GPU acceleration)
- **will-change** property for smooth animations
- Lazy loading of panel content
- Debounced resize handlers

## State Management
- **Panel States**:
  - Closed (default)
  - Opening (animating)
  - Open
  - Closing (animating)
- **Animation States**:
  - Track animation completion
  - Handle interruptions gracefully

## Integration Requirements
```html
<script 
  defer 
  src="http://localhost:5173/dist/now-widget.js" 
  data-user-id="[USER_ID]" 
  data-token="[JWT_TOKEN]" 
  data-theme="dark" 
  data-position="left" 
  data-button-color="#1a73e8" 
  data-button-size="90">
</script>