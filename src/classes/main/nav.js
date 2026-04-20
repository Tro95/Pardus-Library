import Refreshable from '../abstract/refreshable.js';
import Tile from './tile.js';
import Sectors from '../static/sectors.js';

export default class NavArea extends Refreshable {
    #squad;
    #navElement;
    #height;
    #width;
    #grid = [];
    #centreTile;

    constructor(options = {
        squad: false,
    }) {
        super();
        this.#squad = options.squad;
        this.refresh();
    }

    get height() {
        return this.#height;
    }

    get width() {
        return this.#width;
    }

    get grid() {
        return this.#grid;
    }

    get centreTile() {
        return this.#centreTile;
    }

    addTilesHighlights(tilesToHighlight) {
        for (const tile of this.clickableTiles()) {
            if (tilesToHighlight.has(tile.id)) {
                tile.addHighlights(tilesToHighlight.get(tile.id));
            }
        }
    }

    addTilesHighlight(tilesToHighlight) {
        for (const tile of this.clickableTiles()) {
            if (tilesToHighlight.has(tile.id)) {
                tile.addHighlight(tilesToHighlight.get(tile.id));
            }
        }
    }

    addTilesBorder(tilesToBorder) {
        for (const tile of this.clickableTiles()) {
            if (tilesToBorder.has(tile.id)) {
                tile.addBorder(tilesToBorder.get(tile.id));
            }
        }
    }

    removeTilesBorder(tileIds, colour) {
        const idSet = tileIds instanceof Set ? tileIds : new Set(tileIds);

        for (const tile of this.clickableTiles()) {
            if (idSet.has(tile.id)) {
                tile.removeBorder(colour);
            }
        }
    }

    addTilesGlyph(tilesToGlyph) {
        for (const tile of this.clickableTiles()) {
            if (!tilesToGlyph.has(tile.id)) {
                continue;
            }

            const entry = tilesToGlyph.get(tile.id);

            if (typeof entry === 'string') {
                tile.addGlyph(entry);
            } else {
                tile.addGlyph(entry.symbol, entry.position);
            }
        }
    }

    removeTilesGlyph(tileIds, symbol) {
        const idSet = tileIds instanceof Set ? tileIds : new Set(tileIds);

        for (const tile of this.clickableTiles()) {
            if (idSet.has(tile.id)) {
                tile.removeGlyph(symbol);
            }
        }
    }

    clearTilesHighlights() {
        for (const tile of this.clickableTiles()) {
            tile.clearHighlight();
        }
    }

    refreshTilesToHighlight(tilesToHighlight) {
        this.tilesToHighlight = tilesToHighlight;
        this.refresh();
    }

