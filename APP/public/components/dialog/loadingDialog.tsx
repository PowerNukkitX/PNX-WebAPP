// TODO 实现加载对话框并实现其API，在合适的地方使用它

import { render } from "preact/compat";
// @ts-ignore
import * as style from "./loadingDialog.module.css";
import mdui from "mdui";
import { translate } from "../../util/language";

let tmpElement: HTMLDivElement | null = null;

export default function loadingDialog(promise?: Promise<any> | null | undefined, content?: string) {
    const id = "slideChooseDialog-" + Math.random().toString(36).substring(2);
    const fragment = <div className="mdui-dialog mdui-dialog-open" id={id}>
        <div className={style.loadingBox}>
            <span className={"mdui-spinner " + style.loadingSpin}></span>
            <span>{translate("loading-sth", content ?? "")}</span>
        </div>
        <div className={style.loadingBox} style={{
            display: "none"
        }}>
            <i className={"mdui-icon material-icons " + style.loadingFailedIcon}>&#xe001;</i>
            <span>{translate("loading-failed")}</span>
        </div>
    </div>
    if (tmpElement === null) {
        tmpElement = document.createElement("div");
    } else {
        while (tmpElement.firstChild) {
            tmpElement.removeChild(tmpElement.firstChild);
        }
    }
    document.body.append(tmpElement);
    render(fragment, tmpElement);
    mdui.mutation("#" + id);
    const dialog = new mdui.Dialog("#" + id, {
        history: false
    });
    dialog.open();
    if (promise) {
        promise.then(() => {
            dialog.close();
        }).catch(() => {
            (document.getElementById(id).children[0] as HTMLDivElement).style.display = "none";
            (document.getElementById(id).children[1] as HTMLDivElement).style.display = "flex";
        });
    }
}