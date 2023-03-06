import {PluginCard} from "../../components/plugin/pluginCard";
import RepoDataBean from "../../data/RepoDataBean";

export default function PluginHub() {
    return (
        <div class="mdui-center">
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
    )
}