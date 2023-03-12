import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

/**
 * Mermaid图表渲染组件
 * @param param0 
 * @returns 
 */
const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const [loading, setLoading] = useState(true);
  // TODO: 保证DOM加载完成后再渲染
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false
    });

    if (loading) {
      mermaid.render('render', chart).then(svgCode => {
        // 修改字体大小为13px
        svgCode.svg = svgCode.svg.replace(/font-size:16px/g, 'font-size:14px');
        const graphDiv = document.getElementById('graphDiv');
        graphDiv.innerHTML = svgCode.svg;
      });
      setLoading(false);
    }
  }, [chart]);

  if (loading) {
    return <div>Loading</div>;
  }
  return (
    <div id="graphDiv">
    </div>
  );
};




export default MermaidDiagram;