import { Config } from "./config.js";
import { createLinksObject } from "./d3/formatEdges.js";
import { createNodesObject } from "./d3/formatNodes.js";
import { parseData } from "./d3/parseData.js";
import { Network } from "./d3/Network.js";

let data = await parseData("http://localhost:4000");
let config = new Config();

let edges = createLinksObject(data);
let nodes = createNodesObject(data, config);

let network = new Network(config);

network.draw(nodes, edges);
