export function radialForce(strength, nodes) {
    const force = (alpha) => {
        for (let i = 0, n = nodes.length, node; i < n; ++i) {
            node = nodes[i];

            // Calculate the distance from the center
            const distance = Math.sqrt(node.x ** 2 + node.y ** 2);

            // Calculate the force based on distance
            const k = (alpha * strength) / (distance + 150);

            // Update the velocity of the node
            node.vx -= node.x * k;
            node.vy -= node.y * k;
        }
    };

    return force;
}
