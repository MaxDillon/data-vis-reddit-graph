import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class Tooltip {
    constructor() {
        this.element = d3.select("#tooltip");
    }

    hide() {
        this.element.style("visibility", "hidden");
    }

    connectMove(e) {
        const x = e.pageX + 5;
        const y = e.pageY + 5;
        return this.element.style("transform", `translate(${x}px, ${y}px)`);
    }

    node(node) {
        this.element.html(getTooltipNode(node)).style("visibility", "visible");
    }

    edge(edge) {
        this.element.html(getTooltipEdge(edge)).style("visibility", "visible");
    }
}

function getTooltipEdge(edge) {
    const source_id = edge.source.id;
    const target_id = edge.target.id;

    return `
    <h4>r\\${source_id} → r\\${target_id}</h4>
    <p>Numer of Posts: ${edge.weight}</p>
    <p>Sentiment: ${edge.sentiment_normalized.toFixed(2)}</p>
    `.trim();
}

function getTooltipNode(node) {
    return `
    <h4>r\\${node.id}</h4>
    <p>Incoming and Outgoing Posts: ${node.weight}</p>
    <p>Semtiment: ${node.sentiment_normalized.toFixed(2)}</p>

    `.trim();
}
