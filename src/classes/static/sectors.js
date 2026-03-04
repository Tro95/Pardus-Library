import Sector from '../pardus/sector.js';
import { sectors } from '../../data/sectors.js';

const Sectors = new Map();

for (const sector of Object.keys(sectors)) {
    Sectors.set(sector, new Sector(sector, sectors[sector].start, sectors[sector].cols, sectors[sector].rows));
}

Sectors.getSectorForTile = function(tileId) {
    for (const sector of this.getSectors()) {
        if (sector.contains(tileId)) {
            return sector;
        }
    }

    throw new Error(`No sector found for tile id ${tileId}`);
};

Sectors.getSectorAndCoordsForTile = function(tileId) {
    return this.getSectorForTile(tileId).getTileHumanString(tileId);
};

Sectors.getTileIdFromSectorAndCoords = function(sector, x, y) {
    let actualSector = sector;

    if (actualSector.endsWith('NE')) {
        actualSector = actualSector.substring(0, actualSector.length - 3);
    }

    if (actualSector.endsWith('East') || actualSector.endsWith('West')) {
        actualSector = actualSector.substring(0, actualSector.length - 5);
    }

    if (actualSector.endsWith('North') || actualSector.endsWith('South') || actualSector.endsWith('Inner')) {
        actualSector = actualSector.substring(0, actualSector.length - 6);
    }

    if (!this.has(actualSector)) {
        throw new Error(`No data for sector '${actualSector}'!`);
    }

    return this.get(actualSector).getTileByCoords(x, y);
};

Sectors.getSectors = function * () {
    for (const sector of this) {
        yield sector[1];
    }
};

export default Sectors;
