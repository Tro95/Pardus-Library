export default class Sector {

    #id_start = 0;
    #columns = 0;
    #rows = 0;

    constructor(name, start, columns, rows) {
        this.name = name;
        this.#id_start = start;
        this.#columns = columns;
        this.#rows = rows;
    }

    contains(tile_id) {
        if (tile_id >= this.#id_start && tile_id < this.#id_start + (this.#columns * this.#rows)) {
            return true;
        }

        return false;
    }

    getTile(tile_id) {
        if (!this.contains(tile_id)) {
            return null;
        }

        return {
            'sector': this.name,
            'x': Math.floor((tile_id - this.#id_start) / this.#rows),
            'y': (tile_id - this.#id_start) % this.#rows,
            'tile_id': tile_id,
            'rows': this.#rows,
            'colums': this.#columns
        }
    }
}
