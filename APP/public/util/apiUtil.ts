import MDUI from "./mduiHelper";
import AjaxOptions from "mdui.jq/es/interfaces/AjaxOptions";
import { DelayedReturnDataBean } from "../data/DelayedReturnDataBean";

export function getApiURL(): string {
    if (window['apiURL']) {
        return window['apiURL'];
    }
    if (window.location.hostname === "localhost") {
        return "https://powernukkitx.com/api";
    } else {
        return "/api";
    }
}

function processCommonAjaxOptions(options: AjaxOptions): AjaxOptions {
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
    return options;
}

export function apiGetJson<T>(options: AjaxOptions): Promise<T> {
    options = processCommonAjaxOptions(options);
    options.method = "GET";
    return new Promise<T>((resolve, reject) => {
        MDUI.$.ajax(options).then(data => {
            resolve(JSON.parse(data));
        }).catch(reject);
    });
}

export function apiGetRaw<T>(options: AjaxOptions): Promise<T> {
    options = processCommonAjaxOptions(options);
    options.method = "GET";
    return MDUI.$.ajax(options);
}

export function apiPostRaw<T>(options: AjaxOptions): Promise<T> {
    options = processCommonAjaxOptions(options);
    options.method = "POST";
    return MDUI.$.ajax(options);
}

export function apiPostJson<T>(options: AjaxOptions): Promise<T> {
    options = processCommonAjaxOptions(options);
    options.method = "POST";
    return new Promise<T>((resolve, reject) => {
        MDUI.$.ajax(options).then(data => {
            resolve(JSON.parse(data));
        }).catch(reject);
    });
}

export function apiDelayedReturn<T>(options: AjaxOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        apiGetJson<DelayedReturnDataBean>(options).then(data => {
            const uuid = data.uuid;
            // 轮询查询数据
            const interval = setInterval(() => {
                apiGetJson<T>({ url: "/delayed/query/" + uuid }).then(data => {
                    if (data !== undefined) {
                        clearInterval(interval);
                        resolve(data);
                    }
                }).catch(reject);
            }, 500);
        }).catch(reject);
    });
}