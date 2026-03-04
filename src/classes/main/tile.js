/* global userloc */

export default class Tile {
    #x;
    #y;
    #tileId;
    #virtualTile;
    #highlights = new Set();
    #listenerNonce = new Set();

    static colours = new Map([
        ['Green', {
            red: 0,
            green: 128,
            blue: 0,
            shortCode: 'g',
        }],
        ['Blue', {
            red: 0,
            green: 0,
            blue: 128,
            shortCode: 'b',
        }],
        ['Red', {
            red: 128,
            green: 0,
            blue: 0,
            shortCode: 'r',
        }],
        ['Yellow', {
            red: 128,
            green: 128,
            blue: 0,
            shortCode: 'y',
        }],
        ['Cyan', {
            red: 0,
            green: 128,
            blue: 128,
            shortCode: 'c',
        }],
        ['Magenta', {
            red: 128,
            green: 0,
            blue: 128,
            shortCode: 'm',
        }],
        ['Silver', {
            red: 128,
            green: 128,
            blue: 128,
            shortCode: 's',
        }],
    ]);

    constructor(element, x, y, tileId = null, virtualTile = false) {
        this.#x = x;
        this.#y = y;
        this.emphasised = false;
        this.pathHighlighted = false;
        this.#virtualTile = virtualTile;
        this.type = 'regular';
        this.objectType = '';

        if (this.isVirtualTile()) {
            this.#tileId = tileId.toString();
        } else {
            this.element = element;
            this.backgroundImage = this.element.style.backgroundImage;
            const unhighlightRegex = /^\s*linear-gradient.*?, (url\(.*)$/;

            if (unhighlightRegex.test(this.backgroundImage)) {
                this.backgroundImage = this.backgroundImage.match(unhighlightRegex)[1];
            }

            if (this.element.classList.contains('navNpc')) {
                this.objectType = 'npc';
            }

            if (this.element.classList.contains('navBuilding')) {
                this.objectType = 'building';
            }

            if (this.element.classList.contains('navWormhole')) {
                this.type = 'wormhole';
            }

            if (this.element.classList.contains('navYhole')) {
                this.type = 'y-hole';
            }

            if (this.element.classList.contains('navXhole')) {
                this.type = 'x-hole';
            }

            // Get the tile id
            if (this.element.classList.contains('navShip') && this.element.querySelector('#thisShip')) {
                this.#tileId = this.getUserloc();
            } else if (this.element.children.length > 0 && this.element.querySelector('A')) {
                // In order to support blue stims, we have to use querySelector to handle the extra <div>
                const childElement = this.element.querySelector('A');

                // Can we navigate to the tile?
                if ((!childElement.hasAttribute('onclick') || childElement.getAttribute('onclick').startsWith('warp')) && (!childElement.hasAttribute('_onclick') || childElement.getAttribute('_onclick').startsWith('warp'))) {
                    this.#tileId = this.getUserloc();
                } else if (childElement.hasAttribute('onclick') && childElement.getAttribute('onclick').startsWith('nav')) {
                    this.#tileId = childElement.getAttribute('onclick').match(/^[^\d]*(\d*)[^\d]*$/)[1];
                } else if (childElement.hasAttribute('_onclick') && childElement.getAttribute('_onclick').startsWith('nav')) {
                    // Freeze Frame compatibility
                    this.#tileId = childElement.getAttribute('_onclick').match(/^[^\d]*(\d*)[^\d]*$/)[1];
                } else if (childElement.hasAttribute('_onclick') && childElement.getAttribute('_onclick') === 'null') {
                    this.#tileId = this.getUserloc();
                }
            } else if (this.element.classList.contains('navShip')) {
                // This only happens on retreating
                this.#tileId = this.getUserloc();
            }
        }
    }

    isWormhole() {
        return this.type === 'wormhole';
    }

    isXHole() {
        return this.type === 'x-hole';
    }

    isYHole() {
        return this.type === 'y-hole';
    }

    hasNpc() {
        return this.objectType === 'npc';
    }

    set id(id) {
        this.#tileId = id.toString();
    }

    get id() {
        return this.#tileId;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    getUserloc() {
        if (typeof userloc !== 'undefined') {
            return userloc.toString();
        }
        return '-1';
    }

    toString() {
        return `Tile ${this.#tileId} [${this.x}, ${this.y}]`;
    }

    valueOf() {
        return Number(this.#tileId);
    }

    isVirtualTile() {
        return this.#virtualTile;
    }

    isClickable() {
        if (!this.isVirtualTile() && this.#tileId && parseInt(this.#tileId, 10) > 0) {
            return true;
        }

        return false;
    }

    isNavigatable() {
        if (!this.isVirtualTile() && this.element && this.element.children.length > 0 && this.element.querySelector('A')?.getAttribute('onclick') && this.element.querySelector('A')?.getAttribute('onclick').startsWith('nav') && this.isClickable()) {
            return true;
        }

        if (!this.isVirtualTile() && this.element && this.element.children.length > 0 && this.element.querySelector('A')?.getAttribute('_onclick') && this.element.querySelector('A')?.getAttribute('_onclick').startsWith('nav') && this.isClickable()) {
            return true;
        }

        return false;
    }

    isCentreTile() {
        return this.isCentre;
    }

    isHighlighted() {
        if (this.#highlights.size > 0) {
            return true;
        }

        return false;
    }

    addEventListener(event, func, options = {}) {
        if (Object.prototype.hasOwnProperty.call(options, 'nonce')) {
            if (this.#listenerNonce.has(options.nonce)) {
                return;
            }
        }

        if (this.isNavigatable()) {
            this.element.querySelector('A').addEventListener(event, func, options);

            if (Object.prototype.hasOwnProperty.call(options, 'nonce')) {
                this.#listenerNonce.add(options.nonce);
            }
        }
    }

    addHighlight(highlightColour) {
        this.#highlights.add(highlightColour);
        this.#refreshHighlightStatus();
    }

    addHighlights(highlights = new Set()) {
        highlights.forEach((value) => {
            this.#highlights.add(value);
        });

        this.#refreshHighlightStatus();
    }

    removeHighlight(highlightColour) {
        this.#highlights.delete(highlightColour);
        this.#refreshHighlightStatus();
    }

    isEmphasised() {
        return this.emphasised;
    }

    emphasiseHighlight() {
        this.emphasised = true;
        this.#refreshHighlightStatus();
    }

    removeEmphasis() {
        this.emphasised = false;
        this.#refreshHighlightStatus();
    }

    clearHighlight() {
        this.#clearAllHighlighting();
    }

    #refreshHighlightStatus() {
        if (this.isVirtualTile()) {
            return false;
        }

        if (this.#highlights.size === 0) {
            return this.#clearAllHighlighting();
        }

        const highlightedColourString = this.#getHighlightedColourString();
        const emphasis = this.emphasised ? 0.8 : 0.5;

        // Does this tile have a background image?
        if (this.backgroundImage) {
            this.element.style.backgroundImage = `linear-gradient(to bottom, rgba(${highlightedColourString},${emphasis}), rgba(${highlightedColourString},${emphasis})), ${this.backgroundImage}`;
        } else {
            this.element.style.backgroundColor = `rgba(${highlightedColourString},1)`;
            this.element.firstElementChild.style.opacity = 1 - emphasis;
        }

        return true;
    }

    #clearAllHighlighting() {
        if (this.isVirtualTile()) {
            return false;
        }

        this.#highlights.clear();

        if (this.backgroundImage) {
            this.element.style.backgroundImage = this.backgroundImage;
        } else {
            this.element.style.backgroundColor = '';
            this.element.firstElementChild.style.opacity = 1;
        }

        return true;
    }

    * #yieldHighlightsRGB() {
        for (const colour of this.constructor.colours.values()) {
            if (this.#highlights.has(colour.shortCode)) {
                yield {
                    red: colour.red,
                    green: colour.green,
                    blue: colour.blue,
                };
            }
        }
    }

    #getHighlightedColourString() {
        if (this.isVirtualTile()) {
            return false;
        }

        // This is probably the world's worst colour-mixing algorithm
        let totalRed = 0;
        let totalGreen = 0;
        let totalBlue = 0;

        let numberRed = 0;
        let numberGreen = 0;
        let numberBlue = 0;

        for (const colour of this.#yieldHighlightsRGB()) {
            totalRed += colour.red;
            totalGreen += colour.green;
            totalBlue += colour.blue;

            numberRed += 1;
            numberGreen += 1;
            numberBlue += 1;
        }

        if (numberRed === 0) {
            numberRed = 1;
        }

        if (numberGreen === 0) {
            numberGreen = 1;
        }

        if (numberBlue === 0) {
            numberBlue = 1;
        }

        return `${Math.floor(totalRed / numberRed)},${Math.floor(totalGreen / numberGreen)},${Math.floor(totalBlue / numberBlue)}`;
    }
}
