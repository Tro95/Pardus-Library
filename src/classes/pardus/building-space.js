export default class BuildingSpace {

    #startingBuildingSpace;
    #endingBuildingSpace;

    constructor(startingBuildingSpace) {
        this.#startingBuildingSpace = startingBuildingSpace;
    }

    calculateAvailableBuildingSpace(commodities) {
        this.#calculateBuildingSpace(commodities);
        return this.#endingBuildingSpace;
    }

    getBuildingSpaceString() {
        return `${this.#endingBuildingSpace}t`;
    }

    #calculateBuildingSpace(commodities) {
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

        this.#endingBuildingSpace = this.#startingBuildingSpace + toSell - toBuy;
    }
}
