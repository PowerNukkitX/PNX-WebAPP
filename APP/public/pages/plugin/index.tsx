import {PluginCard} from "../../components/plugin/pluginCard";
import RepoDataBean from "../../data/RepoDataBean";
import PluginDrawer from "../../components/plugin/pluginDrawer";
import NotFound from "../_404";
import {Route, Router} from "preact-iso";

export default function PluginHub(props) {
    return (
        <>
            <PluginDrawer/>
            <Router>
                <Route path={"/"} component={Hub}/>
                <Route path={"/hub"} component={Hub}/>
                <Route default={true} component={NotFound}/>
            </Router>
        </>
    )
}

function subRoute(remainingPath) {
    switch (remainingPath) {
        case "":
        case "hub":
            return <Hub/>;
        default:
            return <NotFound/>
    }
}

function Hub() {
    return (
        <>
            <div className="mdui-container">
                <h1>Plugin Hub</h1>
                <PluginCard repo={RepoDataBean.fromJSON({
                    "id": "PowerNukkitX/ChiliShop",
                    "owner": "PowerNukkitX",
                    "name": "ChiliShop",
                    "description": "A plugin for PowerNukkitX, Based on the PepperShop",
                    "mainLanguage": "Java",
                    "lastUpdateAt": 1663006782000,
                    "star": 0,
                    "iconDownloadID": 90,
                    "pluginName": "ChiliShop",
                    "mainClass": "cn.innc11.chilishop.ChiliShop",
                    "dependencies": ["EconomyAPI"],
                    "softDependencies": ["Residence", "Land"],
                    "banned": false,
                    "qualityScore": -1142,
                    "editorRecommendScore": 0,
                    "lastFullIndexTime": 1678074194457
                })}/>
            </div>
        </>
    )
}