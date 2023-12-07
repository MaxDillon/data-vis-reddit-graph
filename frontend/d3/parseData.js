import { createNodesObject } from "./formatNodes.js";

export async function parseData(query = "http://localhost:4000") {
    let data = await fetch(query).then((res) => res.json());

    const edge_color = Object.values(data.edges.color);
    const edge_posts = Object.values(data.edges.posts);
    const edge_source = Object.values(data.edges.source_r);
    const edge_target = Object.values(data.edges.target_r);
    const edge_sentiment_normalized = Object.values(
        data.edges.sentiment_normalized
    );

    const node_id = Object.values(data.nodes.reddit);
    const node_color = Object.values(data.nodes.color);
    const node_posts = Object.values(data.nodes.posts);
    const node_sentiment = Object.values(data.nodes.sentiment);
    const node_sentiment_normalized = Object.values(
        data.nodes.sentiment_normalized
    );

    const $timestart = document.querySelector("#timestart");
    const $timeend = document.querySelector("#timeend");

    $timestart.innerHTML = data.timestart;
    $timeend.innerHTML = data.timeend;

    return {
        edge_color,
        edge_weight: edge_posts,
        edge_source,
        edge_target,
        edge_sentiment_normalized,
        node_weight: node_posts,
        node_color,
        node_sentiment,
        node_sentiment_normalized,
        node_id,
    };
}

export function createNodesObjectWithPosition(data, oldData) {
    const prevPositions = oldData.reduce((acc, obj) => {
        const { id, x, y, vx, vy } = obj;
        acc[id] = [x, y, vx, vy];
        return acc;
    }, {});

    let nodes = createNodesObject(data);

    nodes = nodes.map((node) => {
        if (node.id in prevPositions) {
            const [x, y, vx, vy] = prevPositions[node.id];
            return { ...node, x, y, vx, vy };
        }
        return node;
    });

    return nodes;
}
