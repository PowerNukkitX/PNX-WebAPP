import MDUI from "./mduiHelper";
import AjaxOptions from "mdui.jq/es/interfaces/AjaxOptions";

export function getApiURL(): string {
    if (window.location.hostname === "localhost") {
        return "https://powernukkitx.com/api";
    } else {
        return "/api";
    }
}

export function apiGetJson<T>(options: AjaxOptions): Promise<T> {
    if (options.async === undefined) {
        options.async = true;
    }
    if (options.cache === undefined) {
        options.cache = false;
    }
    const apiURL = getApiURL();
    if (!options.url.startsWith(apiURL)) {
        options.url = apiURL + options.url;
    }
    options.method = "GET";
    return new Promise<T>((resolve, reject) => {
        MDUI.$.ajax(options).then(data => {
            resolve(JSON.parse(data));
        }).catch(reject);
    });
}