import React, { useEffect, useState } from "preact/compat";
import { apiDelayedReturn } from "../../util/apiUtil";
import { DependenciesDataBean } from "../../data/DependenciesDataBean";
import MermaidDiagram from "./pluginMermaidDiagram";

export function PluginDependencies(props: { pluginName: string }) {
    if (props.pluginName) {
        const [dependencies, setDependencies] = useState<DependenciesDataBean>();
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
            const md = <MermaidDiagram chart={dependencies.mermaid} />
            if (md) {
                return <div id="plugin-dependencies">{md}</div>
            }

        }
        return <div>Loading</div>
    }

}

// 请求插件依赖关系图
const getPluginDependencies = async (pluginName: string) => {
    const readmeData = await apiDelayedReturn<DependenciesDataBean>({
        url: "/plugin/dependency-graph/" + pluginName,
    });
    return readmeData;
}