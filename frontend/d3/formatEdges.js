export function createLinksObject({
    edge_color,
    edge_weight,
    edge_source,
    edge_target,
    edge_sentiment_normalized,
}) {
    let lines = edge_source.map((_, i) => ({
        source: edge_source[i],
        target: edge_target[i],
        color: edge_color[i],
        weight: edge_weight[i],
        sentiment_normalized: edge_sentiment_normalized[i],
    }));
    return lines;
}
