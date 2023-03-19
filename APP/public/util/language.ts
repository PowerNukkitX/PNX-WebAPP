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

const translators: Translators[] = [
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

export function translate(key: string, ...args: string[]): string {
    key = key.trim();
    for (const translator of translators) {
        if (translator.match(key)) {
            key = translator.translate(key);
        }
    }
    if (languageId === "zh-cn") {
        let tmp = getLanguageMap("zh-cn")[key];
        tmp = trimMultiLineString(tmp ?? key);
        if (args.length > 0) {
            for (let i = 0; i < args.length; i++) {
                tmp = tmp.replace("{" + i + "}", args[i]);
            }
        }
        return tmp;
    }
    let tmp = getLanguageMap("en-us")[key];
    tmp = trimMultiLineString(tmp ?? key);
    if (args.length > 0) {
        for (let i = 0; i < args.length; i++) {
            tmp = tmp.replace("{" + i + "}", args[i]);
        }
    }
    return tmp;
}