import {translate} from "../../util/language";
import {render} from "preact/compat";
import mdui from "mdui";
// @ts-ignore
import * as style from './sliderChooseDialog.module.css';

let tmpElement: HTMLDivElement | null = null;

export default function slideChooseDialog(title: string, current: number, min: number, max: number, step: number): Promise<number> {
    const id = "slideChooseDialog-" + Math.random().toString(36).substring(2);
    const fragment = <div className="mdui-dialog mdui-dialog-open" id={id}>
        <div className="mdui-dialog-title">{title}</div>
        <div className={style.sliderDialogContent}>
            <label className="mdui-slider mdui-slider-discrete">
                <input type="range" step={step} min={min} max={max} value={current}/>
            </label>
        </div>
        <div className="mdui-dialog-actions">
            <button className="mdui-btn mdui-ripple" mdui-dialog-close="">{translate("close")}</button>
            <button className="mdui-btn mdui-ripple" mdui-dialog-confirm="">{translate("ok")}</button>
        </div>
    </div>
    if (tmpElement === null) {
        tmpElement = document.createElement("div");
    }
    document.body.append(tmpElement);
    render(fragment, tmpElement);
    mdui.mutation("#" + id);
    return new Promise<number>((resolve, reject) => {
        const dialog = new mdui.Dialog("#" + id);
        dialog.$element.on("confirm.mdui.dialog", () => {
            const value = parseInt(dialog.$element.find("input").val() as string);
            dialog.close();
            if (resolve) resolve(value);
        });
        dialog.$element.on("close.mdui.dialog", () => {
            if (reject) reject();
        });
        dialog.$element.on("cancel.mdui.dialog", () => {
            if (reject) reject();
        });
        dialog.open();
    })
}