# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pardus-Library is a browser userscript library for the online space game [Pardus](https://pardus.at). It provides JavaScript abstractions over Pardus's HTML pages, enabling Tampermonkey/Greasemonkey scripts to interact with game elements. Consumed via `@require` in userscripts as a UMD bundle.

Three game universes: `orion`, `artemis`, `pegasus` (detected via `document.location.hostname`).

## Commands

- **Build:** `npm run build` — bundles `src/index.js` → `dist/pardus-library.js` (webpack, UMD, unminified)
- **Lint:** `npm run lint` / `npm run lint-fix`
- **Docs:** `npm run gen-docs`
- **Tests:** No automated test runner. Only manual HTML fixtures in `test/`.

## Architecture

### Entry Point & Exports

`src/index.js` exports only: `PardusLibrary`, `Tile`, `Sectors`, `Msgframe`. The public API is intentionally narrow.

### Page Routing

`PardusLibrary` (constructor) reads `document.location.pathname` to instantiate the correct page class (e.g., `/main.php` → `Main`, `/planet_trade.php` → `PlanetTrade`). New pages are added by creating a page class and adding a case to this switch.

### Class Hierarchy

```
AbstractPage                     — base for all pages, provides common DOM accessors
  ├── Main                       — main.php, owns NavArea and OtherShips
  ├── Logout                     — logout.php
  ├── Msgframe                   — msgframe.php
  └── TradeablePage (abstract)   — base for trading pages, commodity table parsing
        └── PlanetTrade          — planet_trade.php

Refreshable (abstract mixin)     — MutationObserver-based DOM re-parsing
  ├── NavArea                    — the space navigation grid (tile-based)
  └── OtherShips                 — nearby ships panel
```

### Key Subsystems

- **`src/classes/main/nav.js` (NavArea):** The navigation grid. Uses `Tile` objects for each cell. Generator functions for iteration (`tiles()`, `clickableTiles()`, `navigatableTiles()`, `yieldPathBetween`). MutationObserver triggers re-parse on AJAX nav updates.
- **`src/classes/main/tile.js` (Tile):** Single nav grid cell. Handles tile highlighting with colour mixing (generator-based). Static `Tile.colours` Map for named colours.
- **`src/classes/pardus/sector.js`:** Sector coordinate math — converts between tile IDs and row/col positions, handles virtual tiles and wormholes.
- **`src/classes/static/sectors.js`:** Singleton `Map` of all sectors (populated from `src/data/sectors.js`), with helper methods patched onto the Map instance.
- **`src/classes/pardus/commodity.js`:** Commodity domain object for trade pages — prices, stock, buy/sell DOM actions.
- **`src/data/`:** Static game data files (sector definitions, commodity names). Excluded from ESLint.

## Code Conventions

- **ES modules** with explicit `.js` extensions on all imports (enforced by ESLint)
- **4-space indentation**
- **Private class fields** (`#field`) and private methods (`#method()`) used extensively
- **Generator functions** (`function*` / `yield`) for iteration patterns
- **No TypeScript** — plain JavaScript with JSDoc annotations
- **`greasemonkey: true`** ESLint env — GM_* globals are valid
- Game globals (`nav`, `navAjax`, `warp`, `userloc`) are referenced directly, guarded with `typeof` checks
- ESLint extends `airbnb-base` with relaxed rules: no max-len, no max-classes-per-file, no-console allowed
