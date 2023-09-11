
const calculateGrid = (connections, leftToRight = true) => {
    // Function to build a tree from connections using DFS
    function buildTree(connections, rootNode) {
        const tree = {};

        function dfs(node, parent) {
            if (!tree[node]) {
                tree[node] = {
                    children: [],
                };
            }

            for (const [from, to] of connections) {
                if (from === node && to !== parent) {
                    tree[node].children.push(to);
                    dfs(to, from);
                } else if (to === node && from !== parent) {
                    tree[node].children.push(from);
                    dfs(from, to);
                }
            }
        }

        dfs(rootNode, null);
        return tree;
    }

    // Specify the root node
    const rootNode = "A";

    // Build the tree
    const tree = buildTree(connections, rootNode);

    // Function to lay out the tree on a grid
    function layoutTree(tree, node, x, y, spacing) {
        if (!tree[node]) {
            return;
        }

        tree[node].x = x;
        tree[node].y = y;

        const children = tree[node].children;
        const numChildren = children.length;
        const xOffset = numChildren > 1 ? (numChildren - 1) * spacing : 0;

        let childX = x - xOffset / 2;
        let childY = y + 1;

        for (const child of children) {
            layoutTree(tree, child, childX, childY, spacing);
            childX += spacing;
        }
    }

    // Lay out the tree on a grid
    layoutTree(tree, rootNode, 0, 0, 1);
    const lowestY = Math.min(...Object.values(tree).map((node) => node.y));
    const highestY = Math.max(...Object.values(tree).map((node) => node.y));
    const height = highestY - lowestY + 1;
    const lowestX = Math.min(...Object.values(tree).map((node) => node.x));
    const highestX = Math.max(...Object.values(tree).map((node) => node.x));
    const width = highestX - lowestX + 1;
    console.log(`Height: ${height}, Width: ${width}`);
    console.log(`Lowest X: ${lowestX}, Highest X: ${highestX}`);
    console.log(`Lowest Y: ${lowestY}, Highest Y: ${highestY}`);
    if (lowestX < 0) {
        for (const node of Object.values(tree)) {
            node.x -= lowestX;
        }
    }
    if (lowestY < 0) {
        for (const node of Object.values(tree)) {
            node.y -= lowestY;
        }
    }
    for (const node of Object.values(tree)) {
        node.x = 2 * node.x + 1;
        node.y = 2 * node.y + 1;
    }
    if (leftToRight)
        return Object.keys(tree).map(emoji => ({ emoji, x: tree[emoji].y, y: tree[emoji].x, label: emoji }));
    else
        return Object.keys(tree).map(emoji => ({ emoji, x: tree[emoji].x, y: tree[emoji].y, label: emoji }));
}







// Function to print the grid to the console
const printGrid = (grid) => {
    console.log(grid.map(x => x.join(' ')).join('\n'));
};

getNodesAndEdges = (text) => {

    const lines = text.trim().split('\n');
    console.log(lines)
    // Initialize empty arrays for nodes and edges
    const nodes = [];
    const edges = [];
    const map = {};
    const nodesLabelMap = {};

    // Parse the syntax and populate the nodes and edges arrays
    lines.forEach((rule) => {
        const parts = rule.split(/\s*->\s*/);
        const source = parts[0];
        const targetsAndLabel = parts[1].split(/\s*:\s*/);
        const label = targetsAndLabel[1];
        const targets = targetsAndLabel[0].split(/,\s*/); // Split multiple targets by comma and optional space

        // Add source node to the array of nodes if not already present
        if (!nodes.includes(source)) {
            map[source] = nodes.length;
            nodes.push(source);
        }

        // Add target nodes to the array of nodes if not already present
        targets.forEach((target) => {
            if (!nodes.includes(target)) {
                map[target] = nodes.length;
                nodes.push(target);
            }

            // Add edges with labels
            edges.push({ source, target, sourceIndex: map[source], targetIndex: map[target], label });
        });
    });

    return { nodes, edges };
};


const pointsFromBox = (x, y) => {
    x = x - 1;
    y = y - 1;
    return {
        top_left: { x: boxSize * x, y: boxSize * y },
        top_middle: { x: boxSize * x + boxSize / 2, y: boxSize * y },
        top_right: { x: boxSize * (x + 1), y: boxSize * y },
        middle_left: { x: boxSize * x, y: boxSize * y + boxSize / 2 },
        middle_middle: {
            x: boxSize * x + boxSize / 2,
            y: boxSize * y + boxSize / 2,
        },
        middle_right: { x: boxSize * (x + 1), y: boxSize * y + boxSize / 2 },
        bottom_left: { x: boxSize * x, y: boxSize * y + boxSize },
        bottom_middle: { x: boxSize * x + boxSize / 2, y: boxSize * y + boxSize },
        bottom_right: { x: boxSize * (x + 1), y: boxSize * y + boxSize },
    };
};

