import { WebContainer } from "@webcontainer/api";

let instance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export function getWebContainer() {
    if (instance) return Promise.resolve(instance);

    if (!bootPromise) {
        bootPromise = WebContainer.boot().then((wc) => {
            instance = wc;
            return wc;
        });
    }

    return bootPromise;
}
