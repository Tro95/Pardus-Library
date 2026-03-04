import AbstractPage from '../abstract/abstract-page.js';

export default class ShipTransfer extends AbstractPage {
    #form;
    #resourcesTable;
    #resources = new Map();

    constructor() {
        super('/ship2ship_transfer.php');
        this.#form = document.getElementById('ship2ship_transfer');
        this.#resourcesTable = document.querySelector('form table.messagestyle');
        this.#parseResources();
    }

    get form() {
        return this.#form;
    }

    get resourcesTable() {
        return this.#resourcesTable;
    }

    get resources() {
        return this.#resources;
    }

    get playerId() {
        return document.querySelector('input[name="playerid"]').value;
    }

    get freeSpace() {
        const freeSpaceElements = document.getElementsByTagName('b');
        return freeSpaceElements.length === 1 ? parseInt(freeSpaceElements[0].textContent, 10) : 0;
    }

    submit() {
        if (this.#form) {
            this.#form.submit();
        }
    }

    getRedirectUrl() {
        const currentUrl = new URL(window.location);
        return `${currentUrl.protocol}//${currentUrl.hostname}${currentUrl.pathname}?playerid=${this.playerId}`;
    }

    #parseResources() {
        if (!this.#resourcesTable) {
            return;
        }

        for (const row of this.#resourcesTable.rows) {
            if (row.cells.length < 4) {
                continue;
            }

            const resourceName = row.cells[1].textContent;
            const amount = parseInt(row.cells[2].textContent, 10);
            const inputElement = row.cells[3].childNodes[0] ?? null;

            if (Number.isNaN(amount)) {
                continue;
            }

            this.#resources.set(resourceName, {
                name: resourceName,
                amount,
                inputElement,
                row,
                transfer(quantity) {
                    if (this.inputElement !== null) {
                        this.inputElement.value = quantity;
                    }
                },
            });
        }
    }
}
