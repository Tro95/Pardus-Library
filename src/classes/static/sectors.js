import Sector from '../pardus/sector.js';
import { sectorMapDataObj } from '../../data/sectors.js';

export const sectors = new Map();

for (const sector of Object.keys(sectorMapDataObj)) {
    sectors.add(sector, new Sector(sector, sectorMapDataObj[sector].start, sectorMapDataObj[sector].cols, sectorMapDataObj[sector].rows));
}

export function getSectorForTile(tile_id) {
    for (const sector of sectors) {
        if (sector.has(tile_id)) {
            return sector.get(tile_id);
        }
    }
}
