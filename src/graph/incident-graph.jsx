import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Background,
  BaseEdge,
  Controls,
  getNodesBounds,
  getSmoothStepPath,
  getViewportForBounds,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import "@xyflow/react/dist/style.css";
import "./incident-graph.css";

const layerById = {
  jia: 0,
  andres: 0,
  repro: 0,
  xz: 1,
  fixtures: 1,
  tarball: 1,
  build: 2,
  rollback: 2,
  liblzma: 3,
  systemd: 3,
  cert: 4,
  sshd: 4,
  rce: 5,
};

const rowById = {
  jia: 0,
  andres: 3,
  repro: 4,
  xz: 0,
  fixtures: 1,
  tarball: 2,
  build: 0,
  rollback: 3,
  liblzma: 0,
  systemd: 1,
  cert: 0,
  sshd: 1,
  rce: 1,
};

function IncidentNode({ data, selected }) {
  const node = data.incidentNode;
  return (
    <div
      className={`rf-incident-node${selected ? " is-selected" : ""}`}
      style={{ "--node-color": data.color }}
      title={`${node.label}: ${node.detail}`}
      tabIndex="0"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          data.select(node.id);
        }
      }}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} />
      {node.sequence ? <span className="rf-node-sequence" aria-label={`Attack sequence ${node.sequence}: ${node.sequenceLabel}`} title={node.sequenceLabel}>{node.sequence}</span> : null}
      <span className="rf-node-type">{node.sequence ? `Stage ${String(node.sequence).padStart(2, "0")} · ` : ""}{node.type}</span>
      <strong>{node.label}</strong>
      <span className="rf-node-meta">{node.confidence} · {node.sources}</span>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
}

const nodeTypes = { incident: IncidentNode };

function IncidentEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style, data }) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const label = data.incidentEdge.shortLabel || data.incidentEdge.label;
  const width = Math.max(48, label.length * 6.6 + 14);
  const x = labelX + (data.incidentEdge.labelOffsetX || 0);
  const y = labelY + (data.incidentEdge.labelOffsetY || 0);
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      <g className="rf-edge-label" transform={`translate(${x} ${y})`} aria-hidden="true">
        <rect x={-width / 2} y="-10" width={width} height="20" />
        <text textAnchor="middle" dominantBaseline="central">{label}</text>
      </g>
    </>
  );
}

const edgeTypes = { incident: IncidentEdge };

function emit(element, name, detail) {
  element.dispatchEvent(new CustomEvent(name, { detail }));
}

