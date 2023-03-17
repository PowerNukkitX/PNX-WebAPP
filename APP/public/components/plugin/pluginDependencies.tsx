import React, { useEffect, useState } from "preact/compat";
import { apiDelayedReturn } from "../../util/apiUtil";
import { DependenciesDataBean } from "../../data/DependenciesDataBean";
import { translate } from "../../util/language";

export function PluginDependencies(props: { pluginName: string }) {
    if (props.pluginName) {
        const [dependencies, setDependencies] = useState<DependenciesDataBean>(null);
        useEffect(() => {
            getPluginDependencies(props.pluginName).then((data) => {
                setDependencies(data);
            });
        }, [props.pluginName]);
        if (dependencies?.mermaid) {
            // 如果是手机端，将TD改为LR
            if (window.innerWidth < 768) {
                dependencies.mermaid = dependencies.mermaid.replace(/TD/g, 'LR');
            } else {
                dependencies.mermaid = dependencies.mermaid.replace(/TD/g, '');
            }
            // 等待MermaidDiagram渲染完成
            return (
                <div id="graphDiv" className={'mermaid'} style={{
                    opacity: 0,
                }}>
                    {(() => {
                        setTimeout(() => {
                            window['renderMermaid'](".mermaid");
                            (document.querySelector(".mermaid") as HTMLDivElement).style.opacity = "1";
                        }, 50);
                        return dependencies.mermaid
                    })()}
                </div>
            );
        }
        return <div>{translate("loading")}</div>
    }

}

// 请求插件依赖关系图
const getPluginDependencies = async (pluginName: string) => {
    return await apiDelayedReturn<DependenciesDataBean>({
        url: "/plugin/dependency-graph/" + pluginName,
    });
}