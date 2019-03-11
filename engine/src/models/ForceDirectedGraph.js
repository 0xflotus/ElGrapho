const ForceDirectedGraph = function(config) {
  let numNodes = config.nodes.colors.length;

  let model = {
    nodes: {
      xs:     [],
      ys:     [],
      colors: []
    },
    edges: [], 
    width: config.width,
    height: config.height
  };

  model.nodes.xs.length = numNodes;
  model.nodes.xs.fill(0);

  model.nodes.ys.length = numNodes;
  model.nodes.ys.fill(0);

  // TODO: need to sort colors first and shuffle edges
  model.nodes.colors = config.nodes.colors;
  model.edges = config.edges;

  let nodes = model.nodes;
  let edges = model.edges;
  
  // initialize positions
  for (let a=0; a<numNodes; a++) {
    let angle = -2 * Math.PI * a / numNodes;
    const K = 0.1;
    nodes.xs[a] = K * Math.cos(angle);
    nodes.ys[a] = K * Math.sin(angle);
  }

  // process steps
  for (let n=1; n<config.steps; n++) {
    let xChanges = [];
    let yChanges = [];

    console.log('=== step ' + n + '===');

    // repulsive forces for all nodes
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
          // for repelling forces, the force is stronger than the distance between the nodes is small
          let K = 1 / (numNodes * numNodes);

          let xChange = -1 * K * xDiff / (dist * dist);
          let yChange = -1 * K * yDiff / (dist * dist);

          xChanges[a] += xChange;
          yChanges[a] += yChange;
        }
      }
    }

    // attractive forces between nodes sharing an edge
    for (let i=0; i<edges.length; i+=2) {
      let a = edges[i];
      let b = edges[i+1];

      let ax = nodes.xs[a];
      let ay = nodes.ys[a];
      let bx = nodes.xs[b];
      let by = nodes.ys[b];
      let xDiff = bx - ax;
      let yDiff = by - ay;
      let dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

      let xChange, yChange;

      if (dist > 0) {
        // for attractive forces, the force is stronger when the nodes are farther apart
        let K = 0.3;
        xChange = K * xDiff;
        yChange = K * yDiff;

        //let changeMagnitude = Math.sqrt(xChange * xChange * yChange * yChange);

        // move a closer to b
        xChanges[a] += xChange;
        yChanges[a] += yChange;

        // move b closer to a
        xChanges[b] -= xChange;
        yChanges[b] -= yChange;
      }



    }

    //debugger;

    // update node positions
    for (let i=0; i<numNodes; i++) {
      //console.log('updating node ' + i + ': (' + nodes.xs[i] + ',' + nodes.ys[i] + ') + (' + xChanges[i] + ',' + yChanges[i] + ')');
      nodes.xs[i] += xChanges[i];
      nodes.ys[i] += yChanges[i];
    }
  }


  console.log(model);

  return model;
};

module.exports = ForceDirectedGraph;