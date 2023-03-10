// noinspection HtmlUnknownAnchorTarget

import {Component, createRef, RefObject, RenderableProps} from "preact";
import RepoDataBean from "../../data/RepoDataBean";
import MDUI from "../../util/mduiHelper";
import {translate} from "../../util/language";
import {apiGetJson, apiPostRaw} from "../../util/apiUtil";
import {ReadmeDataBean} from "../../data/ReadmeDataBean";
import {LanguageComponent, StarComponent, TimeComponent} from "./pluginCard";
// @ts-ignore
import * as style from "./pluginDetail.module.css";
import ReleaseDataBean from "../../data/ReleaseDataBean";
import {time2AgoString} from "../../util/timeUtil";
import {useState} from "preact/compat";
import {sizeToString} from "../../util/stringUtil";

interface Props {
    path: string
}

interface State {
    repoData: RepoDataBean | null | undefined
    renderedReadme: string | null | undefined
    lastUpdateTime: Date | null | undefined
    releases: Array<ReleaseDataBean>
    displayAllReleases: boolean
}

export default class PluginDetail extends Component<Props, State> {
    private readonly ref: RefObject<HTMLDivElement> = createRef();

    constructor() {
        super();
        this.setState({
            repoData: null,
            renderedReadme: null,
            lastUpdateTime: null,
            releases: [],
            displayAllReleases: false
        })
    }

    get pluginID(): string {
        const path = this.props.path;
        if (path.endsWith("/")) {
            return path.substring(0, path.length - 1);
        }
        return path.substring(8);
    }

    componentDidMount() {
        this.updateInfo(false, false).catch(e => {
            console.error(e);
            MDUI.snackbar({
                message: translate("error-get-data"),
                buttonText: translate("ok")
            })
        });
        MDUI.mutation("#" + this.ref.current.id);
    }

