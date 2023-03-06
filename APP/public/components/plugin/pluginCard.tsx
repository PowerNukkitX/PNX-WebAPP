import RepoDataBean from "../../data/RepoDataBean";
// @ts-ignore
import * as style from "./pluginCard.module.css"
import languageColor from "../../util/languageColor.json";
import {getApiURL} from "../../util/apiUtil";
import {translate} from "../../util/language";

export function PluginCard(props: { repo: RepoDataBean }) {
    const repo = props.repo;
    return (
        <div className="mdui-card">
            <div className="mdui-card-header">
                <img className="mdui-card-header-avatar" alt={repo.id}
                     src={`${getApiURL()}/download/${repo.iconDownloadID}`}/>
                <div className="mdui-card-header-title">{repo.name}</div>
                <div className="mdui-card-header-subtitle">by {repo.owner}</div>
            </div>
            <div className={`mdui-card-content ${style.cardContent}`}>
                {repo.description ?? translate("this-plugin-has-no-description")}
            </div>
            <div className="mdui-card-actions mdui-valign">
                <LanguageComponent language={repo.mainLanguage}/>
                <StarComponent star={repo.star}/>
                <div class="mdui-toolbar-spacer"></div>
                <button className="mdui-btn mdui-btn-icon">
                    <i className="mdui-icon material-icons">expand_more</i>
                </button>
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
            <i className={"mdui-icon material-icons mdui-icon-dark " + style.starIcon}>star_border</i>
            <span className={style.starLabel}>{props.star}</span>
        </>
    )
}