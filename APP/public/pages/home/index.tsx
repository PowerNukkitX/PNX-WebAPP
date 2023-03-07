// @ts-ignore
import home from './style.module.css';
import {translate} from "../../util/language";

export default function Home() {
    return (
        <>
            <div className="mdui-container">
                <div className="mdui-row mdui-text-center">
                    <h1>PowerNukkitX Hub</h1>
                </div>
                <div className="mdui-row mdui-text-center">
                    <p>{translate("pre-alpha-test")}</p>
                </div>
            </div>
        </>
    );
}
