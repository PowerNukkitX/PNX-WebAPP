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
    private pluginCards: JSX.Element[] = [];
    private lastUpdateTime: number = 0;

    constructor() {
        super();
        this.setState({
            updating: false,
            updatingProcess: 0,
            errorReason: null,
            updateQuery: {
                from: 0,
                size: 15,
                sort: "recommend",
                order: "desc",
                keywords: null
            }
        })
    }

    updatePlugins(): void {
        // 三秒以内不重复更新
        const currentTime = new Date().getTime();
        if (currentTime - this.lastUpdateTime < 1000 * 3) return;
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
                this.renderPluginCards();
            }
        })
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

    render() {
        return (
            <>
                <div className="mdui-container">
                    <div className="mdui-row">
                        <h1>{translate("plugin-hub")}</h1>
                        <button className="mdui-btn mdui-btn-icon mdui-ripple">
                            <i className="mdui-icon material-icons" onClick={() => this.updatePlugins()}>refresh</i>
                        </button>
                    </div>
                    <div className={"mdui-row " + style.pluginList}>
                        {this.pluginCards}
                    </div>
                </div>
            </>
        )
    }
}