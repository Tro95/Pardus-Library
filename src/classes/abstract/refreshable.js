export default class Refreshable {
    #afterRefreshHooks = [];
    #beforeRefreshHooks = [];

    refresh() {
        this.#beforeRefresh();
        this._reload();
        this.#afterRefresh();
    }

    /**
     * Override in subclasses to re-parse DOM on refresh.
     */
    _reload() { }

    /**
     * Add a hook to run after the element is refreshed
     * @param {function} func Function to call after the element is refreshed
     */
    addAfterRefreshHook(func) {
        this.#afterRefreshHooks.push(func);
    }

    /**
     * Add a hook to run before the element is refreshed
     * @param {function} func Function to call before the element is refreshed
     */
    addBeforeRefreshHook(func) {
        this.#beforeRefreshHooks.push(func);
    }

    addMutationObserver(mutationTarget = null, mutationConfiguration = {
        attributes: false,
        childList: true,
        subtree: true,
    }) {
        if (!mutationTarget) {
            throw new Error('No mutationTarget provided!');
        }

        const observer = new MutationObserver((mutationsList, obs) => {
            this.mutationCallback(mutationsList, obs);
        });

        observer.observe(mutationTarget, mutationConfiguration);
    }

    /**
     * Override in subclasses to handle mutations.
     */
    mutationCallback(mutationsList, observer) {
        throw new Error('Unhandled mutationCallback');
    }

    /**
     * Run all hooks that should be called prior to refreshing the element
     */
    #beforeRefresh() {
        for (const func of this.#beforeRefreshHooks) {
            func();
        }
    }

    /**
     * Run all hooks that should be called after refreshing the element
     */
    #afterRefresh() {
        for (const func of this.#afterRefreshHooks) {
            func();
        }
    }
}
