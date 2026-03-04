import AbstractPage from './abstract-page.js';
import Commodity from '../pardus/commodity.js';
import { commodities } from '../../data/commodities.js';
import ShipSpace from '../pardus/ship-space.js';
import BuildingSpace from '../pardus/building-space.js';

export default class TradeablePage extends AbstractPage {
    #buyTable;
    #sellTable;
    #transferButton;
    #isPlayerOwned = false;
    #commodities = new Map();
    #shipSpace = null;
    #buildingSpace = null;
    #shipSpaceElement = null;
    #buildingSpaceElement = null;
    #spaceRecalcPending = false;
    #parseOptions;

    constructor(pageName = '', options = {}) {
        super(pageName);
        this.#parseOptions = options;

        this.#findTables();
        this.#parseTables();
        this.#findTransferButton();
        this.#wireSpaceListeners();
    }

    #parseInt(data) {
        let toReturn = data.replace(/[,\-t]/g, '');

        if (toReturn.search(/\+/g) !== -1) {
            toReturn = 0;
        }

        return parseInt(toReturn, 10);
    }

    #decodeString(data) {
        let toReturn = data.replace(/&nbsp;/g, ' ');
        toReturn = toReturn.replace(/\xA0/g, ' ');

        return toReturn;
    }

    #findTransferButton() {
        const inputs = document.getElementsByTagName('input');

        for (const input of inputs) {
            if (input.value.trim() === '<- Transfer ->') {
                this.#transferButton = input;
            }
        }

        if (!this.#transferButton) {
            this.#transferButton = document.querySelector('input[type="submit"][value*="Transfer"]');
        }
    }

    #findTables() {
        const tablesWithHeaders = document.getElementsByTagName('TH');

        for (const tableToSearch of tablesWithHeaders) {
            if (!this.#sellTable && this.#decodeString(tableToSearch.innerText) === 'Price (sell)') {
                this.#sellTable = tableToSearch.parentNode.parentNode;
            } else if (!this.#buyTable && this.#decodeString(tableToSearch.innerText) === 'Price (buy)') {
                this.#buyTable = tableToSearch.parentNode.parentNode;
            }

            if (tableToSearch.innerText === 'Min') {
                this.#isPlayerOwned = true;
            }
        }
    }

    get commodities() {
        return this.#commodities;
    }

    get shipSpace() {
        return this.#shipSpace;
    }

    get availableShipSpace() {
        return this.#shipSpace.calculateAvailableShipSpace(this.#commodities);
    }

    get availableTotalSpace() {
        return this.#shipSpace.calculateAvailableTotalSpace(this.#commodities);
    }

    get availableMagscoopSpace() {
        return this.#shipSpace.calculateAvailableMagscoopSpace(this.#commodities);
    }

    allowedSpace(magscoopAllowed) {
        if (magscoopAllowed && this.#shipSpace?.hasMagscoop) {
            return this.availableTotalSpace;
        }
        return this.availableShipSpace;
    }

    get availableBuildingSpace() {
        if (this.#buildingSpace === null) {
            return null;
        }
        return this.#buildingSpace.calculateAvailableBuildingSpace(this.#commodities);
    }

    get transferButton() {
        return this.#transferButton;
    }

    get isPlayerOwned() {
        return this.#isPlayerOwned;
    }

    transfer() {
        if (this.#transferButton) {
            this.#transferButton.click();
        }
    }

    recalculateSpace() {
        if (this.#spaceRecalcPending) {
            return;
        }
        this.#spaceRecalcPending = true;
        setTimeout(() => {
            this.#spaceRecalcPending = false;
            this.#doRecalculateSpace();
        }, 0);
    }

    #doRecalculateSpace() {
        const shipSpace = this.availableShipSpace;
        const magscoopSpace = this.#shipSpace?.hasMagscoop
            ? this.availableMagscoopSpace : 0;
        const totalSpace = this.#shipSpace?.hasMagscoop
            ? this.availableTotalSpace : shipSpace;
        const buildingSpace = this.availableBuildingSpace;
        const hasMagscoop = this.#shipSpace?.hasMagscoop ?? false;

        if (this.#shipSpaceElement) {
            this.#shipSpaceElement.textContent = this.#shipSpace.getShipSpaceString();
        }
        if (this.#buildingSpaceElement && this.#buildingSpace) {
            this.#buildingSpaceElement.textContent = this.#buildingSpace.getBuildingSpaceString();
        }

        document.dispatchEvent(new CustomEvent('pardus-trade-space-changed', {
            detail: {
                shipSpace, magscoopSpace, totalSpace, buildingSpace, hasMagscoop,
            },
        }));
    }

    #wireSpaceListeners() {
        const handler = () => this.recalculateSpace();

        if (this.#sellTable) {
            this.#sellTable.addEventListener('keyup', handler, true);
            this.#sellTable.addEventListener('click', handler, true);
            this.#sellTable.addEventListener('input', handler, true);
        }
        if (this.#buyTable) {
            this.#buyTable.addEventListener('keyup', handler, true);
            this.#buyTable.addEventListener('click', handler, true);
            this.#buyTable.addEventListener('input', handler, true);
        }
    }

    #parseBuyCommodity(commodity, row) {
        const overrides = this.#parseOptions.buyOverrides;

        if (overrides) {
            commodity.buyPrice = this.#parseInt(row.cells[overrides.buyPrice].innerText);
            commodity.buyElement = row.cells[overrides.buyElement]?.childNodes[0] ?? null;

            if (overrides.synthetic) {
                commodity.tradeStock = overrides.synthetic.tradeStock;
                commodity.bal = overrides.synthetic.bal;
                commodity.min = overrides.synthetic.min;
                commodity.max = overrides.synthetic.max;
            }

            if (overrides.shortageCheck && commodity.buyElement == null) {
                commodity.tradeStock = 0;
            }
        } else if (this.#isPlayerOwned) {
            commodity.tradeStock = this.#parseInt(row.cells[2].innerText);
            commodity.min = this.#parseInt(row.cells[4].innerText);
            commodity.max = this.#parseInt(row.cells[5].innerText);
            commodity.buyPrice = this.#parseInt(row.cells[6].innerText);
            commodity.buyElement = row.cells[7]?.childNodes[0] ?? null;
        } else {
            commodity.tradeStock = this.#parseInt(row.cells[2].innerText);
            commodity.bal = this.#parseInt(row.cells[3].innerText);
            commodity.min = commodity.bal;
            commodity.max = this.#parseInt(row.cells[4].innerText);
            commodity.buyPrice = this.#parseInt(row.cells[5].innerText);
            commodity.buyElement = row.cells[6]?.childNodes[0] ?? null;
        }
    }

    #parseTable(table, type) {
        for (const row of table.rows) {
            // Skip header row
            if (row.cells[0].tagName === 'TH') {
                continue;
            }

            // Skip break rows
            if (row.cells.length < 2) {
                continue;
            }

            // Free space row
            if (this.#decodeString(row.cells[0].innerText) === 'free space:') {
                switch (type) {
                    case 'sell':
                        this.#shipSpaceElement = row.cells[1];
                        const shipSpaceLocation = row.cells[1];
                        let hasMagscoop = false;
                        let startingShipSpace = 0;
                        let startingMagscoopSpace = 0;
                        let magscoopSize = 150;

                        // Do they have a magscoop?
                        if (shipSpaceLocation.innerText.indexOf('+') !== -1) {

                            const tmpFreeSpace = shipSpaceLocation.innerText.split('+');
                            hasMagscoop = true;

                            startingShipSpace = this.#parseInt(tmpFreeSpace[0]);
                            startingMagscoopSpace = this.#parseInt(tmpFreeSpace[1]);

                            if (startingMagscoopSpace > 150) {
                                magscoopSize = 250;
                            } else if (startingShipSpace > 0) {
                                magscoopSize = 150;
                            }

                        } else {
                            startingShipSpace = this.#parseInt(shipSpaceLocation.innerText);
                        }

                        if (!this.#shipSpace) {
                            this.#shipSpace = new ShipSpace(startingShipSpace, startingMagscoopSpace, hasMagscoop, magscoopSize);
                        }
                        break;
                    case 'buy':
                        this.#buildingSpaceElement = row.cells[1];
                        const buildingSpaceLocation = row.cells[1];
                        const startingBuildingSpace = this.#parseInt(buildingSpaceLocation.innerText);

                        if (!this.#buildingSpace) {
                            this.#buildingSpace = new BuildingSpace(startingBuildingSpace);
                        }

                        break;
                }

            }

            const commodityName = row.cells[1].innerText;

            // Skip non-commodity row
            if (!commodities.includes(commodityName)) {
                continue;
            }

            let commodity = this.#commodities.get(commodityName);

            if (!commodity) {
                commodity = new Commodity(commodityName);
            }

            switch (type) {
                case 'sell':
                    commodity.shipStock = this.#parseInt(row.cells[2].innerText);
                    commodity.sellPrice = this.#parseInt(row.cells[3].innerText);
                    commodity.sellElement = row.cells[4]?.childNodes[0] ?? null;
                    break;
                case 'buy':
                    this.#parseBuyCommodity(commodity, row);
                    break;
            }

            this.#commodities.set(commodityName, commodity);
        }
    }

    #parseTables() {
        if (this.#sellTable) {
            this.#parseTable(this.#sellTable, 'sell');
        }
        if (this.#buyTable) {
            this.#parseTable(this.#buyTable, 'buy');
        }

        if (this.#parseOptions.syntheticBuildingSpace !== undefined && this.#buildingSpace === null) {
            this.#buildingSpace = new BuildingSpace(this.#parseOptions.syntheticBuildingSpace);
        }
    }
}
