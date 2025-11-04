# 🎨 Color Customization Guide

This guide shows you exactly where to change colors throughout the Püper app.

## 📍 Main Color Locations

### 1. Primary Theme Colors (App.js - Styles Section)

**Location**: `PuperMobile/App.js` - `StyleSheet.create()` section (around line 1444)

#### Main Background Colors:
- **Line ~1447**: `backgroundColor: '#F5F5DC'` - Main app background (beige)
- **Line ~1608**: `backgroundColor: '#2C2C2C'` - Rating modal background (dark gray)

#### Primary Brand Color:
- **Line ~1627**: `color: '#6B4423'` - Primary brown theme color
- **Line ~1326**: `backgroundColor: '#6B4423'` - Header background
- **Line ~1260**: `backgroundColor: '#6B4423'` - CTA section background
- **Line ~1668**: `backgroundColor: '#6B4423'` - Clear filters button
- **Line ~1728**: `backgroundColor: '#6B4423'` - Add restroom button
- **Line ~1760**: `backgroundColor: '#6B4423'` - Submit rating button

#### Text Colors:
- **Line ~1627**: `color: '#6B4423'` - Section titles, feature titles
- **Line ~1632**: `color: '#F5F5DC'` - Light text on dark backgrounds
- **Line ~1187**: `color: '#FFF'` - White text
- **Line ~1196**: `color: '#F5F5DC'` - Light beige text

#### Map Marker Colors:
- **Line ~765**: `backgroundColor: '#8B4513'` - Restroom marker (saddle brown)
- **Line ~798**: `backgroundColor: '#0dffe7'` - Add location marker (cyan)

#### Rating Badge Colors (Dynamic):
- **Line ~775-777**: Green/Yellow/Red based on rating:
  - `'#27AE60'` - Green (rating >= 4)
  - `'#FFD700'` - Gold (rating >= 3)
  - `'#FF6347'` - Red-orange (rating >= 2)
  - `'#E74C3C'` - Red (rating < 2)

#### Availability Status Colors:
- **Line ~1091**: `color: '#27AE60'` - Available (green)
- **Line ~1092**: `color: '#F39C12'` - Busy (orange)
- **Line ~1093**: `color: '#E74C3C'` - Closed (red)

### 2. App Configuration Colors (app.json)

**Location**: `PuperMobile/app.json`

- **Line 14**: `"backgroundColor": "#6B4423"` - Splash screen background
- **Line 30**: `"backgroundColor": "#6B4423"` - Android adaptive icon background

### 3. Hero Section Overlay

**Location**: `App.js` - Line ~1168

- **Line ~1168**: `backgroundColor: 'rgba(107, 68, 35, 0.7)'` - Hero overlay (brown with transparency)
  - RGB values: `107, 68, 35` = `#6B4423` with 70% opacity

### 4. Card/Button Colors

**Location**: `App.js` - Styles Section

- **Line ~1213**: `backgroundColor: '#FFF'` - White cards
- **Line ~1228**: `backgroundColor: '#F9F9F9'` - Feature cards (light gray)
- **Line ~1284**: `backgroundColor: '#FFF'` - CTA buttons (white)
- **Line ~1316**: `backgroundColor: '#2D1810'` - Footer background (dark brown)

### 5. Input Field Colors

**Location**: `App.js` - Styles Section

- **Line ~1696**: `backgroundColor: '#f9f9f9'` - Light input fields
- **Line ~1705**: `backgroundColor: '#1a1a1a'` - Dark input fields (rating modal)
- **Line ~1701**: `borderColor: '#555'` - Dark input borders

### 6. Switch/Toggle Colors

**Location**: `App.js` - Multiple locations (around line 919, 928, 937, etc.)

- `trackColor={{ false: '#ccc', true: '#6B4423' }}` - Switch colors
  - Unchecked: `'#ccc'` (light gray)
  - Checked: `'#6B4423'` (brown)

## 🔄 How to Change Colors

### Quick Color Replacement:

1. **Open**: `PuperMobile/App.js`
2. **Search** for the color hex code you want to change (e.g., `#6B4423`)
3. **Replace** with your new color
4. **Save** and reload the app

### Example: Change Primary Brown to Blue

Replace all instances of `#6B4423` with your color (e.g., `#3B82F6` for blue):

```javascript
// Before:
backgroundColor: '#6B4423'

// After:
backgroundColor: '#3B82F6'
```

### Color Scheme Suggestions:

If you want to change the entire color scheme, here are the main colors to update:

1. **Primary Color** (`#6B4423`): Main brand color
   - Replace in: Headers, buttons, titles, switches
   
2. **Background Color** (`#F5F5DC`): Main background
   - Replace in: Container backgrounds
   
3. **Dark Background** (`#2C2C2C`): Modal backgrounds
   - Replace in: Rating modal
   
4. **Marker Colors**:
   - Restroom marker: `#8B4513`
   - Add marker: `#0dffe7`

## 📝 Color Constants (Recommended)

For easier color management, you could create a constants file:

**Create**: `PuperMobile/constants/colors.js`

```javascript
export const Colors = {
  primary: '#6B4423',
  background: '#F5F5DC',
  darkBackground: '#2C2C2C',
  white: '#FFF',
  lightText: '#F5F5DC',
  marker: '#8B4513',
  addMarker: '#0dffe7',
  // ... etc
};
```

Then import and use:
```javascript
import { Colors } from './constants/colors';
backgroundColor: Colors.primary
```

## 🎯 Quick Reference: All Color Locations

| Color | Hex Code | Location (Line) | Usage |
|-------|----------|----------------|-------|
| Primary Brown | `#6B4423` | Multiple | Headers, buttons, titles |
| Background Beige | `#F5F5DC` | ~1447 | Main background |
| Dark Gray | `#2C2C2C` | ~1608 | Modal backgrounds |
| White | `#FFF` | Multiple | Text, buttons |
| Saddle Brown | `#8B4513` | ~765 | Map markers |
| Cyan | `#0dffe7` | ~798 | Add location marker |
| Dark Brown | `#2D1810` | ~1316 | Footer |
| Light Gray | `#F9F9F9` | ~1228 | Cards |

## ✅ After Changing Colors

1. **Save** the file
2. **Reload** the app (shake device → Reload, or press `r` in terminal)
3. **Check** all screens to ensure colors look good
4. **Test** on both light and dark backgrounds if applicable

---

**Note**: Make sure to update colors in both `App.js` and `app.json` for consistency!

