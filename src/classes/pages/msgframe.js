import AbstractPage from '../abstract/abstract-page.js';
import PardusLibrary from '../pardus-library.js';

/**
 * Cross-script protocol. Any userscript may dispatch this event at the message bus to display a
 * message, and any script may listen for it. The event name and the shape of `detail` are a
 * contract with already-published versions of other scripts, so neither may change.
 */
const MESSAGE_EVENT = 'pardus-message';

/**
 * Where the live message listeners are recorded, as `{ generation, handlers }`. Held on the bus
 * so it survives msgframe reloads, and shared by every script on the page, so this property name
 * and the record's shape are also a fixed contract between scripts.
 */
const RECEIVERS_PROPERTY = 'pardusMessageReceivers';

/**
 * The window that carries messages between scripts.
 *
 * Pardus runs as a frameset, so main.php and msgframe.php are siblings that cannot reach each
 * other. The frameset window is their nearest common ancestor and outlives every frame within
 * it, which makes it the one place a sender and a receiver in different frames can both reach.
 *
 * @returns {Window} The frameset window, or this window if we are not framed.
 */
function getMessageBus() {
    if (window.parent && window.parent !== window) {
        return window.parent.window;
    }

    return window;
}

/**
 * A marker identifying the msgframe document this script is running in.
 *
 * Every script on the page shares the document's elements, so they all derive the same marker,
 * and a new msgframe load always produces a different one. `documentElement` is used in
 * preference to `document` itself because a userscript manager may hand each script its own
 * wrapper around `document`, whereas DOM nodes are shared as-is.
 *
 * @returns {Element} The current document's root element.
 */
function getGeneration() {
    return document.documentElement;
}

export default class Msgframe extends AbstractPage {
    #centreTd;

    constructor() {
        super('/msgframe.php');
        this.#centreTd = document.querySelector('td[align="center"]');

        this.#listenForMessages();
    }

    /**
     * Attach this document's message listener to the bus, discarding the listeners left there by
     * the previous msgframe load.
     *
     * The bus outlives the msgframe document, so listeners registered during an earlier load are
     * still attached to it, each holding its Msgframe instance and, through that instance's
     * centreTd, the whole discarded document. Left alone that repeats on every msgframe reload,
     * which is a steady memory climb over a long session.
     *
     * Every handler in the record was registered by a script running in the document the record
     * names. If that is not the document we are running in, that document has gone, so every
     * handler in the list is dead whichever script registered it, and the whole list can be
     * swept. A record naming the current document is never swept, so a live listener can never
     * be removed. That is what lets scripts share this record without needing to identify
     * themselves to one another.
     */
    #listenForMessages() {
        const bus = getMessageBus();
        const generation = getGeneration();
        let record = bus[RECEIVERS_PROPERTY];

        if (!record || record.generation.deref() !== generation) {
            if (record) {
                record.handlers.forEach((staleHandler) => bus.removeEventListener(MESSAGE_EVENT, staleHandler));
            }

            // A weak reference so that a document which has already been discarded is not held
            // alive by this record until the next msgframe load sweeps it.
            record = {
                generation: new WeakRef(generation),
                handlers: [],
            };

            bus[RECEIVERS_PROPERTY] = record;
        }

        const handler = (event) => {
            this.addMessage(event.detail.msg, event.detail.type);
        };

        record.handlers.push(handler);
        bus.addEventListener(MESSAGE_EVENT, handler);
    }

    hasMessage() {
        if (this.#centreTd.querySelector('table')) {
            return true;
        }

        return false;
    }

    addMessage(msg, type) {
        let icon = 'gnome-info';
        let colour = '#CCCCCC';

        switch (type) {
            case 'error':
                icon = 'gnome-error';
                colour = '#FF3300';
                break;
            default:
                icon = 'gnome-info';
                colour = '#CCCCCC';
        }

        this.#setMessage(msg, icon, colour);
    }

    #setMessage(msg, icon, colour) {
        const str = `<table style="background-image:url(${PardusLibrary.getImagePackUrl()}bgmedium.gif);border-style:ridge;border-color:#2b2b51;border-width:2px;" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td><img src="${PardusLibrary.getImagePackUrl()}${icon}.png" alt="" width="32" height="32"></td><td style="padding-left:2px;padding-right:4px;"><font style="font-weight:bold;font-size:13px;" color="${colour}"> ${msg}</font></td></tr></tbody></table>`;
        this.#centreTd.innerHTML = str;
    }

    addErrorMessage(msg) {
        this.addMessage(msg, 'error');
    }

    /**
     *  Display a message in the message frame.
     *
     *  Safe to call from any page: the event is dispatched at the frameset window, where the
     *  msgframe's listener picks it up.
     *
     *  @param {string} msg The message to display
     *  @param {string} [type] Either 'error' or 'info'; anything else is treated as 'info'
     *  @returns {boolean} False if the event was cancelled, true otherwise
     */
    static sendMessage(msg, type) {
        return getMessageBus().dispatchEvent(new CustomEvent(MESSAGE_EVENT, {
            detail: {
                msg,
                type,
            },
        }));
    }
}
