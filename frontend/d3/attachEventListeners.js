import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function attachNodeEventListeners(node, simulation) {
    const tooltip = d3.select("#tooltip");
    const graph = d3.select("#graph");

    function drag() {
        function dragstarted(event) {
            tooltip.style("visibility", "hidden");
            const zoomTransform = d3.zoomTransform(graph.node());

            if (!event.active) simulation.alphaTarget(0.2).restart();
            const [x, y] = d3.pointer(event, graph.node());
            const [zoomX, zoomY] = zoomTransform.invert([x, y]);
            event.subject.fx = zoomX;
            event.subject.fy = zoomY;
        }

        function dragged(event) {
            const zoomTransform = d3.zoomTransform(graph.node());

            const [x, y] = d3.pointer(event, graph.node());
            const [zoomX, zoomY] = zoomTransform.invert([x, y]);
            event.subject.fx = zoomX;
            event.subject.fy = zoomY;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    node.call(drag());
}
