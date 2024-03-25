(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  PardusLibrary: () => (/* reexport */ PardusLibrary)
});

;// CONCATENATED MODULE: ./src/classes/abstract/abstract-page.js
class AbstractPage {
    #page;

    constructor(pageName = '') {
        if (pageName === '') {
            throw "Page is not defined for class";
        }

        this.#page = pageName;
    }

    toString() {
        return this.#page;
    }

    navigateTo() {
        document.location.assign(`${document.location.origin}${this.#page}`);
    }

    isActive() {
        return document.location.pathname === this.#page;
    }
}

;// CONCATENATED MODULE: ./src/classes/main/tile.js
class Tile {
    #x;
    #y;
    #tile_id;
    #virtual_tile;

    static colours = {
        'Green': {
            'red': 0,
            'green': 128,
            'blue': 0,
            'short_code': 'g'
        },
        'Blue': {
            'red': 0,
            'green': 0,
            'blue': 128,
            'short_code': 'b',
        },
        'Red': {
            'red': 128,
            'green': 0,
            'blue': 0,
            'short_code': 'r'
        },
        'Yellow': {
            'red': 128,
            'green': 128,
            'blue': 0,
            'short_code': 'y'
        },
        'Cyan': {
            'red': 0,
            'green': 128,
            'blue': 128,
            'short_code': 'c'
        },
        'Magenta': {
            'red': 128,
            'green': 0,
            'blue': 128,
            'short_code': 'm'
        },
        'Silver': {
            'red': 128,
            'green': 128,
            'blue': 128,
            'short_code': 's'
        }
    };

