import {PluginCard} from "../../components/plugin/pluginCard";
import RepoDataBean from "../../data/RepoDataBean";
import PluginDrawer from "../../components/plugin/pluginDrawer";
import NotFound from "../_404";
import {Router} from "preact-iso";
import {translate} from "../../util/language";
import {Component, JSX} from "preact";
import MDUI from "../../util/mduiHelper";
import {getApiURL} from "../../util/apiUtil";
// @ts-ignore
import * as style from "./style.module.css";

export default function PluginHub() {
    return (
        <>
            <PluginDrawer/>
            <Router>
                <Hub path={"/"}/>
                <Hub path={"/hub"}/>
                <NotFound default={true}/>
            </Router>
        </>
    )
}

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
                from: 0,
                size: pageSize,
                sort: "recommend",
                order: "desc",
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
        MDUI.$.ajax({
            method: "GET",
            url: this.processURL(),
            cache: false,
            async: true,
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
        }).then(data => {
            this.setState({
                updating: false,
                updatingProcess: 0,
                errorReason: null
            });
            const dataObj = JSON.parse(data);
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
        })
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
        if (queryData.from + 1 >= this.totalSize) {
            queryData.from = this.totalSize - 1;
        }
        if (queryData.from !== previousFrom) {
            if (!this.updatePlugins()) {
                queryData.from = previousFrom;
            }
        }
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
                        <select className="mdui-select" mdui-select="{position: 'bottom'}" onChange={event => {
                            const state = this.state;
                            state.updateQuery.sort = event.target['value'] as "recommend" | "lastUpdate" | "star";
                        }}>
                            <option value="recommend">{translate("recommend")}</option>
                            <option value="lastUpdate">{translate("lastUpdate")}</option>
                            <option value="star">{translate("star")}</option>
                        </select>
                        <label className="mdui-switch">
                            <input type="checkbox" onClick={(event) => {
                                const state = this.state;
                                state.updateQuery.order = event.target['checked'] ? "asc" : "desc";
                                console.log(event.target['checked'])
                            }}/>
                            <i className="mdui-switch-icon"></i>
                            <span>{translate("reverse-order")}</span>
                        </label>
                    </div>
                    <br/>
                    <div className="mdui-row">
                        <div className="mdui-progress" style={{
                            display: this.state.updating ? "block" : "none"
                        }}>
                            <div className={
                                this.state.updatingProcess > 0 ? "mdui-progress-determinate" : "mdui-progress-indeterminate"
                            } style={{
                                width: Math.round(this.state.updatingProcess) + "%"
                            }}></div>
                        </div>
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
                        <span>{Math.floor(this.state.updateQuery.from / this.state.updateQuery.size) + 1} / {Math.ceil(this.totalSize / this.state.updateQuery.size)}</span>
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

    componentDidMount() {
        if (this.repoData.length === 0) {
            this.updatePlugins();
        }
        MDUI.mutation("." + style.pluginButtonBar);
    }
}