import AbstractPage from '../abstract/abstract-page';

export default class Logout extends AbstractPage {
    constructor() {
        super('/logout.php');
    }
}