    constructor(element, x, y, tile_id = null, virtual_tile = false) {
        this.#x = x;
        this.#y = y;
        this.highlight_string = '';
        this.highlights = [];
        this.emphasised = false;
        this.path_highlighted = false;
        this.#virtual_tile = virtual_tile;
        this.type = 'regular';
        this.objectType = '';

        if (this.isVirtualTile()) {
            this.#tile_id = tile_id.toString();
        } else {
            this.element = element;
            this.background_image = this.element.style.backgroundImage;
            const unhighlight_regex = /^\s*linear-gradient.*?, (url\(.*)$/;

            if (unhighlight_regex.test(this.background_image)) {
                this.background_image = this.background_image.match(unhighlight_regex)[1];
            }

            if (this.element.classList.contains('navNpc')) {
                this.objectType = 'npc';
            }

            if (this.element.classList.contains('navBuilding')) {
                this.objectType = 'building';
            }

            // Get the tile id
            if (this.element.classList.contains('navShip') && this.element.querySelector('#thisShip')) {
                this.#tile_id = this.getUserloc();
            } else if (this.element.children.length > 0 && this.element.children[0].tagName === 'A') {

                const child_element = this.element.children[0];

                // Can we navigate to the tile?
                if ((!child_element.hasAttribute('onclick') || child_element.getAttribute('onclick').startsWith('warp')) && (!child_element.hasAttribute('_onclick') || child_element.getAttribute('_onclick').startsWith('warp'))) {
                    this.#tile_id = this.getUserloc();

                    if ((child_element.hasAttribute('onclick') && child_element.getAttribute('onclick').startsWith('warp')) || (child_element.hasAttribute('_onclick') && child_element.getAttribute('_onclick').startsWith('warp'))) {
                        this.type = 'wormhole';
                    }
                } else if (child_element.hasAttribute('onclick') && child_element.getAttribute('onclick').startsWith('nav')) {
                    this.#tile_id = child_element.getAttribute('onclick').match(/^[^\d]*(\d*)[^\d]*$/)[1];

                    if (this.element.classList.contains('navYhole')) {
                        this.type = 'y-hole';
                    }

                    if (this.element.classList.contains('navXhole')) {
                        this.type = 'x-hole';
                    }
                } else if (child_element.hasAttribute('_onclick') && child_element.getAttribute('_onclick').startsWith('nav')) {
                    // Freeze Frame compatibility
                    this.#tile_id = child_element.getAttribute('_onclick').match(/^[^\d]*(\d*)[^\d]*$/)[1];
                } else if (child_element.hasAttribute('_onclick') && child_element.getAttribute('_onclick') === "null") {
                    this.#tile_id = this.getUserloc();
                }
            } else if (this.element.classList.contains('navShip')) {
                // This only happens on retreating
                this.#tile_id = this.getUserloc();
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
        this.#tile_id = id.toString();
    }

    get id() {
        return this.#tile_id;
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
        } else {
            return '-1';
        }
    }

    toString() {
        return `Tile ${this.#tile_id} [${this.x}, ${this.y}]`;
    }

    getHumanString() {
        return get_sector_coords(this.id);
    }

    valueOf() {
        return Number(this.#tile_id);
    }

    isVirtualTile() {
        return this.#virtual_tile;
    }

    isClickable() {
        if (!this.isVirtualTile() && this.#tile_id && parseInt(this.#tile_id) > 0) {
            return true;
        }

        return false;
    }

    isNavigatable() {
        if (!this.isVirtualTile() && this.element && this.element.children.length > 0 && this.element.children[0].getAttribute('onclick') && this.element.children[0].getAttribute('onclick').startsWith('nav') && this.isClickable()) {
            return true;
        }

        if (!this.isVirtualTile() && this.element && this.element.children.length > 0 && this.element.children[0].getAttribute('_onclick') && this.element.children[0].getAttribute('_onclick').startsWith('nav') && this.isClickable()) {
            return true;
        }

        return false;
    }

    isCentreTile() {
        return this.is_centre_tile;
    }

    isHighlighted() {
        if (this.highlights.length > 0) {
            return true;
        }

        return false;
    }

    addEventListener(event, func) {
        if (this.isNavigatable()) {
            this.element.children[0].addEventListener(event, func);
        }
    }

    highlight(highlight_colour = 'g') {
        if (this.isVirtualTile()) {
            return false;
        }

        for (const colour in this.constructor.colours) {
            if (this.constructor.colours[colour].short_code === highlight_colour) {
                this.highlights.push({
                    red: this.constructor.colours[colour].red,
                    green: this.constructor.colours[colour].green,
                    blue: this.constructor.colours[colour].blue
                });
                break;
            }
        }

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

    removeHighlight(highlight_colour = 'g') {
        if (this.isVirtualTile()) {
            return false;
        }

        const colour_to_remove = {
            red: 0,
            green: 0,
            blue: 0
        }

        for (const colour in this.constructor.colours) {
            if (this.constructor.colours[colour].short_code === highlight_colour) {
                colour_to_remove.red = this.constructor.colours[colour].red;
                colour_to_remove.green = this.constructor.colours[colour].green;
                colour_to_remove.blue = this.constructor.colours[colour].blue;
                break;
            }
        }

        for (const index in this.highlights) {
            if (this.highlights[index].red === colour_to_remove.red && this.highlights[index].green === colour_to_remove.green && this.highlights[index].blue === colour_to_remove.blue) {
                this.highlights.splice(index, 1);
            }
        }

        this.#refreshHighlightStatus();
    }

    #refreshHighlightStatus() {
        if (this.isVirtualTile()) {
            return false;
        }

        if (this.highlights.length === 0) {
            return this.#clearAllHighlighting();
        }

        const highlighted_colour_string = this.#getHighlightedColourString();
        const emphasis = this.emphasised ? 0.8 : 0.5;

        // Does this tile have a background image?
        if (this.background_image) {
            this.element.style.backgroundImage = `linear-gradient(to bottom, rgba(${highlighted_colour_string},${emphasis}), rgba(${highlighted_colour_string},${emphasis})), ` + this.background_image;
        } else {
            this.element.style.backgroundColor = `rgba(${highlighted_colour_string},1)`;
            this.element.firstElementChild.style.opacity = 1 - emphasis;
        }
    }

    #clearAllHighlighting() {
        if (this.isVirtualTile()) {
            return false;
        }

        if (this.background_image) {
            this.element.style.backgroundImage = this.background_image;
        } else {
            this.element.style.backgroundColor = ''
            this.element.firstElementChild.style.opacity = 1;
        }

        return true;
    }

    #getHighlightedColourString() {
        if (this.isVirtualTile()) {
            return false;
        }

        // This is probably the world's worst colour-mixing algorithm
        let total_red = 0;
        let total_green = 0;
        let total_blue = 0;

        let number_red = 0;
        let number_green = 0;
        let number_blue = 0;

        for (const colour of this.highlights) {
            total_red += colour.red;
            total_green += colour.green;
            total_blue += colour.blue;

            if (colour.red > 0) {
                number_red += 1;
            }

            if (colour.green > 0) {
                number_green += 1;
            }

            if (colour.blue > 0) {
                number_blue += 1;
            }
        }

        if (number_red === 0) {
            number_red = 1;
        }

        if (number_green === 0) {
            number_green = 1;
        }

        if (number_blue === 0) {
            number_blue = 1;
        }

        return `${Math.floor(total_red / number_red)},${Math.floor(total_green / number_green)},${Math.floor(total_blue / number_blue)}`;
    }
}

;// CONCATENATED MODULE: ./src/classes/main/nav.js


class NavArea {

