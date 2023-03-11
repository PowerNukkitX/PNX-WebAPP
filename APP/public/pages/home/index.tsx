// @ts-ignore
import home from './style.module.css';
import {translate} from "../../util/language";

// TODO 在主页显示PNX的新闻和其他信息，目前实在是太简陋了
export default function Home() {
    return (
        <>
            <div className="mdui-container">
                <div className="mdui-row mdui-text-center">
                    <h1>PowerNukkitX Hub</h1>
                </div>
                <br/>
                <div className="mdui-row mdui-text-center">
                    <p>{translate("pre-alpha-test")}</p>
                </div>
            </div>
        </>
    );
}