    _reload() {
        this.#navElement = document.getElementById('navareatransition');

        if (!this.#navElement || this.#navElement.style.display === 'none') {
            this.#navElement = document.getElementById('navarea');
        }

        this.#height = this.#navElement.rows.length;
        this.#width = this.#navElement.rows[0].childElementCount;
        this.#grid = [];

        this.tilesMap = new Map();

        let scannedX = 0;
        let scannedY = 0;

        for (const row of this.#navElement.rows) {
            const rowArray = [];

            for (const tileTd of row.children) {
                let tileNumber;

                /* There's probably no reason not to use the squad logic for normal ships, too */
                if (this.#squad) {
                    tileNumber = (scannedY * this.#width) + scannedX;
                } else {
                    tileNumber = parseInt(tileTd.id.match(/[^\d]*(\d*)/)[1], 10);
                }

                const tileX = tileNumber % this.#width;
                const tileY = Math.floor(tileNumber / this.#width);
                const tile = new Tile(tileTd, tileX, tileY);

                rowArray.push(tile);
                this.tilesMap.set(tile.id, tile);

                scannedX++;
            }

            this.#grid.push(rowArray);
            scannedY++;
            scannedX = 0;
        }

        const centreX = Math.floor(this.#width / 2);
        const centreY = Math.floor(this.#height / 2);

        this.#centreTile = this.#grid[centreY][centreX];
        this.#centreTile.isCentre = true;

        /* For squads or other situations where no userloc is available */
        if (!this.#centreTile.id || this.#centreTile.id === '-1') {
            if (this.#grid[centreY - 1][centreX].id !== '-1') {
                const newId = parseInt(this.#grid[centreY - 1][centreX].id, 10) + 1;
                this.#centreTile.id = newId;
            }
        }
    }

    getTileOrVirtual(x, y, reference) {
        if (x >= this.#grid[0].length || x < 0 || y < 0 || y >= this.#grid.length) {
            return Sectors.getSectorForTile(reference.id).getVirtualTile(x, y, reference);
        }

        return this.#grid[y][x];
    }

    * yieldPathBetween(from, to, ignoreNavigatable = false) {
        let currentTile = from;
        yield currentTile;

        while (currentTile.x !== to.x || currentTile.y !== to.y) {
            let directionX = 0;
            let directionY = 0;

            // Which way do we want to move?
            if (currentTile.x > to.x) {
                directionX = -1;
            } else if (currentTile.x < to.x) {
                directionX = 1;
            }

            if (currentTile.y > to.y) {
                directionY = -1;
            } else if (currentTile.y < to.y) {
                directionY = 1;
            }

            if (directionX === 0 && directionY === 0) {
                // We should never end up here, as it implies the two co-ords have the same x and y
                break;
            }

            let candidateTile = this.#grid[currentTile.y + directionY][currentTile.x + directionX];

            // Check to see if it's an unpassable tile, in which case the auto-pilot kicks in
            if (!candidateTile.isNavigatable()) {
                if (candidateTile.isVirtualTile()) {
                    break;
                }

                // If we're still going diagonally, the auto-pilot cannot do anything smart, so try to go in just one direction
                if (directionX !== 0 && directionY !== 0) {
                    candidateTile = this.getTileOrVirtual(currentTile.x, currentTile.y + directionY, currentTile);

                    if (!candidateTile.isNavigatable()) {
                        candidateTile = this.getTileOrVirtual(currentTile.x + directionX, currentTile.y, currentTile);

                        if (!candidateTile.isNavigatable()) {
                            break;
                        }
                    }
                } else if (directionX === 0) {
                    // Vertical auto-pilot will attempt to navigate right, then left
                    candidateTile = this.getTileOrVirtual(currentTile.x + 1, currentTile.y + directionY, currentTile);

                    if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                        candidateTile = this.getTileOrVirtual(currentTile.x - 1, currentTile.y + directionY, currentTile);

                        if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                            break;
                        }
                    }
                } else if (directionY === 0) {
                    // Horizontal auto-pilot will attempt to navigate down, then up
                    candidateTile = this.getTileOrVirtual(currentTile.x + directionX, currentTile.y + 1, currentTile);

                    if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                        candidateTile = this.getTileOrVirtual(currentTile.x + directionX, currentTile.y - 1, currentTile);

                        if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                            break;
                        }
                    }
                }
            }

            currentTile = candidateTile;
            yield currentTile;
        }
    }

    getPathBetween(from, to) {
        return Array.from(this.yieldPathBetween(from, to));
    }

    getPathTo(tile) {
        return this.getPathBetween(this.#centreTile, tile);
    }

    getPathFrom(tile) {
        return this.getPathBetween(tile, this.#centreTile);
    }

    * yieldPathTo(tile) {
        yield* this.yieldPathBetween(this.#centreTile, tile);
    }

    * yieldPathFrom(id, ignoreNavigatable = false) {
        const fromTile = this.getTile(id);
        yield* this.yieldPathBetween(fromTile, this.#centreTile, ignoreNavigatable);
    }

    getTile(id) {
        if (this.tilesMap.has(id)) {
            return this.tilesMap.get(id);
        }

        return null;
    }

    * tiles() {
        for (const row of this.#grid) {
            for (const tile of row) {
                yield tile;
            }
        }
    }

    * clickableTiles() {
        for (const tile of this.tiles()) {
            if (tile.isClickable()) {
                yield tile;
            }
        }
    }

    * navigatableTiles() {
        for (const tile of this.tiles()) {
            if (tile.isNavigatable()) {
                yield tile;
            }
        }
    }

    getTileOnNav(id) {
        for (const tile of this.tiles()) {
            if (tile.id === id) {
                return tile;
            }
        }

        return null;
    }

    nav(id) {
        if (typeof navAjax === 'function') {
            return navAjax(id);  
        }

        if (typeof nav === 'function') {
            return nav(id);  
        }

        throw new Error('No function for nav or navAjax found!');
    }

    warp(id) {
        if (typeof warpAjax === 'function') {
            return warpAjax(id);  
        }

        if (typeof warp === 'function') {
            return warp(id);  
        }

        throw new Error('No function for warp or warpAjax found!');
    }

    xhole(id) {
        const validXHoles = [
            '44580', // Nex-0002
            '47811', // Nex-Kataam
            '55343', // Nex-0003
            '83339', // Nex-0001
            '97698', // Nex-0004
            '324730', // Nex-0005
            '379305', // Nex-0006
        ];

        if (!validXHoles.includes(id)) {
            throw new Error(`Destination ${id} is not a valid X-hole!`);
        }

        const xHoleBoxElement = document.getElementById('xholebox');
        xHoleBoxElement.elements.warpx.value = id;

        if (typeof warpX === 'function') {
            return warpX();  
        }

        return xHoleBoxElement.submit();
    }
}
