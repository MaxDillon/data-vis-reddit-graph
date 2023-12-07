import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { radialForce } from "./radialForce.js";
import { Tooltip } from "./Tooltip.js";

import { createLinksObject } from "./formatEdges.js";
import { createNodesObject } from "./formatNodes.js";
import { createNodesObjectWithPosition, parseData } from "./parseData.js";

const width = 1200;
const height = 780;

export class Network {
    constructor(config) {
        this.d3graph = d3
            .select("#graph")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        this.tooltip = new Tooltip();
        this.config = config;
        this.transform = d3.zoomTransform(this.d3graph.node());

        this.dragging = false;
        this.d3node = null;
        this.d3edge = null;
        this.nodes = null;
        this.edges = null;
        this.simulation = null;

        this.d3edgebase = this.d3graph
            .append("g")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-linecap", "round");

        this.d3nodebase = this.d3graph
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1.5);

        this.config.addEventListener("update", () => {
            this.update();
        });

        this.config.nodeForce.listen((value) => {
            this.repelForce.strength((node) => -value * Math.sqrt(node.weight));
            this.simulation
                .force("charge", this.repelForce)
                .alpha(0.5)
                .restart();
        });

        this.config.edgeForce.listen((value) => {
            this.linkForce.strength((node) => value);
            this.simulation
                .force("charge", this.repelForce)
                .alpha(0.5)
                .restart();
        });

        this.config.maxNodes.listen((value) => this.redrawWithConfig());
        this.config.minSentiment.listen((value) => this.redrawWithConfig());
        this.config.maxSentiment.listen((value) => this.redrawWithConfig());

        this.config.minTime.listen((value) => this.redrawWithConfig());
        this.config.maxTime.listen((value) => this.redrawWithConfig());

        this.config.listenSelected((value) => this.redrawWithConfig());
    }

    async redrawWithConfig() {
        const maxNodes = this.config.maxNodes();
        const minSentiment = this.config.minSentiment();
        const maxSentiment = this.config.maxSentiment();

        const minTime = this.config.minTime();
        const maxTime = this.config.maxTime();

        const selected = this.config.selected;
        let data = await parseData(
            `http://localhost:4000?n=${maxNodes}&sl=${minSentiment}&su=${maxSentiment}&focus=${selected}&tl=${minTime}&tu=${maxTime}`
        );

        let edges = createLinksObject(data);
        let nodes = createNodesObjectWithPosition(data, this.nodes);

        this.clear();
        this.draw(nodes, edges, 0.5);
    }

    clear() {
        if (this.d3node) this.d3node.remove();
        if (this.d3edge) this.d3edge.remove();
        if (this.simulation) this.simulation.stop();

        this.dragging = false;
        this.d3node = null;
        this.d3edge = null;
        this.nodes = null;
        this.edges = null;
        this.simulation = null;
    }

    draw(nodes, edges, alpha = 1) {
        this.nodes = nodes;
        this.edges = edges;

        this.d3node = this.d3nodebase
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("fill", (d) => d.color)
            .attr("stroke", (d) =>
                d.id == this.config.selected ? "#cc6" : "fff"
            )
            .attr("stroke-width", (d) =>
                d.id == this.config.selected ? 10 : 1.5
            )
            .attr("transform", this.transform);

        this.d3edge = this.d3edgebase
            .selectAll("line")
            .data(edges)
            .join("line")
            .attr("stroke", (d) => d.color)
            .attr("transform", this.transform);

        this.connectForces(alpha);
        this.handleMouseOver();
        this.connectZoom();
        this.connectDrag();
    }

    update() {
        this.d3edge
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y)
            .attr("stroke-width", (d) => d.weight * this.config.edgeSize());

        this.d3node
            .attr("r", (d) => Math.sqrt(d.weight) * this.config.nodeSize())
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
    }

    connectForces(alpha) {
        this.linkForce = d3
            .forceLink(this.edges)
            .id((node) => node.id)
            .strength((edge) => this.config.edgeForce());

        this.repelForce = d3
            .forceManyBody()
            .strength(
                (node) => -this.config.nodeForce() * Math.sqrt(node.weight)
            );

        this.centeringForce = radialForce(8, this.nodes);

        this.simulation = d3
            .forceSimulation(this.nodes)
            .alpha(alpha)
            .force("link", this.linkForce)
            .force("charge", this.repelForce)
            .force("center", this.centeringForce)
            .on("tick", () => this.update());
    }

    connectZoom() {
        const handleZoom = (e) => {
            this.transform = e.transform;
            this.d3node.attr("transform", e.transform);
            this.d3edge.attr("transform", e.transform);
        };

        const handleStart = (event) => {
            if (event.sourceEvent.type == "mousedown") {
                document.body.style.cursor = "grabbing";
            }
        };

        const zoomConnector = d3
            .zoom()
            .on("start", handleStart)
            .on("zoom", handleZoom)
            .on("end", () => (document.body.style.cursor = "auto"));

        this.d3graph.call(zoomConnector);
    }

    connectDrag() {
        const dragstarted = (e) => {
            this.dragging = true;
            this.tooltip.hide();

            if (!e.active) this.simulation.alphaTarget(0.2).restart();
            const [x, y] = d3.pointer(e, this.d3graph.node());
            const [zoomX, zoomY] = this.transform.invert([x, y]);
            e.subject.fx = zoomX;
            e.subject.fy = zoomY;
        };

        const dragged = (e) => {
            const [x, y] = d3.pointer(e, this.d3graph.node());
            const [zoomX, zoomY] = this.transform.invert([x, y]);
            e.subject.fx = zoomX;
            e.subject.fy = zoomY;
        };

        const dragended = (e) => {
            this.dragging = false;
            if (!e.active) this.simulation.alphaTarget(0);
            e.subject.fx = null;
            e.subject.fy = null;
        };

        const dragConnector = d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

        this.d3node.call(dragConnector);
        this.d3node.on("click", (e) => {
            console.log("click");
            if (e.defaultPrevented) return;
            const data = e.target.__data__;
            this.config.setSelected(data.id);
        });
    }

    handleMouseOver() {
        const mouseover = (e) => {
            if (this.dragging) return;
            const data = e.target.__data__;
            if (e.target.nodeName == "line") {
                this.tooltip.edge(data);
            } else {
                this.tooltip.node(data);
            }
        };

        this.d3edge
            .on("mouseover", (e) => mouseover(e))
            .on("mousemove", (e) => this.tooltip.connectMove(e))
            .on("mouseout", () => this.tooltip.hide());
        this.d3node
            .on("mouseover", (e) => mouseover(e))
            .on("mousemove", (e) => this.tooltip.connectMove(e))
            .on("mouseout", () => this.tooltip.hide());
    }
}
