export function createNodesObject({
    node_color,
    node_id,
    node_weight,
    node_sentiment,
    node_sentiment_normalized,
}) {
    let nodes = node_id.map((id, i) => ({
        id,
        color: node_color[i],
        weight: node_weight[i],
        sentiment: node_sentiment[i],
        sentiment_normalized: node_sentiment_normalized[i],
    }));

    return nodes;
}
