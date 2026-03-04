import TradeablePage from '../abstract/tradeable-page.js';

export default class Blackmarket extends TradeablePage {
    constructor() {
        super('/blackmarket.php', {
            buyOverrides: {
                buyPrice: 3,
                buyElement: 4,
                synthetic: {
                    tradeStock: 999,
                    bal: 0,
                    min: 0,
                    max: 1999,
                },
                shortageCheck: true,
            },
            syntheticBuildingSpace: 999,
        });
    }
}
