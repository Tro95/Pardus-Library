import Refreshable from '../abstract/refreshable.js';

export default class OtherShips extends Refreshable {
    constructor() {
        super();
        this.element = document.getElementById('otherships');
        this.content = document.getElementById('otherships_content');
        this.addMutationObserver(this.element);
    }

    mutationCallback(mutationsList, observer) {
        for (const mutationRecord of mutationsList) {
            // We only care about new elements being added, not any _gc_X elements being cleaned up
            if (!('addedNodes' in mutationRecord) || mutationRecord.addedNodes.length === 0) {
                continue;
            }

            // We only care about the otherships_content div being replaced
            for (const addedNode of mutationRecord.addedNodes) {
                if (!('id' in addedNode) || addedNode.id !== 'otherships_content') {
                    continue;
                }

                // console.log(this);
                this.content = addedNode;
                this.refresh();
            }
        }
    }

    isFocusedOnSingleShip() {
        return !!document.getElementById('divDetailsPlayerTop');
    }

    getShips() {
        if (this.isFocusedOnSingleShip()) {
            return null;
        }

        const ships = [];
        const shipsElements = this.content.querySelectorAll('table');

        for (const shipElement of shipsElements) {
            const playerId = shipElement.id.slice(16); // tableScannerShip12345
            const online = !!shipElement.querySelector('img')?.src.endsWith('online.png');
            const [playerNameElement, allianceNameElement] = shipElement.querySelectorAll('a');
            const playerName = playerNameElement.innerText;
            const allianceName = allianceNameElement?.innerText;
            const shipType = this.#extractShipNameFromBackgroundImage(shipElement.querySelector('td').style.backgroundImage);
            const ship = {
                playerId,
                online,
                playerName,
                allianceName,
                shipType,
                shipElement
            };

            ships.push(ship);
        }

        return ships;
    }

    #extractShipNameFromBackgroundImage(backgroundImageStr) {
        // 'url("//static.pardus.at/img/stdhq/ships/harvester_paint04.png")'
        const url = backgroundImageStr.split('"')[1];
        const shipImageWithPaintAndExtension = url.split('/')[url.split('/').length - 1];
        const shipImageWithPaint = shipImageWithPaintAndExtension.slice(0, -4);

        if (shipImageWithPaint.endsWith('_paint01') || shipImageWithPaint.endsWith('_paint02') || shipImageWithPaint.endsWith('_paint03') || shipImageWithPaint.endsWith('_paint04')) {
            return shipImageWithPaint.slice(0, -8);
        }

        if (shipImageWithPaint.endsWith('_xmas')) {
            return shipImageWithPaint.slice(0, -5);
        }

        return shipImageWithPaint;
    }
}
