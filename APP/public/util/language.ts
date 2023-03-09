// @ts-ignore
import zhCN from "./zh-cn.json5";
// @ts-ignore
import enUS from "./en-us.json5";
import {trimMultiLineString} from "./stringUtil";

let languageId = (window.localStorage.getItem("userLanguage") || navigator.language).toLowerCase();

function getLanguageMap(languageId: string): { [key: string]: string } {
    if (languageId === "zh-cn") {
        return zhCN;
    } else {
        return enUS;
    }
}

interface Translators {
    match(key: string): boolean;
    translate(key: string): string;
}

const translators = [
    {
        match: (key: string) => key.startsWith("route:/hub/plugin/detail/"),
        translate: (key: string) => {
            const tmp = key.substring("route:/hub/plugin/detail/".length);
            if (window.innerWidth < 600) {
                return  tmp.substring(tmp.indexOf("/") + 1)
            }
            return tmp;
        }
    }
];

export function translate(key: string): string {
    key = key.trim();
    for (const translator of translators) {
        if (translator.match(key)) {
            key = translator.translate(key);
        }
    }
    if (languageId === "zh-cn") {
        const tmp = getLanguageMap("zh-cn")[key];
        return trimMultiLineString(tmp ?? key);
    }
    const tmp = getLanguageMap("en-us")[key];
    return trimMultiLineString(tmp ?? key);
}