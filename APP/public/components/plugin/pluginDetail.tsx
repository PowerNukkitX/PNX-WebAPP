// noinspection HtmlUnknownAnchorTarget

import { Component, createRef, RefObject, RenderableProps } from "preact";
import RepoDataBean from "../../data/RepoDataBean";
import MDUI from "../../util/mduiHelper";
import { translate } from "../../util/language";
import { apiGetJson, apiPostRaw, getApiURL } from "../../util/apiUtil";
import { ReadmeDataBean } from "../../data/ReadmeDataBean";
import { LanguageComponent, StarComponent, TimeComponent } from "./pluginCard";
// @ts-ignore
import * as style from "./pluginDetail.module.css";
import ReleaseDataBean from "../../data/ReleaseDataBean";
import { time2AgoString } from "../../util/timeUtil";
import { useState } from "preact/compat";
import { sizeToString } from "../../util/stringUtil";
import { PluginDependencies } from "./pluginDependencies";

interface Props {
    path: string
}

interface State {
    repoData: RepoDataBean | null | undefined
    renderedReadme: string | null | undefined
    lastUpdateTime: Date | null | undefined
    releases: Array<ReleaseDataBean>
    displayAllReleases: boolean,
    tab: any
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
            displayAllReleases: false,
            tab: null
        })
    }

    setDisplayTab(index: number) {
        this.state.tab.show(index);
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

    displayTab(index: number) {
        console.log("display tab " + index);
        if (this.state?.tab) {
            this.state.tab.show(index);
            // 重新渲染
            this.setState({
                ...this.state,
                tab: this.state.tab
            })
        }
    }

    render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined) {
        // 渲染时检查tab
        if (!state?.tab || state.tab.activeIndex === -1) {
            const tab = new MDUI.Tab("#tab");
            this.setState({
                tab: tab
            })
        }
        return (
            <div className={style.detailContainer} ref={this.ref} id={Math.random().toString(36).substring(2)}>
                <div className="mdui-container mdui-typo">
                    <br />
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
                    <hr />
                    <div className="mdui-row">
                        <div className="mdui-typo-display-1">
                            {state?.repoData?.name ?? translate("loading")}
                        </div>
                    </div>
                    <div className={"mdui-row mdui-valign " + style.noLeftPaddingValign}>
                        <LanguageComponent language={state?.repoData?.mainLanguage ?? translate("loading")} />
                        <StarComponent star={state?.repoData?.star ?? translate("loading")} />
                        <TimeComponent time={state?.repoData?.lastUpdateAt ?? translate("loading")} />
                        <AuthorComponent author={state?.repoData?.owner ?? translate("loading")} />
                    </div>
                    <div className="mdui-row">
                        <div id="tab" className="mdui-tab" mdui-tab>
                            <a href="#tab-introduction" className="mdui-ripple" onClick={() => { this.displayTab(0) }}>{translate("introduction")}</a>
                            <a href="#release-content" className="mdui-ripple" onClick={() => { this.displayTab(1) }}>{translate("download")}</a>
                            <a href="#tab-dependencies" className="mdui-ripple" onClick={() => { this.displayTab(2) }}>{translate("dependencies")}</a>
                        </div>
                    </div>
                    {/*TODO 修复错误的图片相对链接（将相对链接指向GitHub而非PNXHub）*/}
                    {/*检查tab是否选中这个, 否则不渲染 */}
                    {
                        state?.tab?.activeIndex === 0 ?
                            <div className="mdui-row" id="tab-introduction" >
                                <div className="mdui-typo" dangerouslySetInnerHTML={{
                                    __html: state?.renderedReadme ?? translate("loading")
                                }}></div>
                            </div>
                            : null
                    }
                    {
                        state?.tab?.activeIndex === 1 ?
                            <div id="release-content" className="mdui-row mdui-typo">
                                <br />
                                <div className="mdui-typo-title-opacity">{translate("release")}</div>
                                <ReleaseComponent pluginID={this.pluginID} releaseDataBeans={state?.releases}
                                    loadAllCallback={() => {
                                        this.setState({
                                            displayAllReleases: true
                                        });
                                        this.updateInfo(false, true)
                                    }} />
                            </div>
                            : null
                    }
                    {
                        state?.tab?.activeIndex === 2 ?
                            <div id="tab-dependencies" className="mdui-row mdui-typo">
                                <br />
                                <div className="mdui-typo-title-opacity">{translate("dependencies")}</div>
                                <div id="render" />
                                <PluginDependencies pluginName={this.state.repoData?.pluginName} />
                            </div>
                            : null
                    }
                </div>
                <br />
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
        // TODO 多次渲染Markdown结果进行缓存，避免不必要的请求
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
                                }} />
                                <ul className={"mdui-list " + style.downloadList} style={{
                                    paddingLeft: "0"
                                }}>
                                    {releaseDataBean.artifacts.map((artifact) => {
                                        if (!artifact.name) return <></>
                                        return (
                                            <li className="mdui-list-item mdui-ripple">
                                                <div className="mdui-list-item-content mdui-valign">
                                                    <span className={style.fileName}>{artifact.name}</span>
                                                    <TimeComponent time={artifact.createAt} />
                                                    <FileSizeComponent size={artifact.sizeInBytes} />
                                                </div>
                                                {/*TODO 优化下载按钮样式*/}
                                                <a href={getApiURL() + "/download/" + artifact.downloadId} download>
                                                    <i className="mdui-list-item-icon mdui-icon material-icons">&#xe2c4;</i>
                                                </a>
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
                                {/*TODO 使用LoadingDialog来提示用户正在加载*/}
                                {/*TODO 如果一共只有一个发行版给出用户提示，不要让用户以为是加载失败*/}
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
                    // TODO 在合适的时候显示正在加载
                    // TODO 目前的实现方式会导致在加载完成之后仍然显示正在加载，所以目前什么也不显示
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
