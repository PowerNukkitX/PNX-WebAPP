import { PluginCard } from "../../components/plugin/pluginCard";
import RepoDataBean from "../../data/RepoDataBean";
import PluginDrawer from "../../components/plugin/pluginDrawer";
import NotFound from "../_404";
import { Router } from "preact-iso";
import { translate } from "../../util/language";
import { Component, JSX } from "preact";
import MDUI from "../../util/mduiHelper";
import { apiGetJson, getApiURL } from "../../util/apiUtil";
// @ts-ignore
import * as style from "./style.module.css";
import slideChooseDialog from "../../components/dialog/sliderChooseDialog";
import PluginDetail from "../../components/plugin/pluginDetail";
import loadingDialog from "../../components/dialog/loadingDialog";

export default function PluginHub() {
    return (
        <>
            <PluginDrawer/>
            <Router>
                <Hub path={"/"}/>
                <Hub path={"/hub"}/>
                <PluginDetail path={"/detail/*"}></PluginDetail>
                <NotFound default={true}/>
            </Router>
        </>
    )
}

let queryFrom = 0;

class Hub extends Component<{ path: string }, {
    updating: boolean,
    updatingProcess: number, // 0-100 如果 <0 说明请求出错
    errorReason: string,
    updateQuery: {
        from: number,
        size: number,
        sort: "recommend" | "lastUpdate" | "star",
        order: "asc" | "desc",
        keywords: string
    }
}> {
    private repoData: RepoDataBean[] = [];
    private totalSize: number = 1;
    private pluginCards: JSX.Element[] = [];
    private lastUpdateTime: number = 0;

    constructor() {
        super();
        const clientWidth = document.body.clientWidth;
        let pageSize;
        if (clientWidth <= 600) {
            pageSize = 4;
        } else if (clientWidth <= 1024) {
            pageSize = 8;
        } else if (clientWidth <= 1440) {
            pageSize = 12;
        } else {
            pageSize = 16;
        }
        this.setState({
            updating: false,
            updatingProcess: 0,
            errorReason: null,
            updateQuery: {
                from: queryFrom,
                size: pageSize,
                sort: (localStorage.getItem("pluginHubSort") as "recommend" | "lastUpdate" | "star") || "recommend",
                order: (localStorage.getItem("pluginHubOrder") as "asc" | "desc") || "desc",
                keywords: null
            }
        })
    }

    shouldComponentUpdate(nextProps: Readonly<{ path: string }>,
                          nextState: Readonly<{ updating: boolean; updatingProcess: number; errorReason: string; updateQuery: { from: number; size: number; sort: "recommend" | "lastUpdate" | "star"; order: "asc" | "desc"; keywords: string } }>, nextContext: any): boolean {
        if (this.state.updating || this.state.updating !== nextState.updating) {
            console.log("ture")
            return true;
        }
        if (!Hub.isObjEqual(this.state.updateQuery, nextState.updateQuery)) {
            console.log("ture")
            return true;
        }
        console.log("false")
        return false;
    }

    private static isObjEqual(object1, object2) {
        const o1keys = Object.keys(object1);
        const o2keys = Object.keys(object2);
        if (o2keys.length !== o1keys.length) return false;
        for (let i = 0; i <= o1keys.length - 1; i++) {
            let key = o1keys[i];
            if (!o2keys.includes(key)) return false;
            if (object2[key] !== object1[key]) return false;
        }
        return true;
    }

    /**
     * @returns If we successfully send a request to update plugin list.
     */
    updatePlugins(): boolean {
        // 三秒以内不重复更新
        const currentTime = new Date().getTime();
        if (currentTime - this.lastUpdateTime < 1000) {
            MDUI.snackbar({
                message: translate("update-too-frequent"),
                buttonText: translate("ok")
            })
            return false;
        }
        this.lastUpdateTime = currentTime;
        // 设置正在更新
        this.setState({
            updating: true
        })
        loadingDialog(
            apiGetJson<any>({
                url: this.processURL(),
                beforeSend: xhr => {
                    xhr.upload.addEventListener("progress", e => {
                        this.setState({
                            updatingProcess: e.loaded / e.total * 100
                        })
                        console.log("update")
                    })
                },
                error: (xhr, textStatus) => {
                    this.setState({
                        updating: false,
                        updatingProcess: -1,
                        errorReason: textStatus
                    })
                }
            }).then(dataObj => {
                this.setState({
                    updating: false,
                    updatingProcess: 0,
                    errorReason: null
                });
                if (dataObj.size === 0) {
                    this.setState({
                        updatingProcess: -1,
                        errorReason: "No plugins matched"
                    });
                } else {
                    const dataArray = [];
                    for (const each of dataObj.plugins) {
                        dataArray.push(RepoDataBean.fromJSON(each));
                    }
                    this.repoData = dataArray;
                    this.totalSize = dataObj.totalSize;
                }
            }), translate("plugin-list")
        );
        return true;
    }

    renderPluginCards(): void {
        this.pluginCards = [];
        for (const each of this.repoData) {
            this.pluginCards.push(<PluginCard repo={each}/>)
        }
    }

    processURL(): string {
        let root = getApiURL();
        const queryData = this.state.updateQuery;
        if (queryData.keywords) {
            root += "/plugin/search"
            if (queryData.order) {
                root += "/" + queryData.order
            }
            root += "?keywords" + queryData.keywords
            if (queryData.from) {
                root += "&from=" + queryData.from
            }
            if (queryData.size) {
                root += "&size=" + queryData.size
            }
        } else {
            root += "/plugin/list"
            if (queryData.sort) {
                root += "/" + queryData.sort
                if (queryData.order) {
                    root += "/" + queryData.order
                }
            } else {
                if (queryData.order) {
                    root += "/recommend/" + queryData.order
                }
            }
            if (queryData.from && queryData.size) {
                root += "?from=" + queryData.from + "&size=" + queryData.size
            } else if (queryData.from) {
                root += "?from=" + queryData.from
            } else if (queryData.size) {
                root += "?size=" + queryData.size
            }
        }
        return root;
    }

    turnPageDelta(deltaPage: number): void {
        const queryData = this.state.updateQuery;
        const previousFrom = queryData.from;
        queryData.from += deltaPage * queryData.size;
        if (queryData.from < 0) {
            queryData.from = 0;
        }
        if (queryData.from + 1 > this.totalSize) {
            queryData.from = previousFrom;
        }
        if (queryData.from !== previousFrom) {
            if (!this.updatePlugins()) {
                queryData.from = previousFrom;
            }
        }
    }

    get currentPage(): number {
        return Math.floor(this.state.updateQuery.from / this.state.updateQuery.size) + 1
    }

    get maxPage(): number {
        return Math.ceil(this.totalSize / this.state.updateQuery.size)
    }

    render() {
        this.renderPluginCards();
        return (
            <>
                <div className="mdui-container">
                    <div className="mdui-row mdui-text-center">
                        <h1>{translate("plugin-hub")}</h1>
                    </div>
                    <br/>
                    <div className={"mdui-row " + style.pluginButtonBar}>
                        <button className="mdui-btn mdui-ripple" onClick={() => this.updatePlugins()}>
                            {/*Refresh*/}
                            <i className="mdui-icon material-icons">&#xe5d5;</i>
                            <span>{translate("refresh")}</span>
                        </button>
                        <div>
                            <span>{translate("order")}</span>
                        </div>
                        {/*TODO 在切换推荐方式后立即更新插件列表*/}
                        <select className="mdui-select" value={this.state.updateQuery.sort}
                                mdui-select="{position: 'bottom'}" onChange={event => {
                            const state = this.state;
                            const temp = state.updateQuery.sort;
                            state.updateQuery.sort = event.target['value'] as "recommend" | "lastUpdate" | "star";
                            // 写入到本地存储
                            const update = this.updatePlugins();
                            if (update) {
                                localStorage.setItem("pluginHubSort", state.updateQuery.sort);
                            } else {
                                // 如果更新失败则恢复原来的排序方式
                                this.state.updateQuery.sort = temp;
                                console.log(event);
                                // 重置选择框
                                event.target['value'] = temp;
                                // TODO: 目前无法重置选择框视图
                                return;
                            }
                        }}>
                            <option value="recommend">{translate("recommend")}</option>
                            <option value="lastUpdate">{translate("lastUpdate")}</option>
                            <option value="star">{translate("star")}</option>
                        </select>
                        {/*TODO 在切换排序方式后立即更新插件列表*/}
                        <label className="mdui-switch">
                            <input type="checkbox" checked={(this.state.updateQuery.order == 'asc')}
                                   onClick={(event) => {
                                       const state = this.state;
                                       const temp = state.updateQuery.order;
                                       state.updateQuery.order = event.target['checked'] ? "asc" : "desc";
                                       // 写入到本地存储
                                       localStorage.setItem("pluginHubOrder", state.updateQuery.order);
                                       if (this.updatePlugins()) {
                                           localStorage.setItem("pluginHubOrder", state.updateQuery.order);
                                       } else {
                                           // 如果更新失败则恢复原来的排序方式
                                           this.state.updateQuery.order = temp;
                                           // 重置开关状态
                                           event.target['checked'] = !event.target['checked'];
                                           return;
                                       }
                                   }}/>
                            <i className="mdui-switch-icon"></i>
                            <span>{translate("reverse-order")}</span>
                        </label>
                    </div>
                    <br/>
                    <div className={"mdui-row " + style.pluginList}>
                        {this.pluginCards}
                    </div>
                    <br/>
                    <div className={"mdui-row " + style.pluginButtonBar}>
                        {/*Page Up*/}
                        <button className="mdui-btn mdui-btn-icon"
                                mdui-tooltip={`{content: '${translate("page-up")}'}`}
                                onClick={() => this.turnPageDelta(-1)}>
                            <i className="mdui-icon material-icons">&#xe5dc;</i>
                        </button>
                        {/*TODO 这里翻页的翻译漏掉了*/}
                        <button className="mdui-btn mdui-btn-raised"
                                onClick={() => slideChooseDialog("翻页", this.currentPage, 1, this.maxPage, 1).then(page => {
                                    this.turnPageDelta(page - this.currentPage);
                                }).catch(() => {
                                    console.log("Canceled turn page.")
                                })}
                        >{this.currentPage} / {this.maxPage}</button>
                        {/*Page Down*/}
                        <button className="mdui-btn mdui-btn-icon"
                                mdui-tooltip={`{content: '${translate("page-down")}'}`}
                                onClick={() => this.turnPageDelta(1)}>
                            <i className="mdui-icon material-icons">&#xe5dd;</i>
                        </button>
                    </div>
                    <br/>
                </div>
            </>
        )
    }

    componentDidUpdate(previousProps: Readonly<{ path: string }>,
                       previousState: Readonly<{ updating: boolean; updatingProcess: number; errorReason: string; updateQuery: { from: number; size: number; sort: "recommend" | "lastUpdate" | "star"; order: "asc" | "desc"; keywords: string } }>, snapshot: any) {
        MDUI.mutation("." + style.pluginButtonBar);
    }

    componentWillMount() {
        const queryData = this.state.updateQuery;
        if (queryData) {
            queryData.from = queryFrom;
            this.setState({
                updateQuery: queryData
            })
        }
    }

    componentDidMount() {
        if (this.repoData.length === 0) {
            this.updatePlugins();
        }
        MDUI.mutation("." + style.pluginButtonBar);
    }

    componentWillUnmount() {
        queryFrom = this.state.updateQuery.from;
    }
}