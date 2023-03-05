import zhCN from "./zh-cn.json";
import enUS from "./en-us.json";

let languageId = (window.localStorage.getItem("userLanguage") || navigator.language).toLowerCase();

function getLanguageMap(languageId: string): { [key: string]: string } {
    if (languageId === "zh-cn") {
        return zhCN;
    } else {
        return enUS;
    }
}

export function translate(key: string): string {
    key = key.trim();
    if (languageId === "zh-cn") {
        const tmp = getLanguageMap("zh-cn")[key];
        return tmp ? tmp : key;
    }
    const tmp = getLanguageMap("en-us")[key];
    return tmp ? tmp : key;
}