    async updateInfo(force: boolean, displayAllReleases: boolean) {
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
                } else {
                    this.setState({
                        renderedReadme: translate("this-plugin-has-no-description")
                    })
                }
            }
            if (displayAllReleases || this.state.displayAllReleases) {
                console.log("display all releases");
                if (!this.state.releases || this.state.releases.length <= 1 || force) {
                    const releaseData = await apiGetJson<Array<ReleaseDataBean>>({
                        url: "/git/all-releases/" + this.pluginID
                    });
                    this.setState({
                        releases: releaseData
                    })
                }
            } else {
                if (!this.state.releases || this.state.releases.length === 0 || force) {
                    const releaseData = await apiGetJson<ReleaseDataBean>({
                        url: "/git/latest-release/" + this.pluginID
                    });
                    this.setState({
                        releases: [releaseData]
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
        console.log("parent render")
        return (
            <div className={style.detailContainer} ref={this.ref} id={Math.random().toString(36).substring(2)}>
                <div className="mdui-container mdui-typo">
                    <br/>
                    <div className="mdui-row">
                        <button className="mdui-btn mdui-ripple icon-span-btn" onClick={() => history.back()}>
                            <i className="mdui-icon material-icons">&#xe5c4;</i>
                            <span>{translate("back")}</span>
                        </button>
                        <button className="mdui-btn mdui-ripple" onClick={() => {
                            this.updateInfo(true, this.state.displayAllReleases).catch(e => {
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
                    <hr/>
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
                    <div className="mdui-row">
                        <div className="mdui-tab" mdui-tab>
                            <a href="#tab-introduction" className="mdui-ripple">{translate("introduction")}</a>
                            <a href="#release-content" className="mdui-ripple">{translate("download")}</a>
                        </div>
                    </div>
                    <div className="mdui-row" id="tab-introduction">
                        <div className="mdui-typo" dangerouslySetInnerHTML={{
                            __html: state?.renderedReadme ?? translate("loading")
                        }}></div>
                    </div>
                    <div id="release-content" className="mdui-row mdui-typo">
                        <br/>
                        <div className="mdui-typo-title-opacity">{translate("release")}</div>
                        <ReleaseComponent pluginID={this.pluginID} releaseDataBeans={state?.releases}
                                          loadAllCallback={() => {
                                              this.setState({
                                                  displayAllReleases: true
                                              });
                                              this.updateInfo(false, true)
                                          }}/>
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
            <i translate="no" className={"mdui-icon material-icons " + style.componentIcon}>&#xe7fb;</i>
            <span className={style.componentLabel}>{props.author}</span>
        </span>
    )
}

export function FileSizeComponent(props: { size: number }) {
    return (
        <span className="mdui-valign" mdui-tooltip={`{content: '${translate("file-size")}'}`}>
            <i translate="no" className={"mdui-icon material-icons " + style.componentIcon}>&#xe24d;</i>
            <span className={style.componentLabel}>{sizeToString(props.size)}</span>
        </span>
    )
}

function copyJsonObj<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function ReleaseComponent(props: { pluginID: string, releaseDataBeans: Array<ReleaseDataBean>, loadAllCallback?: () => void | undefined }) {
    const [state, updater] = useState({});
    console.log("render", props)
    for (const releaseDataBean of props.releaseDataBeans) {
        if (releaseDataBean && releaseDataBean.body && !state['renderedReadme_' + releaseDataBean.tagName]) {
            apiPostRaw<string>({
                url: "/git/markdown/" + props.pluginID,
                contentType: "text/plain",
                data: releaseDataBean.body
            }).then(value => {
                const tmp = copyJsonObj(state);
                tmp['renderedReadme_' + releaseDataBean.tagName] = value;
                updater(tmp);
            }).catch(() => {
                const tmp = copyJsonObj(state);
                tmp['renderedReadme_' + releaseDataBean.tagName] = translate("error-get-data");
                updater(tmp);
            })
        }
    }
    return (
        <>
            <div className="mdui-panel" mdui-panel id="latest-release-panel">
                {props.releaseDataBeans.map((releaseDataBean, index) => {
                    if (!releaseDataBean || !releaseDataBean.name) return <></>
                    return (
                        <div className={"mdui-panel-item " + (index === 0 ? "mdui-panel-item-open" : "")}>
                            <div className="mdui-panel-item-header">
                                <div className="mdui-panel-item-title">{releaseDataBean.name}</div>
                                <div
                                    className="mdui-panel-item-summary">{time2AgoString(releaseDataBean.publishedAt)}</div>
                                <i className="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
                            </div>
                            <div className="mdui-panel-item-body">
                                <div className="mdui-typo" dangerouslySetInnerHTML={{
                                    __html: state['renderedReadme_' + releaseDataBean.tagName] ?? ""
                                }}></div>
                                <hr style={{
                                    display: releaseDataBean.body ? "block" : "none"
                                }}/>
                                <ul className={"mdui-list " + style.downloadList} style={{
                                    paddingLeft: "0"
                                }}>
                                    {releaseDataBean.artifacts.map((artifact) => {
                                        if (!artifact.name) return <></>
                                        return (
                                            <li className="mdui-list-item mdui-ripple">
                                                <div className="mdui-list-item-content mdui-valign">
                                                    <span className={style.fileName}>{artifact.name}</span>
                                                    <TimeComponent time={artifact.createAt}/>
                                                    <FileSizeComponent size={artifact.sizeInBytes}/>
                                                </div>
                                                <i className="mdui-list-item-icon mdui-icon material-icons">&#xe2c4;</i>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    )
                })}
                {
                    (() => {
                        if (props.releaseDataBeans.filter(value => value?.name).length !== 0) {
                            return (<>
                                <div className="mdui-text-center">
                                    <a onClick={(e) => {
                                        props?.loadAllCallback();
                                        (e.target as HTMLAnchorElement).style.display = "none";
                                    }} className={style.centerActionLink}>{translate("load-all-releases")}</a>
                                </div>
                            </>)
                        }
                        return <></>
                    })()
                }
            </div>
            <div className="mdui-typo">
                {
                    (() => {
                        if ((props.releaseDataBeans.length === 1 && props.releaseDataBeans[0]
                            && !props.releaseDataBeans[0].name)) {
                            return <span>{translate("no-release")}</span>
                        }
                        return <></>
                    })()
                }
            </div>
        </>
    )
}
