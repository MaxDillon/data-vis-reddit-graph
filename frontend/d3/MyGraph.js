import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { attachNodeEventListeners } from "./attachEventListeners.js";
import { drawNodes } from "./drawNodes.js";
import { drawLinks } from "./drawLinks.js";
import { radialForce } from "./radialForce.js";

export function MyGraph(graph, links, nodes, config, alpha = 1) {
    let link = drawLinks(links);
    let node = drawNodes(nodes);

    // Construct the forces.
    const forceNode = d3
        .forceManyBody()
        .strength((node) =>
            node.selected ? -1500 : -5 * Math.sqrt(node.weight)
        );
    const forceLink = d3
        .forceLink(links)
        .id((node) => node.id)
        .strength((link) => 0.2);

    const simulation = d3
        .forceSimulation(nodes)
        .alpha(alpha)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("center", radialForce(8, nodes))
        .on("tick", update);

    function update() {
        link.attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y)
            .attr("stroke-width", (d) => d.width);

        node.attr("r", (d) => d.radius);
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }

    config.addEventListener("update", update);

    function zoom() {
        function handleZoom(e) {
            node.attr("transform", e.transform);
            link.attr("transform", e.transform);
        }

        function handleStart(event) {
            if (event.sourceEvent.type == "mousedown") {
                document.body.style.cursor = "grabbing";
            }
        }

        return (
            d3
                .zoom()
                // .transform(d3.zoomTransform(graph.node()))
                .on("start", handleStart)
                .on("zoom", handleZoom)
                .on("end", () => (document.body.style.cursor = "auto"))
        );
    }

    graph.call(zoom(simulation));
    attachNodeEventListeners(node, simulation);

    return {
        link,
        node,
    };
}
