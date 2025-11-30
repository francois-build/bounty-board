# Bridge: Brand Identity & "Machined Neumorphism" System

## 1. Design Philosophy: "The Machined Aesthetic"

**Bridge is not a toy; it is infrastructure.** The design language rejects the soft, gummy feel of traditional neumorphism in favor of **High-Definition Precision**. It should feel like a high-end ceramic device or a milled aluminum tool: cold, solid, and exact.

**Core Tenants:**

1. **Ceramic Surfaces:** Ultra-light grey backgrounds (`Slate-100`) that feel physical, not digital white.
    
2. **Deep Ink:** Primary data is always `Slate-900`. High contrast = High trust.
    
3. **Micro-Bezels:** Every element has a 1px "chamfered edge" (highlight top, shadow bottom) to define boundaries clearly, ensuring accessibility even on low-contrast screens.
    
4. **Monospaced Truth:** Financials, Dates, and IDs are always rendered in Monospace fonts. This signals "raw data" integrity.
    

## 2. Color Palette (Tailwind Tokens)

### The Foundation (Light Mode)

- **Surface (Canvas):** `bg-slate-100` (#F1F5F9) - _The desk._
    
- **Surface (Card):** `bg-white` (#FFFFFF) - _The paper on the desk._
    
- **Ink (Primary):** `text-slate-900` (#0F172A) - _The contract text._
    
- **Ink (Secondary):** `text-slate-500` (#64748B) - _The metadata._
    

### The Foundation (Dark Mode - Eye Sensitivity)

_Goal: Reduce glare while maintaining hierarchy. Avoid pure black (#000000)._

- **Surface (Canvas):** `dark:bg-slate-950` (#020617) - _Deep matte charcoal._
    
- **Surface (Card):** `dark:bg-slate-900` (#0F172A) - _Slightly elevated plane._
    
- **Ink (Primary):** `dark:text-slate-200` (#E2E8F0) - _Soft white (reduced brightness)._
    
- **Ink (Secondary):** `dark:text-slate-400` (#94A3B8) - _Muted blue-grey._
    

### The Energy

- **Electric Blue (Action):** `bg-blue-600` (#2563EB) - _Primary Buttons, Active States._
    
- **Signal Green (Success):** `text-emerald-600` (#059669) - _Verified Badges, Positive Cashflow._
    
- **Alert Amber (Warning):** `text-amber-600` (#D97706) - _Pending Actions, Beta Features._
    

## 3. Typography System

**Headlines (Human):** `Inter` or System Sans.

- Tracking: Tight (`-0.02em`) for authoritative weight.
    
- Weight: SemiBold (600) or Bold (700).
    

**Data (Machine):** `JetBrains Mono`, `Roboto Mono`, or `Geist Mono`.

- Usage: Budget Ranges (`$50k - $100k`), Countdowns (`48h remaining`), IDs (`#CH-992`).
    
- Feature: Tabular lining (fixed width numbers) for perfect vertical alignment.
    

## 4. Component Physics (The "Tactile" Feel)

### A. The "Levitated" Card (Display)

Used for Challenges, Profiles, and Reports. It sits _on top_ of the ceramic surface.

- **Light Mode:** Soft, diffused drop shadow. Border uses "Micro-Bezel" logic (highlight top, shadow bottom).
    
- **Dark Mode:** Shadows disappear. Hierarchy is defined by **Edge Lighting**.
    
- **Tailwind:**
    
    - _Light:_ `bg-white rounded-xl shadow-sm border-t border-white/60 border-b border-slate-200/60`
        
    - _Dark:_ `dark:bg-slate-900 dark:border dark:border-slate-800 dark:shadow-none dark:ring-1 dark:ring-white/5`
        

### B. The "Concave" Input (Data Entry)

Used for Search bars and Form fields. It is _carved into_ the surface.

- **Light Mode:** Inner shadow to create depth.
    
- **Dark Mode:** Lower contrast background with a subtle border to define the input area without blinding contrast.
    
- **Tailwind:**
    
    - _Light:_ `bg-slate-50 shadow-inner border border-slate-200`
        
    - _Dark:_ `dark:bg-slate-950 dark:border-slate-800 dark:shadow-none dark:focus:bg-slate-900`
        
    - _Common:_ `rounded-lg focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 focus:dark:ring-offset-slate-900`
        

### C. The "Mechanical" Button (Action)

- **Resting:** High contrast, slight elevation.
    
- **Active (Click):** Inverts to inner shadow to simulate physical depression.
    
- **Tailwind:**
    
    - _Base:_ `bg-slate-900 dark:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg`
        
    - _Shadow:_ `shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20`
        
    - _Active:_ `active:scale-[0.98] active:shadow-inner`
        

## 5. Accessibility & Trust Signals

- **No "Ghost" Buttons:** Secondary actions must have a clear border (`border-slate-300 dark:border-slate-700`), not just text-on-background.
    
- **Data Density:** Avoid "whitespace bloat." Enterprise users want information density. Use compact tables and grids.
    
- **Badge Consistency:**
    
    - **Hollow Badges:** For labels (`border border-slate-200 dark:border-slate-700 dark:text-slate-300`).
        
    - **Solid Badges:** Strictly for Status (`bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400`).