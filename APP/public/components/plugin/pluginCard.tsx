import RepoDataBean from "../../data/RepoDataBean";
// @ts-ignore
import * as style from "./pluginCard.module.css"
import languageColor from "../../util/languageColor.json";
import {getApiURL} from "../../util/apiUtil";
import {translate} from "../../util/language";
import {time2AgoString} from "../../util/timeUtil";
import {Component, createRef, RefObject} from "preact";
import MDUI from "../../util/mduiHelper";
import {render as reactRender} from "preact/compat";

export function PluginCard(props: { repo: RepoDataBean }) {
    const repo = props.repo;
    return (
        <div className={"mdui-card " + style.card}>
            <div className="mdui-card-header">
                <img className="mdui-card-header-avatar" alt={repo.id}
                     src={`${getApiURL()}/download/${repo.iconDownloadID}`}/>
                <div className="mdui-card-header-title">{repo.name}</div>
                <div className="mdui-card-header-subtitle">{repo.owner}</div>
            </div>
            <div className={`mdui-card-content ${style.cardContent}`}>
                {repo.description ?? translate("this-plugin-has-no-description")}
            </div>
            <div class="mdui-toolbar-vec-spacer"></div>
            <div className="mdui-card-actions mdui-valign">
                <LanguageComponent language={repo.mainLanguage}/>
                <StarComponent star={repo.star}/>
                <TimeComponent time={new Date(repo.lastUpdateAt)}/>
                <div class="mdui-toolbar-spacer"></div>
                <CardMenuComponent id={repo.id}/>
            </div>
        </div>
    )
}

function LanguageComponent(props: { language: string }) {
    return (
        <>
            <span className={style.languageDot} style={{
                backgroundColor: languageColor[props.language]
            }}></span>
            <span className={style.languageLabel}>{props.language}</span>
        </>
    )
}

function StarComponent(props: { star: number }) {
    return (
        <>
            <span className="mdui-valign" mdui-tooltip={`{content: '${translate("star-count")}'}`}>
                <i className={"mdui-icon material-icons " + style.starIcon}>star_border</i>
                <span className={style.starLabel}>{props.star}</span>
            </span>
        </>
    )
}

function TimeComponent(props: { time: Date }) {
    return (
        <>
            <span className="mdui-valign" mdui-tooltip={`{content: '${translate("last-update-at")}'}`}>
                <i className={"mdui-icon material-icons " + style.timeIcon}>access_time</i>
                <span className={style.timeLabel}>{time2AgoString(props.time)}</span>
            </span>
        </>
    )
}

class CardMenuComponent extends Component<{ id: string }> {
    openMenu() {
        window.open("https://github.com/" + this.props.id);
    }

    render() {
        return (
            <>
                <button className={"mdui-btn mdui-btn-icon " + style.codeIcon}
                        onClick={() => this.openMenu()}
                        mdui-tooltip={`{content: '${translate("see-on-gh")}'}`}>
                    <i className="mdui-icon material-icons">code</i>
                </button>
            </>
        );
    }
}