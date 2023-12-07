import pandas as pd
import numpy as np


# Body length: 286561
# Titlelength : 571927

"data/soc-redditHyperlinks-title.tsv"
"data/soc-redditHyperlinks-body.tsv"


def normalize_color(col: float):
    clamped = max(0, min(1, col))
    factor = 0.4
    return int(255 * (factor + clamped * (1 - factor)))


# Define a function to map a number to a color
def map_to_color(value):
    # Normalize the value to the range [0, 1]
    normalized_value = (value + 1) / 2

    # Interpolate the color based on the normalized value
    red = normalize_color(1 - normalized_value)
    blue = normalize_color(normalized_value)

    # Convert RGB to hex
    greyness = normalize_color(2 * (normalized_value) * (1 - normalized_value))

    hex_color = "#{:02x}{:02x}{:02x}".format(red, greyness, blue)

    return hex_color


def _read_raw_data(path: str, n: int = None) -> pd.DataFrame:
    df = pd.read_table(path)
    if n != None:
        df = df[:n]
    df["TIMESTAMP"] = pd.to_datetime(df["TIMESTAMP"])
    df = df.drop("PROPERTIES", axis=1)
    df = df.drop("POST_ID", axis=1)
    df.columns = ["source_r", "target_r", "timestamp", "sentiment"]
    return df


def _filter_timeframe(start: pd.Timestamp, end: pd.Timestamp, posts: pd.DataFrame):
    df2 = posts[((posts["timestamp"] >= start) & (posts["timestamp"] <= end))]

    return df2


def _get_edge_data(posts: pd.DataFrame) -> pd.DataFrame:
    edges_grouped = posts.groupby(by=["source_r", "target_r"], as_index=False)
    edges = edges_grouped.agg({"sentiment": ["count", "sum"]})
    edges.columns = ["source_r", "target_r", "posts", "sentiment"]

    edges["contention"] = edges["posts"] - np.abs(edges["sentiment"])
    edges["contention_normalized"] = edges["contention"] / edges["posts"]
    edges["sentiment_normalized"] = edges["sentiment"] / edges["posts"]
    edges["color"] = edges["sentiment_normalized"].apply(map_to_color)

    return edges


def _get_node_data(edges: pd.DataFrame) -> pd.DataFrame:
    source_group = edges.groupby(by=["source_r"], as_index=False)
    source_nodes = source_group.agg({"posts": ["count", "sum"], "sentiment": ["sum"]})
    source_nodes.columns = [
        "reddit",
        "outgoing_edges",
        "outgoing_posts",
        "outgoing_sentiment",
    ]

    target_group = edges.groupby(by=["target_r"], as_index=False)
    target_nodes = target_group.agg({"posts": ["count", "sum"], "sentiment": ["sum"]})
    target_nodes.columns = [
        "reddit",
        "incoming_edges",
        "incoming_posts",
        "incoming_sentiment",
    ]

    nodes = pd.merge(source_nodes, target_nodes, on="reddit", how="outer").fillna(0)
    nodes["edges"] = nodes["incoming_edges"] + nodes["outgoing_edges"]
    nodes["posts"] = nodes["incoming_posts"] + nodes["outgoing_posts"]
    nodes["sentiment"] = nodes["incoming_sentiment"] + nodes["outgoing_sentiment"]
    nodes["contention"] = nodes["posts"] - np.abs(nodes["sentiment"])
    nodes["contention_normalized"] = nodes["contention"] / nodes["posts"]
    nodes["contention_normalized"] *= np.sign(nodes["sentiment"])
    nodes["sentiment_normalized"] = nodes["sentiment"] / nodes["posts"]
    nodes["color"] = nodes["sentiment_normalized"].apply(map_to_color)

    return nodes


def get_posts():
    """
    Retrieve post information
    posts = [source_r, target_r, timestamp, sentiment]
    """
    posts = pd.read_feather("data/body_posts.feather")

    duplicated = posts.duplicated(subset=["source_r", "target_r"], keep=False)

    posts = posts[duplicated]

    return posts


def get_nodes_edges(
    posts: pd.DataFrame,
    start=None,
    end=None,
):
    """
    Retrieve edge and node aggregate information (nodes, edges)


    edges = [source_r, target_r, posts, sentiment, contention, contention_normalized]

    nodes = [reddit, outgoing_edges, outgoing_posts, outgoing_sentiment, incoming_edges, incoming_posts, incoming_sentiment, edges, posts, sentiment]
    """
    if start != None and end != None:
        posts = _filter_timeframe(start, end, posts)

    edges = _get_edge_data(posts)
    nodes = _get_node_data(edges)
    return (nodes, edges)


if __name__ == "__main__":
    df = _read_raw_data("data/soc-redditHyperlinks-body.tsv")
    df = df.sort_values("timestamp")
    df = df.reset_index(drop=True)
    df.to_feather("data/body_posts.feather")

    posts = pd.read_feather("data/body_posts.feather")
    print(posts["timestamp"].max() - posts["timestamp"].min())
    print()

    # posts = _filter_timeframe(
    #     pd.Timestamp.now() - pd.Timedelta(days=365 * 8), pd.Timestamp.now(), posts
    # )
    # print(posts.sort_values("timestamp"))

    edges = _get_edge_data(posts)
    print(edges.sort_values("posts"))
    print(edges.columns)

    nodes = _get_node_data(edges)
    print(nodes.sort_values("posts"))
    print(nodes.columns)

    print(map_to_color(1))
    print(map_to_color(0))
    print(map_to_color(-1))