// const grid = Array.from({ length: 8 }, () => Array(8).fill('_'));

// Print the grid
// printGrid(grid);

// Draw the grid
const drawImg = (svg, data, connections) => {
    // const svg = d3.select('#chart');
    if (drawGrid) {
        const numCols = 8; // Number of columns
        const numRows = 8; // Number of rows

        // Create a group for the grid squares
        const grid = svg.append('g');

        // Create the grid squares
        for (let i = 0; i < numCols; i++) {
            for (let j = 0; j < numRows; j++) {
                grid
                    .append('rect')
                    .attr('x', i * boxSize)
                    .attr('y', j * boxSize)
                    .attr('width', boxSize)
                    .attr('height', boxSize)
                    .attr('fill', 'none')
                    .attr('stroke', 'black');
            }
        }
    }
    const distance = (x1, y1, x2, y2) =>
        Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const getLine = (source, target) => {
        const sourceBox = pointsFromBox(source.x, source.y);
        const targetBox = pointsFromBox(target.x, target.y);
        const possibilities = [
            { source: 'middle_right', target: 'middle_left' },
            { source: 'bottom_right', target: 'middle_left' },
            { source: 'bottom_middle', target: 'top_middle' },
            { source: 'middle_left', target: 'middle_right' },
            { source: 'bottom_left', target: 'top_right', minAngle: 1 },
            { source: 'top_middle', target: 'bottom_middle' },
            { source: 'top_right', target: 'bottom_left' },
            { source: 'top_right', target: 'middle_left' },
            { source: 'middle_left', target: 'middle_right' },
            { source: 'top_right', target: 'middle_left' },
            { source: 'bottom_middle', target: 'top_right' },
            { source: 'top_middle', target: 'bottom_right' },
            { source: 'top_left', target: 'bottom_right' },
            { source: 'bottom_right', target: 'top_left' },
            { source: 'bottom_left', target: 'middle_right' },
        ];

        const lines = possibilities
            .map((tag) => ({
                sourceTag: tag.source,
                targetTag: tag.target,
                distance: distance(
                    sourceBox[tag.source].x,
                    sourceBox[tag.source].y,
                    targetBox[tag.target].x,
                    targetBox[tag.target].y
                ),
                source: sourceBox[tag.source],
                target: targetBox[tag.target],
                center: {
                    x: (sourceBox[tag.source].x + targetBox[tag.target].x) / 2.0,
                    y: (sourceBox[tag.target].y + targetBox[tag.source].y) / 2.0,
                },
            }))
            .sort((a, b) => a.distance - b.distance);

        let line = lines.shift();
        const angle =
            Math.atan2(
                line.target.y - line.source.y,
                line.target.x - line.source.x
            ) *
            (180 / Math.PI);
        if ((angle === 0 || angle === 180) && (
            (line.sourceTag.includes('top_') && line.targetTag.includes('bottom_'))
            || (line.targetTag.includes('top_') && line.sourceTag.includes('bottom_'))
        )) {
            line = lines.shift();
        }
        return line;
    };
    const connectionsWithLines = connections.map((x) => ({
        ...x,
        line: getLine(data[x.source], data[x.target]),
    }));
    const XcG = (x) => x * boxSize - boxSize / 2;
    const YcG = (y) => y * boxSize - boxSize / 3;

    // Draw emojis and labels
    svg
        .selectAll('text.emoji')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'emoji')
        .attr('x', (d) => XcG(d.x))
        .attr('y', (d) => YcG(d.y))
        .attr('font-family', 'Roboto, sans-serif')
        .attr('font-size', `${iconFontSize}px`)
        .attr('text-anchor', 'middle')
        .text((d) => d.emoji);

    svg
        .selectAll('text.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', (d) => XcG(d.x))
        .attr('y', (d) => YcG(d.y) + boxSize / 4)
        .attr('font-family', 'Roboto, sans-serif')
        .attr('font-size', `${labelFontSize}px`)
        .attr('text-anchor', 'middle')

        .text((d) => d.label);
    // console.log(connectionsWithLines);
    // Draw arrows with custom arrowhead and labels for connections
    svg
        .selectAll('line')
        .data(connectionsWithLines)
        .enter()
        .append('line')
        .attr('stroke-width', 3)
        .attr('stroke', lineColor)
        .attr('x1', (d) => d.line.source.x)
        .attr('y1', (d) => d.line.source.y)
        .attr('x2', (d) => d.line.target.x)
        .attr('y2', (d) => d.line.target.y);

    svg
        .selectAll('polygon.arrowhead')
        .data(connectionsWithLines)
        .enter()
        .append('polygon')
        .attr('stroke', lineColor)
        .attr('fill', lineColor)
        .attr('class', 'arrowhead')
        .attr('points', '0,-5 10,0 0,5')
        .attr('transform', (d) => {
            const angle =
                Math.atan2(
                    d.line.target.y - d.line.source.y,
                    d.line.target.x - d.line.source.x
                ) *
                (180 / Math.PI);
            return `translate(${d.line.target.x}, ${d.line.target.y}) rotate(${angle})`;
        }); // .attr("transform", "rotate(45)")

    if (showTextBg) {
        svg
            .selectAll('rect.connection-label-bg')
            .data(connectionsWithLines)
            .enter()
            .append('rect')
            .attr('class', 'connection-label-bg')
            .attr('transform', (d) => {
                let angle =
                    Math.atan2(
                        d.line.target.y - d.line.source.y,
                        d.line.target.x - d.line.source.x
                    ) *
                    (180 / Math.PI);
                angle = angle > 360 ? angle % 360 : angle;
                angle = angle < 0 ? 180 + angle : angle;
                angle = angle > 90 ? angle - 180 : angle;
                // console.log(angle);
                const xoffset = 5 * (angle < 0 ? -1 : 1);
                const yoffset = -5;
                return `translate(${d.line.target.x + xoffset + 12}, ${d.line.target.y + yoffset - 12
                    }) rotate(${angle})`;
            })
            .attr('width', 90) // Adjust the width
            .attr('height', 20) // Adjust the height
            .attr('fill', textBgColor); // Background color
    }

    svg
        .selectAll('text.connection-label')
        .data(connectionsWithLines)
        .enter()
        .append('text')
        .attr('fill', 'black')
        .attr('class', 'connection-label')
        .attr('font-family', 'Roboto, sans-serif')
        .attr('font-size', '14px')
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => {
            let angle =
                Math.atan2(
                    d.line.target.y - d.line.source.y,
                    d.line.target.x - d.line.source.x
                ) *
                (180 / Math.PI);
            angle = angle > 360 ? angle % 360 : angle;
            angle = angle < 0 ? 180 + angle : angle;
            angle = angle > 90 ? angle - 180 : angle;
            // console.log(angle);
            const xoffset = 5 * (angle < 0 ? -1 : 1);
            const yoffset = -5;
            return `translate(${d.line.center.x + xoffset}, ${d.line.center.y + yoffset
                }) rotate(${angle})`;
        })
        .text((d) => d.label);
}




