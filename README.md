# Pardus Library

A JavaScript library providing DOM abstractions for the browser MMO [Pardus](https://pardus.at). Designed to be consumed as an npm dependency by Tampermonkey/Greasemonkey userscripts.

## Installation

Add as a dependency in your userscript project:

```json
{
  "dependencies": {
    "pardus-library": "github:tro95/pardus-library"
  }
}
```

Then import what you need:

```javascript
import { PardusLibrary, Tile, Sectors, Msgframe } from 'pardus-library';
```

## Quick Start

```javascript
import { PardusLibrary } from 'pardus-library';

const pardus = new PardusLibrary();
const page = pardus.currentPage;

// On main.php, access the nav grid and other ships
if (pardus.page === '/main.php') {
    const nav = page.nav;

    // Highlight tiles
    const highlights = new Map([['12345', 'g'], ['12346', 'r']]);
    nav.addTilesHighlight(highlights);

    // Hook into partial refresh (AJAX navigation)
    nav.addAfterRefreshHook(() => {
        console.log('Nav area refreshed');
    });

    // Hook into other ships panel refresh
    page.otherShips.addAfterRefreshHook(() => {
        console.log('Other ships panel refreshed');
    });
}

// On trade pages, access commodities
if (pardus.page === '/planet_trade.php') {
    for (const [name, commodity] of page.commodities) {
        console.log(`${name}: ship has ${commodity.shipStock}, trade stock ${commodity.tradeStock}`);
    }
}
```

## Exports

The library exports four items:

| Export | Description |
|---|---|
| `PardusLibrary` | Main class. Routes by pathname to page handlers. |
| `Tile` | Navigation grid cell. Handles highlighting, click events, pathfinding. |
| `Sectors` | Static `Map` of all game sectors with coordinate lookup methods. |
| `Msgframe` | Message frame controller for displaying status messages. |

## API Reference

### PardusLibrary

```javascript
const pardus = new PardusLibrary();
```

| Member | Type | Description |
|---|---|---|
| `page` | `string` | Current `document.location.pathname` |
| `currentPage` | `AbstractPage` | The instantiated page handler |
| `main` | `Main \| null` | Shortcut to Main page (null if not on `/main.php`) |
| `static getUniverse()` | `string` | Returns `'orion'`, `'artemis'`, or `'pegasus'` |
| `static getImagePackUrl()` | `string` | URL of the current image pack |

**Page routing:**

| Pathname | Page Class |
|---|---|
| `/main.php` | `Main` |
| `/planet_trade.php` | `PlanetTrade` |
| `/starbase_trade.php` | `StarbaseTrade` |
| `/blackmarket.php` | `Blackmarket` |
| `/drop_cargo.php` | `DropCargo` |
| `/ship2ship_transfer.php` | `ShipTransfer` |
| `/msgframe.php` | `Msgframe` |
| `/logout.php` | `Logout` |

### Trade Pages

`PlanetTrade`, `StarbaseTrade`, and `Blackmarket` all extend `TradeablePage`, which provides a unified interface for trading.

```javascript
const pardus = new PardusLibrary();
const page = pardus.currentPage; // e.g. PlanetTrade
```

| Member | Type | Description |
|---|---|---|
| `commodities` | `Map<string, Commodity>` | All commodities on the page |
| `shipSpace` | `ShipSpace` | Ship cargo space info |
| `availableShipSpace` | `number` | Remaining ship space after pending trades |
| `availableTotalSpace` | `number` | Ship + magscoop space |
| `availableMagscoopSpace` | `number` | Remaining magscoop space |
| `availableBuildingSpace` | `number \| null` | Building space (null if N/A) |
| `transferButton` | `HTMLInputElement \| null` | The transfer button element |
| `isPlayerOwned` | `boolean` | Whether this is a player-owned location |
| `allowedSpace(magscoopAllowed)` | `number` | Total or ship space depending on flag |
| `transfer()` | `void` | Clicks the transfer button |
| `recalculateSpace()` | `void` | Recalculates space, fires `pardus-trade-space-changed` event |

`PlanetTrade` adds:

| Member | Type | Description |
|---|---|---|
| `type` | `string` | Planet type: `'i'`, `'r'`, `'m'`, `'a'`, `'d'`, or `'g'` |

#### Commodity

Each entry in the `commodities` Map is a `Commodity` object:

| Member | Type | Description |
|---|---|---|
| `name` | `string` | Commodity name (read-only) |
| `sellPrice` | `number` | Sell price |
| `buyPrice` | `number` | Buy price |
| `shipStock` | `number` | Quantity on ship |
| `tradeStock` | `number` | Quantity at location |
| `bal` | `number` | Balance level |
| `min` | `number` | Minimum stock level |
| `max` | `number` | Maximum stock level |
| `sell(quantity)` | `void` | Set sell input to quantity |
| `buy(quantity)` | `void` | Set buy input to quantity |
| `getSelling()` | `number` | Current sell input value |
| `getBuying()` | `number` | Current buy input value |

### DropCargo

```javascript
// On /drop_cargo.php
const fuel = page.commodities.get('Hydrogen fuel');
fuel.drop(fuel.shipStock - 5); // Drop all but 5 fuel
```

| Member | Type | Description |
|---|---|---|
| `commodities` | `Map<string, object>` | Droppable commodities |

Each commodity has: `name`, `shipStock`, `dropElement`, and `drop(quantity)`.

### ShipTransfer

```javascript
// On /ship2ship_transfer.php
const resources = page.resources;
page.submit();
```

| Member | Type | Description |
|---|---|---|
| `form` | `HTMLFormElement` | The transfer form |
| `resourcesTable` | `HTMLTableElement` | Resources table |
| `resources` | `Map<string, object>` | Transferable resources |
| `playerId` | `string` | Target player ID |
| `freeSpace` | `number` | Receiving ship's free space |
| `submit()` | `void` | Submit the form |
| `getRedirectUrl()` | `string` | URL after transfer |

### Main Page

The `Main` page handler provides access to the navigation grid and other ships panel.

```javascript
const main = pardus.currentPage; // on /main.php
const nav = main.nav;           // NavArea instance
const ships = main.otherShips;  // OtherShips instance
```

#### NavArea

| Member | Type | Description |
|---|---|---|
| `height` | `number` | Grid height |
| `width` | `number` | Grid width |
| `grid` | `Tile[][]` | 2D array of tiles |
| `centreTile` | `Tile` | Player's current tile |
| `tilesMap` | `Map<string, Tile>` | Tile lookup by ID |
| `addTilesHighlight(map)` | `void` | Add single colour per tile |
| `addTilesHighlights(map)` | `void` | Add colour sets per tile |
| `clearTilesHighlights()` | `void` | Remove all highlights |
| `getTile(id)` | `Tile \| null` | Look up tile by ID |
| `getTileOnNav(id)` | `Tile \| null` | Find tile on current nav grid |
| `getPathTo(tile)` | `Tile[]` | Path from centre to tile |
| `getPathFrom(tile)` | `Tile[]` | Path from tile to centre |
| `getPathBetween(from, to)` | `Tile[]` | Path between two tiles |
| `nav(id)` | `void` | Navigate to tile (calls game's `navAjax`/`nav`) |
| `warp(id)` | `void` | Warp to tile (calls game's `warpAjax`/`warp`) |
| `xhole(id)` | `void` | X-hole warp |

Generator methods: `*tiles()`, `*clickableTiles()`, `*navigatableTiles()`, `*yieldPathTo(tile)`, `*yieldPathFrom(id)`, `*yieldPathBetween(from, to)`.

#### Tile

| Member | Type | Description |
|---|---|---|
| `id` | `string` | Tile ID (read/write) |
| `x` | `number` | Grid X coordinate |
| `y` | `number` | Grid Y coordinate |
| `element` | `HTMLElement` | DOM element |
| `type` | `string` | `'regular'`, `'wormhole'`, `'y-hole'`, `'x-hole'` |
| `objectType` | `string` | `''`, `'npc'`, `'building'` |
| `isClickable()` | `boolean` | Has a valid tile ID |
| `isNavigatable()` | `boolean` | Has a nav link |
| `isWormhole()` | `boolean` | Is a wormhole |
| `isXHole()` | `boolean` | Is an x-hole |
| `isYHole()` | `boolean` | Is a y-hole |
| `hasNpc()` | `boolean` | Has an NPC |
| `isCentreTile()` | `boolean` | Is the centre tile |
| `isVirtualTile()` | `boolean` | Is a virtual (out-of-bounds) tile |
| `addHighlight(colour)` | `void` | Add highlight colour |
| `removeHighlight(colour)` | `void` | Remove highlight colour |
| `clearHighlight()` | `void` | Remove all highlights |
| `isHighlighted()` | `boolean` | Has any highlights |
| `emphasiseHighlight()` | `void` | Emphasise current highlight |
| `removeEmphasis()` | `void` | Remove emphasis |
| `addEventListener(event, fn, opts)` | `void` | Add listener to nav link |

**Static:** `Tile.colours` is a `Map` of named colours (`Green`, `Blue`, `Red`, `Yellow`, `Cyan`, `Magenta`, `Silver`) with `{ red, green, blue, shortCode }`.

Highlight colours are specified using short codes: `g`, `b`, `r`, `y`, `c`, `m`, `s`.

#### OtherShips

| Member | Type | Description |
|---|---|---|
| `isFocusedOnSingleShip()` | `boolean` | Viewing single ship details |
| `getShips()` | `Array \| null` | Nearby ships (null if focused on single ship) |

Each ship object: `{ playerId, online, playerName, allianceName, shipType, shipElement }`.

### Refreshable (Base Class)

`NavArea` and `OtherShips` extend `Refreshable`, which provides a hook-based refresh system for DOM elements that update via AJAX.

```javascript
// Hook into refresh cycle
navArea.addAfterRefreshHook(() => { /* runs after DOM re-parse */ });
navArea.addBeforeRefreshHook(() => { /* runs before DOM re-parse */ });
```

Subclasses override `_reload()` to re-parse their DOM, and optionally `mutationCallback()` to handle MutationObserver events.

### Sectors

A `Map<string, Sector>` with additional utility methods.

```javascript
import { Sectors } from 'pardus-library';

const sector = Sectors.getSectorForTile(12345);
const label = Sectors.getSectorAndCoordsForTile(12345); // "Alpha Centauri [3, 7]"
const tileId = Sectors.getTileIdFromSectorAndCoords('Alpha Centauri', 3, 7);
```

| Method | Returns | Description |
|---|---|---|
| `getSectorForTile(tileId)` | `Sector` | Get sector containing tile |
| `getSectorAndCoordsForTile(tileId)` | `string` | Human-readable location |
| `getTileIdFromSectorAndCoords(name, x, y)` | `number` | Convert to tile ID |
| `*getSectors()` | `Generator<Sector>` | Iterate all sectors |

### Msgframe

```javascript
import { Msgframe } from 'pardus-library';

// Send a message (from any page, dispatches to msgframe.php via custom event)
Msgframe.sendMessage('Autopilot engaged', 'info');
Msgframe.sendMessage('Error occurred', 'error');
```

| Method | Description |
|---|---|
| `static sendMessage(msg, type)` | Display message in the game's message frame |
| `hasMessage()` | Check if a message is displayed |
| `addMessage(msg, type)` | Display message directly (instance method) |
| `addErrorMessage(msg)` | Display error message directly |

## Events

| Event | Dispatched By | Detail |
|---|---|---|
| `pardus-trade-space-changed` | `TradeablePage.recalculateSpace()` | `{ shipSpace, magscoopSpace, totalSpace, buildingSpace, hasMagscoop }` |
| `pardus-message` | `Msgframe.sendMessage()` | `{ msg, type }` |

## Development

```bash
npm run lint        # ESLint
npm run lint-fix    # ESLint auto-fix
npm run test        # Run tests
npm run gen-docs    # Generate JSDoc
```

## License

ISC
