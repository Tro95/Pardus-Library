import AbstractPage from '../abstract/abstract-page.js';
import { commodities } from '../../data/commodities.js';

export default class DropCargo extends AbstractPage {
    #dropTable;
    #commodities = new Map();

    constructor() {
        super('/drop_cargo.php');
        this.#findTable();
        this.#parseTable();
    }

    get commodities() {
        return this.#commodities;
    }

    #parseInt(data) {
        let toReturn = data.replace(/[,\-t]/g, '');

        if (toReturn.search(/\+/g) !== -1) {
            toReturn = 0;
        }

        return parseInt(toReturn, 10);
    }

    #findTable() {
        const headers = document.getElementsByTagName('TH');

        for (const header of headers) {
            if (header.innerText === 'Resource') {
                this.#dropTable = header.parentNode.parentNode;
                break;
            }
        }
    }

    #parseTable() {
        if (!this.#dropTable) {
            return;
        }

        for (const row of this.#dropTable.rows) {
            if (row.cells[0].tagName === 'TH') {
                continue;
            }

            if (row.cells.length < 2) {
                continue;
            }

            const commodityName = row.cells[1].innerText;

            if (!commodities.includes(commodityName)) {
                continue;
            }

            this.#commodities.set(commodityName, {
                name: commodityName,
                shipStock: this.#parseInt(row.cells[2].innerText),
                dropElement: row.cells[3]?.childNodes[0] ?? null,
                drop(quantity) {
                    if (this.dropElement !== null) {
                        this.dropElement.value = quantity;
                    }
                },
            });
        }
    }
}