// Get a reference to the textarea element
var textarea = document.getElementById("myTextarea");

const boxSize = 100;
const labelFontSize = 18;
const iconFontSize = 60;
const drawGrid = false;
const textColor = 'black';
const lineColor = 'black';
const textBgColor = 'red';
const showTextBg = false;

// Add an event listener for the onChange event
textarea.addEventListener("change", function () {
    // This function will be called when the textarea content changes
    console.log(textarea.value);

    const svg = d3.select("#chart");

    // Remove the SVG element and its content from the DOM
    svg.remove();

    // Create a new container element to hold the SVG
    const container = d3.select("body"); // Select an existing container element

    // Create a new SVG element and add it to the container
    const newSvg = container.append("svg")
        .attr("id", "chart")
        .attr("width", 10000)
        .attr("height", 10000);






    //'A -> B: Slow.\nA -> C, D: Fast.\nE -> D: Great'

    const { nodes, edges } = getNodesAndEdges(textarea.value);
    console.log(nodes);
    console.log(edges);
    // console.log(edges.map(x => [x.source, x.target]));
    // calculateGrid([
    //     ["A", "B"],
    //     ["A", "C"],
    //     ["A", "D"],
    //     ["E", "D"],
    // ]);
    const data = calculateGrid(edges.map(x => [x.source, x.target]));
    const connections = edges.map(x => ({ source: x.sourceIndex, target: x.targetIndex, label: x.label }));
    // Sample data representing emojis and connections
    // const data = [
    //     { emoji: '🏝️', label: 'Emoji 1', x: 1, y: 2.5 },
    //     { emoji: '🎟️', label: 'Emoji 2', x: 3, y: 1 },
    //     { emoji: '🚀', label: 'Emoji 3', x: 3, y: 2.5 },
    //     { emoji: '🎽', label: 'Emoji 4', x: 3, y: 3.5 },
    //     { emoji: '🐉', label: 'Emoji 5', x: 5, y: 3.5 },
    // ];

    // const connections = [
    //     { source: 0, target: 1, label: 'Connection 1' },
    //     { source: 0, target: 2, label: 'Fast!' },
    //     { source: 0, target: 3, label: 'Bad!' },
    //     { source: 4, target: 3, label: 'Great!' },
    // ];

    drawImg(newSvg, data, connections);


});