    #squad = false;
    #navElement;
    #height;
    #width;
    #grid = [];
    #centreTile;

    constructor(options = {
        squad: false
    }) {
        this.#squad = options.squad;
        this.reload();
    }

    get height() {
        return this.#height;
    }

    get width() {
        return this.#width;
    }

    get grid() {
        return this.#grid;
    }

    get centreTile() {
        return this.#centreTile;
    }

    reload(clear = false) {
        this.#navElement = document.getElementById('navareatransition');

        if (!this.#navElement || this.#navElement.style.display === "none") {
            this.#navElement = document.getElementById('navarea');
        }

        this.#height = this.#navElement.rows.length;
        this.#width = this.#navElement.rows[0].childElementCount;
        this.#grid = [];

        this.tiles_map = new Map();

        let scanned_x = 0;
        let scanned_y = 0;

        for (const row of this.#navElement.rows) {
            const row_arr = [];

            for (const tile_td of row.children) {

                let tile_number;

                /* There's probably no reason not to use the squad logic for normal ships, too */
                if (this.#squad) {
                    tile_number = (scanned_y * this.#width) + scanned_x;
                } else {
                    tile_number = parseInt(tile_td.id.match(/[^\d]*(\d*)/)[1]);
                }

                const tile_x = tile_number % this.#width;
                const tile_y = Math.floor(tile_number / this.#width);

                const tile = new Tile(tile_td, tile_x, tile_y);

                row_arr.push(tile);
                this.tiles_map.set(tile.id, tile);

                scanned_x++;
            }

            this.#grid.push(row_arr);
            scanned_y++;
            scanned_x = 0;
        }

        const centre_x = Math.floor(this.#width / 2);
        const centre_y = Math.floor(this.#height / 2);

        this.#centreTile = this.#grid[centre_y][centre_x];
        this.#centreTile.is_centre_tile = true;

        /* For squads or other situations where no userloc is available */
        if (!this.#centreTile.id || this.#centreTile.id === '-1') {
            if (this.#grid[centre_y - 1][centre_x].id !== '-1') {
                const newId = parseInt(this.#grid[centre_y - 1][centre_x].id) + 1;
                this.#centreTile.id = newId;
            }
        }
    }

    getTileOrVirtual(x, y, reference) {
        if (x >= this.#grid[0].length || x < 0 || y < 0 || y >= this.#grid.length) {
            const sector_obj = get_sector_coords_obj(reference.id);
            return new Tile(null, x, y, Number(reference.id) + (x - reference.x) + ((y - reference.y) * sector_obj.cols), true);
        }

        return this.#grid[y][x];
    }

    * yieldPathBetween(from, to, ignore_navigatable = false) {
        let current_tile = from;
        yield current_tile;

        while (current_tile.x != to.x || current_tile.y != to.y) {

            let direction_x = 0;
            let direction_y = 0;

            // Which way do we want to move?
            if (current_tile.x > to.x) {
                direction_x = -1;
            } else if (current_tile.x < to.x) {
                direction_x = 1;
            }

            if (current_tile.y > to.y) {
                direction_y = -1;
            } else if (current_tile.y < to.y) {
                direction_y = 1;
            }

            if (direction_x == 0 && direction_y == 0) {
                break;
            }

            let candidate_tile = this.#grid[current_tile.y + direction_y][current_tile.x + direction_x];

            // Check to see if it's an unpassable tile, in which case the auto-pilot kicks in
            if (!candidate_tile.isNavigatable()) {

                if (candidate_tile.isVirtualTile()) {
                    break;
                }

                // If we're still going diagonally, the auto-pilot cannot do anything smart, so try to go in just one direction
                if (direction_x != 0 && direction_y != 0) {

                    candidate_tile = this.getTileOrVirtual(current_tile.x, current_tile.y + direction_y, current_tile);

                    if (!candidate_tile.isNavigatable()) {

                        candidate_tile = this.getTileOrVirtual(current_tile.x + direction_x, current_tile.y, current_tile);

                        if (!candidate_tile.isNavigatable()) {
                            break;
                        }
                    }
                } else if (direction_x == 0) {
                    // Vertical auto-pilot will attempt to navigate right, then left

                    candidate_tile = this.getTileOrVirtual(current_tile.x + 1, current_tile.y + direction_y, current_tile);

                    if (!candidate_tile.isNavigatable() && !candidate_tile.isVirtualTile()) {

                        candidate_tile = this.getTileOrVirtual(current_tile.x - 1, current_tile.y + direction_y, current_tile);

                        if (!candidate_tile.isNavigatable() && !candidate_tile.isVirtualTile()) {
                            break;
                        }
                    }
                } else if (direction_y == 0) {
                    // Horizontal auto-pilot will attempt to navigate down, then up

                    candidate_tile = this.getTileOrVirtual(current_tile.x + direction_x, current_tile.y + 1, current_tile);

                    if (!candidate_tile.isNavigatable() && !candidate_tile.isVirtualTile()) {

                        candidate_tile = this.getTileOrVirtual(current_tile.x + direction_x, current_tile.y - 1, current_tile);

                        if (!candidate_tile.isNavigatable() && !candidate_tile.isVirtualTile()) {
                            break;
                        }
                    }
                }
            }

            current_tile = candidate_tile;
            yield current_tile;
        }

    }

    getPathBetween(from, to) {
        return Array.from(this.yieldPathBetween(from, to));
    }

    getPathTo(tile) {
        return this.getPathBetween(this.#centreTile, tile);
    }

    getPathFrom(tile) {
        return this.getPathBetween(tile, this.#centreTile);
    }

    * yieldPathTo(tile) {
        yield* this.yieldPathBetween(this.#centreTile, tile);
    }

    * yieldPathFrom(id, ignore_navigatable = false) {
        const from_tile = this.getTile(id);
        yield* this.yieldPathBetween(from_tile, this.#centreTile, ignore_navigatable);
    }

    refreshTilesToHighlight(tiles_to_highlight) {
        this.tiles_to_highlight = tiles_to_highlight;
        this.reload(true);
    }

    getTile(id) {
        if (this.tiles_map.has(id)) {
            return this.tiles_map.get(id);
        }

        return null;
    }

    * tiles() {
        for (const row of this.#grid) {
            for (const tile of row) {
                yield tile;
            }
        }
    }

    * clickableTiles() {
        for (const tile of this.tiles()) {
            if (tile.isClickable()) {
                yield tile;
            }
        }
    }

    * navigatableTiles() {
        for (const tile of this.tiles()) {
            if (tile.isNavigatable()) {
                yield tile;
            }
        }
    }

    getTileOnNav(id) {
        for (const tile of this.tiles()) {
            if (tile.id === id) {
                return tile;
            }
        }

        return null;
    }

    nav(id) {
        if (typeof navAjax === 'function') {
            return navAjax(id);
        }

        if (typeof nav === 'function') {
            return nav(id);
        }

        throw new Error('No function for nav or navAjax found!');
    }

    warp(id) {
        if (typeof warpAjax === 'function') {
            return warpAjax(id);
        }

        if (typeof warp === 'function') {
            return warp(id);
        }

        throw new Error('No function for warp or warpAjax found!');
    }

    xhole(id) {
        const validXHoles = [
            '44580', // Nex-0002
            '47811', // Nex-Kataam
            '55343', // Nex-0003
            '83339', // Nex-0001
            '97698', // Nex-0004
            '324730', // Nex-0005
            '379305', // Nex-0006
        ];

        if (!validXHoles.includes(id)) {
            throw new Error(`Destination ${id} is not a valid X-hole!`);
        }

        document.getElementById('xholebox').elements.warpx.value = id;

        if (typeof warpX === 'function') {
            return warpX();
        }

        return document.getElementById("xholebox").submit();
    }
}

;// CONCATENATED MODULE: ./src/classes/pages/main.js



class Main extends AbstractPage {
    #navArea;

    constructor() {
        super('/main.php');

        this.#navArea = new NavArea();

        this.#handlePartialRefresh(() => {
            this.#navArea.reload();
        });
    }

    get nav() {
        return this.#navArea;
    }

    #handlePartialRefresh(func) {
        const mainElement = document.getElementById('tdSpaceChart');
        const navElement = mainElement ? document.getElementById('tdSpaceChart').getElementsByTagName('table')[0] : document.querySelectorAll('table td[valign="top"]')[1];

        // This would be more specific, but it doesn't trigger enough refreshes
        //const navElement = document.getElementById('nav').parentNode;

        // Options for the observer (which mutations to observe)
        const config = {
            attributes: false,
            childList: true, 
            subtree: true
        };

        // Callback function to execute when mutations are observed
        const callback = function(mutationsList, observer) {
            func();
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(navElement, config);
    }
}

;// CONCATENATED MODULE: ./src/classes/pages/logout.js


class Logout extends AbstractPage {
    constructor() {
        super('/logout.php');
    }
}

;// CONCATENATED MODULE: ./src/classes/pages/index.js


;// CONCATENATED MODULE: ./src/classes/pardus-library.js


class PardusLibrary {

    #currentPage;

    constructor() {
        switch (document.location.pathname) {
            case '/main.php':
                this.#currentPage = new Main();
                break;
            case '/logout.php':
                this.#currentPage = new Logout();
                break;
        }
    }

    get page() {
        return document.location.pathname;
    }

    get currentPage() {
        return this.#currentPage;
    }

    get main() {
        if (this.page === '/main.php') {
            return this.#currentPage;
        }

        return null;
    }

    static getImagePackUrl() {
        const defaultImagePackUrl = '//static.pardus.at/img/std/';
        const imagePackUrl = String(document.querySelector('body').style.backgroundImage).replace(/url\("*|"*\)|[a-z0-9]+\.gif/g, '');

        return imagePackUrl !== '' ? imagePackUrl : defaultImagePackUrl;
    }

    /**
     *  Returns the active universe
     *  @returns {string} One of 'orion', 'artemis', or 'pegasus'
     *  @throws Will throw an error if no universe could be determined.
     */
    static getUniverse() {
        switch (document.location.hostname) {
            case 'orion.pardus.at':
                return 'orion';
            case 'artemis.pardus.at':
                return 'artemis';
            case 'pegasus.pardus.at':
                return 'pegasus';
            default:
                throw new Error('Unable to determine universe');
        }
    }
}
;// CONCATENATED MODULE: ./src/index.js



/******/ 	return __webpack_exports__;
/******/ })()
;
});