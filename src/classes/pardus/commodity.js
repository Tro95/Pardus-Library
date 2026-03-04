export default class Commodity {
    #name;
    #sellElement = null;
    #buyElement = null;
    sellPrice = 0;
    buyPrice = 0;
    shipStock = 0;
    tradeStock = 0;
    bal = 0;
    min = 0;
    max = 0;

    constructor(name) {
        this.#name = name;
    }

    get name() {
        return this.#name;
    }

    set sellElement(element) {
        this.#sellElement = element;
    }

    get buyElement() {
        return this.#buyElement;
    }

    set buyElement(element) {
        this.#buyElement = element;
    }

    sell(quantity) {
        if (this.#sellElement !== null) {
            this.#sellElement.value = quantity;
            this.#sellElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    buy(quantity) {
        if (this.#buyElement !== null) {
            this.#buyElement.value = quantity;
            this.#buyElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    getSelling() {
        if (this.#sellElement !== null && this.#sellElement !== undefined) {
            const parsed = parseInt(this.#sellElement.value, 10);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return 0;
    }

    getBuying() {
        if (this.#buyElement !== null && this.#buyElement !== undefined) {
            const parsed = parseInt(this.#buyElement.value, 10);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return 0;
    }
}