function IncidentFlow({ element, sourceNodes, sourceEdges, colors }) {
  const flowRef = useRef(null);
  const defaultViewport = useMemo(
    () => ({ x: 24, y: 64, zoom: matchMedia("(max-width:600px)").matches ? 0.68 : 0.85 }),
    [],
  );
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [confidence, setConfidence] = useState("all");
  const [selectedId, setSelectedId] = useState("tarball");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportState, setExportState] = useState("PNG");

  const selectNode = (id) => {
    setSelectedId(id);
    const node = sourceNodes.find((candidate) => candidate.id === id);
    if (node) emit(element, "incidentgraphselect", node);
  };

  const initialNodes = useMemo(
    () => sourceNodes.map((node) => ({
      id: node.id,
      type: "incident",
      position: {
        x: 64 + (layerById[node.id] ?? 0) * 320,
        y: 54 + (rowById[node.id] ?? 0) * 190,
      },
      data: { incidentNode: node, color: colors[node.type], select: selectNode },
    })),
    [],
  );

  const initialEdges = useMemo(
    () => sourceEdges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.from,
      target: edge.to,
      type: "incident",
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      data: { incidentEdge: edge, index },
    })),
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const fitGraph = (duration = 240) => {
    flowRef.current?.fitView({ padding: 0.12, maxZoom: 1, duration });
  };

  const toggleFullscreen = async () => {
    const canvas = element.closest(".graph-canvas");
    if (!canvas) return;
    if (document.fullscreenElement === canvas) {
      await document.exitFullscreen();
    } else {
      await canvas.requestFullscreen();
    }
  };

  const exportPng = async () => {
    const viewportElement = element.querySelector(".react-flow__viewport");
    const visibleNodes = nodes.filter((node) => !node.hidden);
    if (!viewportElement || !visibleNodes.length || exportState === "Exporting...") return;
    setExportState("Exporting...");
    try {
      const width = 2400;
      const height = 1350;
      const bounds = getNodesBounds(visibleNodes);
      const viewport = getViewportForBounds(bounds, width, height, 0.5, 1.5, 0.08);
      const backgroundColor = getComputedStyle(element).getPropertyValue("--xy-background-color").trim() || "#ffffff";
      const dataUrl = await toPng(viewportElement, {
        backgroundColor,
        width,
        height,
        pixelRatio: 1,
        cacheBust: true,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
        },
      });
      const link = document.createElement("a");
      link.download = "xz-incident-evidence-graph.png";
      link.href = dataUrl;
      link.click();
      setExportState("Saved");
      window.setTimeout(() => setExportState("PNG"), 1600);
    } catch (error) {
      console.error("Graph export failed", error);
      setExportState("Retry PNG");
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === element.closest(".graph-canvas");
      setIsFullscreen(fullscreen);
      if (fullscreen) requestAnimationFrame(() => fitGraph(0));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = new Set(sourceNodes.filter((node) => (
      (type === "all" || node.type === type)
      && (confidence === "all" || node.confidence === confidence)
      && (!normalizedQuery || `${node.label} ${node.detail} ${node.sources}`.toLowerCase().includes(normalizedQuery))
    )).map((node) => node.id));
    setNodes((current) => current.map((flowNode) => {
      return { ...flowNode, hidden: !visible.has(flowNode.id) };
    }));
    const visibleEdges = sourceEdges.filter((edge) => visible.has(edge.from) && visible.has(edge.to));
    setEdges((current) => current.map((flowEdge) => ({
      ...flowEdge,
      hidden: !visible.has(flowEdge.source) || !visible.has(flowEdge.target),
    })));
    emit(element, "incidentgraphvisibleedges", visibleEdges);
  }, [query, type, confidence]);

  useEffect(() => {
    const related = new Set([selectedId]);
    sourceEdges.forEach((edge) => {
      if (edge.from === selectedId || edge.to === selectedId) {
        related.add(edge.from);
        related.add(edge.to);
      }
    });
    setNodes((current) => current.map((node) => ({
      ...node,
      selected: node.id === selectedId,
      className: related.has(node.id) ? "is-related" : "is-dimmed",
    })));
    setEdges((current) => current.map((edge) => {
      const isRelated = edge.source === selectedId || edge.target === selectedId;
      return {
        ...edge,
        animated: false,
        className: isRelated ? "is-related" : "is-dimmed",
        style: { strokeWidth: isRelated ? 3 : 1.5 },
      };
    }));
  }, [selectedId]);

  useEffect(() => {
    const search = document.getElementById("graphSearch");
    const typeFilter = document.getElementById("typeFilter");
    const confidenceFilter = document.getElementById("confidenceFilter");
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");
    const reset = document.getElementById("resetGraph");
    const onSearch = () => setQuery(search.value);
    const onType = () => setType(typeFilter.value);
    const onConfidence = () => setConfidence(confidenceFilter.value);
    const onZoomIn = () => flowRef.current?.zoomIn({ duration: 180 });
    const onZoomOut = () => flowRef.current?.zoomOut({ duration: 180 });
    const onReset = () => {
      search.value = "";
      typeFilter.value = "all";
      confidenceFilter.value = "all";
      setQuery("");
      setType("all");
      setConfidence("all");
      setNodes((current) => current.map((node) => ({
        ...node,
        position: initialNodes.find((initial) => initial.id === node.id).position,
        hidden: false,
        selected: node.id === "tarball",
        className: ["jia", "build", "rollback", "tarball"].includes(node.id) ? "is-related" : "is-dimmed",
      })));
      setEdges((current) => current.map((edge) => {
        const isRelated = edge.source === "tarball" || edge.target === "tarball";
        return {
          ...edge,
          hidden: false,
          className: isRelated ? "is-related" : "is-dimmed",
          style: { strokeWidth: isRelated ? 3 : 1.5 },
        };
      }));
      setSelectedId("tarball");
      emit(element, "incidentgraphselect", sourceNodes.find((node) => node.id === "tarball"));
      requestAnimationFrame(() => {
        flowRef.current?.setViewport(defaultViewport, { duration: 250 });
      });
    };
    search.addEventListener("input", onSearch);
    typeFilter.addEventListener("change", onType);
    confidenceFilter.addEventListener("change", onConfidence);
    zoomIn.addEventListener("click", onZoomIn);
    zoomOut.addEventListener("click", onZoomOut);
    reset.addEventListener("click", onReset);
    return () => {
      search.removeEventListener("input", onSearch);
      typeFilter.removeEventListener("change", onType);
      confidenceFilter.removeEventListener("change", onConfidence);
      zoomIn.removeEventListener("click", onZoomIn);
      zoomOut.removeEventListener("click", onZoomOut);
      reset.removeEventListener("click", onReset);
    };
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onInit={(instance) => { flowRef.current = instance; }}
      onNodeClick={(_, node) => selectNode(node.id)}
      onNodeMouseEnter={(_, node) => selectNode(node.id)}
      defaultViewport={defaultViewport}
      minZoom={0.35}
      maxZoom={1.8}
      nodesConnectable={false}
      elementsSelectable
      deleteKeyCode={null}
      aria-label="Interactive directed evidence graph of the XZ incident"
    >
      <Background gap={28} size={1} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(node) => node.data.color}
        aria-label="Incident graph overview"
      />
      <Panel position="top-right" className="rf-presentation-tools" aria-label="Graph presentation and export controls">
        <button type="button" className="nodrag nopan" onClick={() => fitGraph()} aria-label="Fit complete graph to view">Fit</button>
        <button type="button" className="nodrag nopan" onClick={toggleFullscreen}>{isFullscreen ? "Exit full screen" : "Full screen"}</button>
        <button type="button" className="nodrag nopan" onClick={exportPng} disabled={exportState === "Exporting..."} aria-live="polite">{exportState}</button>
      </Panel>
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

window.IncidentReactFlow = {
  mount(element, { nodes, edges, colors }) {
    const root = createRoot(element);
    root.render(<IncidentFlow element={element} sourceNodes={nodes} sourceEdges={edges} colors={colors} />);
    return () => root.unmount();
  },
};