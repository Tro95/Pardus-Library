import AbstractPage from '../abstract/abstract-page.js';
import PardusLibrary from '../pardus-library.js';

export default class Msgframe extends AbstractPage {
    #centreTd;

    constructor() {
        super('/msgframe.php');
        this.#centreTd = document.querySelector('td[align="center"]');

        if (window.parent) {
            window.parent.window.addEventListener('pardus-message', (event) => {
                this.addMessage(event.detail.msg, event.detail.type);
            });
        }
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

    static sendMessage(msg, type) {
        const messageDetail = {
            detail: {
                msg,
                type,
            },
        };
        const pardusMessageEvent = new CustomEvent('pardus-message', messageDetail);

        const target = window.parent ? window.parent.window : window;
        target.dispatchEvent(pardusMessageEvent);
    }
}
