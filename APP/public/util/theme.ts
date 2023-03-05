import {translate} from "./language";
import MDUI from "./mduiHelper";

export function switchTheme(noNotice: boolean): void {
    const clazz = document.body.classList;
    if (clazz.contains("mdui-theme-layout-dark")) {
        clazz.remove("mdui-theme-layout-dark", "mdui-theme-primary-light-blue", "mdui-theme-accent-light-blue");
        clazz.add("mdui-theme-primary-indigo", "mdui-theme-accent-indigo");
        if (!noNotice) {
            MDUI.snackbar(translate("switch-to-day"), {
                buttonText: translate("ok")
            });
        }
        window.localStorage.setItem("dark-theme", "false");
    } else {
        clazz.remove("mdui-theme-primary-indigo", "mdui-theme-accent-indigo");
        clazz.add("mdui-theme-layout-dark", "mdui-theme-primary-light-blue", "mdui-theme-accent-light-blue");
        if (!noNotice) {
            MDUI.snackbar(translate("switch-to-night"), {
                buttonText: translate("ok")
            })
        }
        window.localStorage.setItem("dark-theme", "true");
    }
}

export function initDefaultTheme(): void {
    const flag = window.localStorage.getItem("dark-theme");
    if (flag && flag === "true") {
        switchTheme(true);
    }
}