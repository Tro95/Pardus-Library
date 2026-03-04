import TradeablePage from '../abstract/tradeable-page.js';

export default class PlanetTrade extends TradeablePage {
    #planetType;

    constructor() {
        super('/planet_trade.php');
        this.#identifyPlanet();
    }

    get type() {
        return this.#planetType;
    }

    #identifyPlanet() {
        const planetImage = document.getElementsByTagName('img')[3].src.split('/');
        const imageString = planetImage[planetImage.length - 1];

        switch (imageString) {
            case 'planet_i.png':
                this.#planetType = 'i';
                break;
            case 'planet_r.png':
                this.#planetType = 'r';
                break;
            case 'planet_m.png':
                this.#planetType = 'm';
                break;
            case 'planet_a.png':
                this.#planetType = 'a';
                break;
            case 'planet_d.png':
                this.#planetType = 'd';
                break;
            case 'planet_g.png':
                this.#planetType = 'g';
                break;
            default:
                this.#planetType = 'm';
        }
    }
}
