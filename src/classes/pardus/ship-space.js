export default class ShipSpace {
    #hasMagscoop;
    #startingShipSpace;
    #startingMagscoopSpace;
    #endingShipSpace;
    #endingMagscoopSpace;
    #magscoopSize = 150;

    get hasMagscoop() {
        return this.#hasMagscoop;
    }

    constructor(startingShipSpace, startingMagscoopSpace, hasMagscoop = false, magscoopSize = 150) {
        this.#startingShipSpace = startingShipSpace;
        this.#startingMagscoopSpace = startingMagscoopSpace;
        this.#endingShipSpace = startingShipSpace;
        this.#endingMagscoopSpace = startingMagscoopSpace;
        this.#hasMagscoop = hasMagscoop;
        this.#magscoopSize = magscoopSize;
    }

    calculateAvailableShipSpace(commodities) {
        this.#calculateShipSpace(commodities);
        return this.#endingShipSpace;
    }

    calculateAvailableMagscoopSpace(commodities) {
        this.#calculateShipSpace(commodities);
        return this.#endingMagscoopSpace;
    }

    calculateAvailableTotalSpace(commodities) {
        this.#calculateShipSpace(commodities);
        return this.#endingShipSpace + this.#endingMagscoopSpace;
    }

    getShipSpaceString() {
        if (this.#hasMagscoop) {
            return `${this.#endingShipSpace} + ${this.#endingMagscoopSpace}t`;
        }
        return `${this.#endingShipSpace}t`;
    }

    #calculateShipSpace(commodities) {
        let toSell = 0;
        let toBuy = 0;

        for (const [commodityName, commodity] of commodities) {
            if (commodity.shipStock > 0) {
                toSell += commodity.getSelling();
            }
            if (commodity.tradeStock > commodity.min) {
                toBuy += commodity.getBuying();
            }
        }

        this.#endingShipSpace = this.#startingShipSpace;

        if (this.#hasMagscoop) {
            if (this.#endingShipSpace > 0) {
                this.#endingMagscoopSpace = this.#startingMagscoopSpace;
                this.#endingShipSpace = this.#endingShipSpace + toSell - toBuy;
                if (this.#endingShipSpace < 0) {
                    this.#endingMagscoopSpace += this.#endingShipSpace;
                    this.#endingShipSpace = 0;
                }
            } else {
                this.#endingMagscoopSpace = this.#startingMagscoopSpace + toSell - toBuy;
                if (this.#endingMagscoopSpace > this.#magscoopSize) {
                    this.#endingShipSpace += this.#endingMagscoopSpace - this.#magscoopSize;
                    this.#endingMagscoopSpace = this.#magscoopSize;
                }
            }
        } else {
            this.#endingShipSpace = this.#endingShipSpace + toSell - toBuy;
        }
    }

    allowedSpace(magscoopAllowed) {
        if (this.#hasMagscoop && magscoopAllowed) {
            return Number(this.#endingShipSpace) + Number(this.#endingMagscoopSpace);
        }
        return Number(this.#endingShipSpace);
    }
}
