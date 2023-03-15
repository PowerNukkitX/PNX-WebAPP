import React from 'react';

interface MermaidDiagramProps {
  chart: string;
}

/**
 * Mermaid图表渲染组件
 * @param param0 
 * @returns 
 */
const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  // TODO: 保证DOM加载完成后再渲染
  // 使用<script></script>标签渲染
  return (
    <div id="graphDiv" className={'mermaid'}>
      {chart}
    </div>
  );
};




export default MermaidDiagram;