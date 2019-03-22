// good for 6 nodes
const POSITION_FACTOR = 0.3;
const REPEL_FACTOR = 0.01;
const ATTRACT_FACTOR = 0.1;

const initNodePositions = function(nodes) {
  let numNodes = nodes.colors.length;

  // find color counts
  let colors = [];
  for (let a=0; a<numNodes; a++) {
    let color = nodes.colors[a];

    if (colors[color] === undefined) {
      colors[color] = {
        count: 0
      };
    }

    colors[color].count++;
  }

  let total = 0;
  for (let n=0; n<colors.length; n++) {
    colors[n].next = total;
    total+=colors[n].count;
  }

  // initialize positions
  for (let a=0; a<numNodes; a++) {
    let color = nodes.colors[a];
    let angle = -2 * Math.PI * colors[color].next++ / numNodes;

    nodes.xs[a] = POSITION_FACTOR * Math.cos(angle);
    nodes.ys[a] = POSITION_FACTOR * Math.sin(angle);
  }
};

// repulsive forces for all nodes
// Coulomb's Law -> F = q1 * q2 / d^2
const repelNodes = function(nodes) {
  let numNodes = nodes.colors.length;
  let xChanges = [];
  let yChanges = [];

  for (let a=0; a<numNodes; a++) {
    xChanges[a] = 0;
    yChanges[a] = 0;

    for (let b=0; b<numNodes; b++) {
      let ax = nodes.xs[a];
      let ay = nodes.ys[a];
      let bx = nodes.xs[b];
      let by = nodes.ys[b];
      let xDiff = bx - ax;
      let yDiff = by - ay;
      let dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

      if (dist > 0) {
        // move a away from b
        let xChange = -1 * REPEL_FACTOR * xDiff / (dist * dist);
        let yChange = -1 * REPEL_FACTOR * yDiff / (dist * dist);

        xChanges[a] += xChange;
        yChanges[a] += yChange;
      }
    }
  }
  //update node positions for repulsive forces
  for (let i=0; i<numNodes; i++) {
    nodes.xs[i] += xChanges[i];
    nodes.ys[i] += yChanges[i];
  }
};

// attractive forces between nodes sharing an edge
// Hooke's Law -> F = kx
const attractNodes = function(nodes, edges) {
  let numEdges = edges.from.length;

  for (let i=0; i<numEdges; i++) {
    let a = edges.from[i];
    let b = edges.to[i];

    let ax = nodes.xs[a];
    let ay = nodes.ys[a];
    let bx = nodes.xs[b];
    let by = nodes.ys[b];
    let xDiff = bx - ax;
    let yDiff = by - ay;
    let dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

    let xChange, yChange;

    if (dist > 0) {
      xChange = ATTRACT_FACTOR * xDiff;
      yChange = ATTRACT_FACTOR * yDiff;

      // move a closer to b
      nodes.xs[a] += xChange;
      nodes.ys[a] += yChange;

      // move b closer to a
      nodes.xs[b] -= xChange;
      nodes.ys[b] -= yChange;
    }
  }
};

const ForceDirectedGraph = function(config) {
  let numNodes = config.nodes.colors.length;
  let steps = config.steps === undefined ? 20 : config.steps;

  let model = {
    nodes: {
      xs: [],
      ys: [],
      colors: config.nodes.colors.slice()
    },
    edges: {
      from: config.edges.from.slice(),
      to: config.edges.to.slice()
    },
    width: config.width,
    height: config.height,
    steps: steps
  };

  model.nodes.xs.length = numNodes;
  model.nodes.xs.fill(0);

  model.nodes.ys.length = numNodes;
  model.nodes.ys.fill(0);

  let nodes = model.nodes;
  let edges = model.edges;

  initNodePositions(nodes);

  // process steps
  for (let n=1; n<steps; n++) {
    repelNodes(nodes);
    attractNodes(nodes, edges);
  }

  return model;
};

module.exports = ForceDirectedGraph;