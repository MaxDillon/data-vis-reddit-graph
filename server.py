from flask import Flask, request
from flask_cors import CORS
from read_data import get_nodes_edges, get_posts, _get_node_data
import pandas as pd
import json

app = Flask(__name__)
CORS(app)


def edge_filter(edges: pd.DataFrame, number):
    edges = edges.nlargest(number, "posts")
    nodes = _get_node_data(edges)
    return (nodes, edges)


@app.route("/")
def hello_world():
    node_number = int(request.args.get("n") or 500)
    min_sentiment = float(request.args.get("sl") or 0)
    max_sentiment = float(request.args.get("su") or 1)

    min_time = int(request.args.get("tl") or 0)
    max_time = int(request.args.get("tu") or 1216)

    focus = request.args.get("focus")
    posts = get_posts()
    posts_start_time = posts["timestamp"].min()
    time_start = posts_start_time + pd.Timedelta(days=min_time)
    time_end = posts_start_time + pd.Timedelta(days=max_time)

    nodes, edges = get_nodes_edges(posts, time_start, time_end)

    if focus:
        reddits_to = posts[posts["source_r"] == focus]["target_r"]
        reddits_from = posts[posts["target_r"] == focus]["source_r"]
        reddits = pd.concat([reddits_to, reddits_from, pd.Series([focus])])

        if len(reddits) > 1:
            criteria = (edges["source_r"].isin(reddits)) & (
                edges["target_r"].isin(reddits)
            )
            edges = edges[criteria]
            nodes = _get_node_data(edges)

    edges = edges[edges["sentiment_normalized"] <= max_sentiment]
    edges = edges[edges["sentiment_normalized"] >= min_sentiment]

    nodes, edges = edge_filter(edges, (node_number))
    return {
        "nodes": json.loads(nodes.to_json()),
        "edges": json.loads(edges.to_json()),
        "timestart": time_start.strftime("%Y-%m-%d"),
        "timeend": time_end.strftime("%Y-%m-%d"),
    }


if __name__ == "__main__":
    app.run(debug=True, port=4000)
