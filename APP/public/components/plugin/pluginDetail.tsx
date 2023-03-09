import {Component, RenderableProps} from "preact";
import RepoDataBean from "../../data/RepoDataBean";
import MDUI from "../../util/mduiHelper";
import {translate} from "../../util/language";
import {apiGetJson, apiPostRaw} from "../../util/apiUtil";
import {ReadmeDataBean} from "../../data/ReadmeDataBean";
import {LanguageComponent, StarComponent, TimeComponent} from "./pluginCard";
// @ts-ignore
import * as style from "./pluginDetail.module.css";

interface Props {
    path: string
}

interface State {
    repoData: RepoDataBean | null | undefined
    renderedReadme: string | null | undefined
    lastUpdateTime: Date | null | undefined
}

export default class PluginDetail extends Component<Props, State> {
    get pluginID(): string {
        const path = this.props.path;
        if (path.endsWith("/")) {
            return path.substring(0, path.length - 1);
        }
        return path.substring(8);
    }

    componentDidMount() {
        this.updateInfo(false).catch(e => {
            console.error(e);
            MDUI.snackbar({
                message: translate("error-get-data"),
                buttonText: translate("ok")
            })
        });
    }

    async updateInfo(force: boolean) {
        if (!this.state) return;
        const now = new Date();
        if (this.state.lastUpdateTime && now.getTime() - this.state.lastUpdateTime.getTime() < 1000) {
            MDUI.snackbar({
                message: translate("update-too-frequent"),
                buttonText: translate("ok")
            });
            return;
        }
        try {
            if (!this.state.repoData || force) {
                const repoData = await apiGetJson<RepoDataBean>({
                    url: "/plugin/get/" + this.pluginID
                });
                this.setState({
                    repoData: repoData
                })
            }
            if (!this.state.renderedReadme || force) {
                const readmeData = await apiGetJson<ReadmeDataBean>({
                    url: "/git/readme/" + this.pluginID
                });
                if ("Markdown" === readmeData.format) {
                    this.setState({
                        renderedReadme: await apiPostRaw<string>({
                            url: "/git/markdown/" + this.pluginID,
                            contentType: "text/plain",
                            data: readmeData.content
                        })
                    })
                }
            }
        } catch (e) {
            console.error(e);
            MDUI.snackbar({
                message: translate("error-get-data"),
                buttonText: translate("ok")
            })
        }
    }

    render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined) {
        return (
            <div className={style.detailContainer}>
                <div className="mdui-container mdui-typo">
                    <br/>
                    <div className="mdui-row">
                        <button className="mdui-btn mdui-ripple icon-span-btn" onClick={() => history.back()}>
                            <i className="mdui-icon material-icons">&#xe5c4;</i>
                            <span>{translate("back")}</span>
                        </button>
                        <button className="mdui-btn mdui-ripple" onClick={() => {
                            this.updateInfo(true).catch(e => {
                                console.error(e);
                                MDUI.snackbar({
                                    message: translate("error-get-data"),
                                    buttonText: translate("ok")
                                })
                            });
                        }}>
                            {/*Refresh*/}
                            <i className="mdui-icon material-icons">&#xe5d5;</i>
                            <span>{translate("refresh")}</span>
                        </button>
                    </div>
                    <br/>
                    <div className="mdui-row">
                        <div className="mdui-typo-display-1">
                            {state?.repoData?.name ?? translate("loading")}
                        </div>
                    </div>
                    <div className={"mdui-row mdui-valign " + style.noLeftPaddingValign}>
                        <LanguageComponent language={state?.repoData?.mainLanguage ?? translate("loading")}/>
                        <StarComponent star={state?.repoData?.star ?? translate("loading")}/>
                        <TimeComponent time={state?.repoData?.lastUpdateAt ?? translate("loading")}/>
                        <AuthorComponent author={state?.repoData?.owner ?? translate("loading")}/>
                    </div>
                    <hr/>
                    <div className="mdui-row">
                        <div className="mdui-typo" dangerouslySetInnerHTML={{
                            __html: state?.renderedReadme ?? translate("loading")
                        }}></div>
                    </div>
                </div>
                <br/>
            </div>
        );
    }
}

export function AuthorComponent(props: { author: string }) {
    return (
        <span className="mdui-valign" mdui-tooltip={`{content: '${translate("author")}'}`}>
            <i translate="no" className={"mdui-icon material-icons " + style.authorIcon}>&#xe7fb;</i>
            <span className={style.authorLabel}>{props.author}</span>
        </span>
    )
}