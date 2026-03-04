import Tile from '../main/tile.js';

export default class Sector {
    #idStart = 0;
    #columns = 0;
    #rows = 0;

    constructor(name, start, columns, rows) {
        this.name = name;
        this.#idStart = start;
        this.#columns = columns;
        this.#rows = rows;
    }

    contains(tileId) {
        if (tileId >= this.#idStart && tileId < this.#idStart + (this.#columns * this.#rows)) {
            return true;
        }

        return false;
    }

    getTile(tileId) {
        if (!this.contains(tileId)) {
            return null;
        }

        return {
            sector: this.name,
            x: Math.floor((tileId - this.#idStart) / this.#rows),
            y: (tileId - this.#idStart) % this.#rows,
            tileId,
            rows: this.#rows,
            colums: this.#columns,
        };
    }

    getVirtualTile(x, y, reference) {
        return new Tile(null, x, y, Number(reference.id) + (x - reference.x) + ((y - reference.y) * this.#columns), true);
    }

    getTileHumanString(tileId) {
        const sectorObj = this.getTile(tileId);

        return `${sectorObj.sector} [${sectorObj.x}, ${sectorObj.y}]`;
    }

    getTileByCoords(x, y) {
        if (Number(x) < 0 || Number(y) < 0 || Number(x) >= this.#columns || Number(y) >= this.#rows) {
            return -1;
        }

        return Number(this.#idStart) + Number(x) * Number(this.#rows) + Number(y);
    }
}
