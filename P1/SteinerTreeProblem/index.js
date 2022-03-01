var fs = require("fs");
var path = process.cwd();
var buffer = fs.readFileSync("./steiner_in.txt");
var data = buffer.toString();

var dataArr = data.split("\n");
let info = dataArr.shift();

let Last_steiner_index = parseInt(info.split(" ")[0]);
let last_terminal_index =
  parseInt(info.split(" ")[0]) + parseInt(info.split(" ")[1]);

let steiner_V = dataArr.slice(0, Last_steiner_index);
let terminal_V = dataArr.slice(Last_steiner_index, last_terminal_index);
let edges = dataArr.slice(last_terminal_index);

edges = edges.map((item) => [
  parseInt(item.split(" ")[0]),
  parseInt(item.split(" ")[1]),
]);

// weigh of edge[i] = edges_dis[i]
let edges_dis = edges.map((edge) => {
  let fst_index = edge[0];
  let scd_index = edge[1];

  let fst_node =
    fst_index < Last_steiner_index
      ? steiner_V[fst_index]
      : terminal_V[fst_index - 240];
  let scd_node =
    scd_index < Last_steiner_index
      ? steiner_V[scd_index]
      : terminal_V[scd_index - 240];

  let fst_V = {
    x: parseInt(fst_node.split(" ")[0]),
    y: parseInt(fst_node.split(" ")[1]),
  };

  let scd_V = {
    x: parseInt(scd_node.split(" ")[0]),
    y: parseInt(scd_node.split(" ")[1]),
  };

  let distance = Math.floor(
    Math.sqrt(Math.pow(scd_V.x - fst_V.x, 2) + Math.pow(scd_V.y - fst_V.y, 2))
  );
  return distance;
});

let terminal_edges = [];
terminal_V.forEach((item, j) => {
  let inner_edges = [];
  edges.forEach((edge, i) => {
    if (edge[0] == j + Last_steiner_index || edge[1] == j + Last_steiner_index)
      inner_edges.push(i);
  });
  terminal_edges.push(inner_edges);
});

let max_edge = Math.max(...edges_dis);
graph = {
  steiner_V: steiner_V,
  terminal_V: terminal_V,
  edges: edges,
  edges_dis: edges_dis,
  max_edge: max_edge,
  terminal_edges: terminal_edges,
};

//=======================================================================================================
const Genetic = require("genetic-js");
var genetic = Genetic.create();
var lastFitness = 0;
genetic.optimize = Genetic.Optimize.Minimize;
genetic.select1 = Genetic.Select1.Random;
genetic.select2 = Genetic.Select2.FittestRandom;

genetic.seed = function () {
  const len = this.userData.graph.edges.length;
  const chrom = new Array(len).fill(0);
  let count = Math.floor(Math.random() * len);
  while (count > 0) {
    const i = Math.floor(Math.random() * len);
    if (chrom[i] === 0) {
      chrom[i] = Math.random() > 0.5 ? 1 : 0;
      if (chrom[i] === 1) {
        count--;
      }
    }
  }
  let terr = this.userData.graph.terminal_edges;
  terr.forEach((item) => {
    chrom[item[Math.floor(Math.random() * item.length)]] = 1;
  });
  return chrom;
};

genetic.mutate = function (entity) {
  let randomIndex = Math.floor(
    Math.random() * this.userData.graph.edges.length
  );
  entity[randomIndex] = 1 - entity[randomIndex];

  let terr = this.userData.graph.terminal_edges;
  terr.forEach((item) => {
    entity[item[Math.floor(Math.random() * item.length)]] = 1;
  });
  return entity;
};

genetic.crossover = function (mother, father) {
  var len = mother.length;
  let motheStr = mother.join("");
  let fatherStr = father.join("");

  var ca = Math.floor(Math.random() * len);
  var cb = Math.floor(Math.random() * len);
  if (ca > cb) {
    var tmp = cb;
    cb = ca;
    ca = tmp;
  }

  var son =
    fatherStr.substr(0, ca) +
    motheStr.substr(ca, cb - ca) +
    fatherStr.substr(cb);
  var daughter =
    motheStr.substr(0, ca) +
    fatherStr.substr(ca, cb - ca) +
    motheStr.substr(cb);

  son = [...son];
  daughter = [...daughter];

  son = son.map((s) => parseInt(s));
  daughter = daughter.map((d) => parseInt(d));

  let terr = this.userData.graph.terminal_edges;

  return [son, daughter];
};

genetic.fitness = function (entity) {
  const jsgraphs = require("js-graph-algorithms");

  const vs = [];
  entity.forEach((item, i) => {
    if (item === 1) {
      if (!vs.includes(this.userData.graph.edges[i][0]))
        vs.push(this.userData.graph.edges[i][0]);
      if (!vs.includes(this.userData.graph.edges[i][1]))
        vs.push(this.userData.graph.edges[i][1]);
    }
  });

  //graph for kruskual
  const jsWeghtedGraph = new jsgraphs.WeightedGraph(vs.length);

  //graph for undirected graph
  const graph = new jsgraphs.Graph(vs.length);

  entity.forEach((item, i) => {
    if (item === 1) {
      jsWeghtedGraph.addEdge(
        new jsgraphs.Edge(
          vs.indexOf(this.userData.graph.edges[i][0]),
          vs.indexOf(this.userData.graph.edges[i][1]),
          this.userData.graph.edges_dis[i]
        )
      );

      graph.addEdge(
        vs.indexOf(this.userData.graph.edges[i][0]),
        vs.indexOf(this.userData.graph.edges[i][1])
      );
    }
  });

  //check if  the graph is undirected add max vall to totalWeight
  var cc = new jsgraphs.ConnectedComponents(graph);

  // calculate weights
  var kruskal = new jsgraphs.KruskalMST(jsWeghtedGraph);
  var mst = kruskal.mst;
  let totalWeight = 0;
  mst.forEach((item) => (totalWeight += item.weight));

  totalWeight +=
    cc.componentCount() > 1
      ? this.userData.graph.max_edge * (cc.componentCount() - 1)
      : 0;

  return totalWeight;
};

genetic.generation = function (pop, generation, stats) {
  // stop running once we've reached the solution
};

genetic.notification = function (pop, generation, stats, isFinished) {
  console.log(
    " genration : " +
      generation +
      "|  growth :" +
      (lastFitness - pop[0].fitness) +
      "|  best fitness :" +
      pop[0].fitness +
      "|  max :" +
      stats.maximum +
      "|  mean :" +
      stats.mean
  );
  lastFitness = pop[0].fitness;

  if (isFinished) {
    //write to file
    fs = require("fs");
    let best_chromosome = pop[0].entity;
    best_chromosome.forEach((item, i) => {
      if (item === 1) {
        const content = i + "\n";

        try {
          fs.writeFileSync("steiner_out.txt", content, { flag: "a+" });
          //file written successfully
        } catch (err) {
          console.error(err);
        }
      }
    });

    try {
      fs.writeFileSync("steiner_out.txt", lastFitness, { flag: "a+" });
      //file written successfully
    } catch (err) {
      console.error(err);
    }

    // drwing graph
    let nodes = [];
    let final_edges = [];
    let steiner_V = this.userData.graph.steiner_V;
    best_chromosome.forEach((item, i) => {
      if (item === 1) {
        let the_edges = this.userData.graph.edges;
        the_edges.forEach((item) =>
          final_edges.push(`{from: "${item[0]}", to:"${item[1]}"}`)
        );
        the_edges.forEach((item) => {
          // terminal_V.includes(item)
          if (item[0] > steiner_V.length)
            nodes.push(`{id: "${item[0]}" , group: "lone"}`);
          else nodes.push(`{id: "${item[0]}"}`);

          if (item[1] > steiner_V.length)
            nodes.push(`{id: "${item[1]}" , group: "lone"}`);
          else nodes.push(`{id: "${item[1]}"}`);
        });
      }
    });

    let htmlFile = `<html>
    <head>
    <script src="https://cdn.anychart.com/releases/8.9.0/js/anychart-core.min.js"></script>
    <script src="https://cdn.anychart.com/releases/8.9.0/js/anychart-bundle.min.js"></script>
    <script src="https://cdn.anychart.com/releases/8.9.0/js/anychart-base.min.js"></script>
    <style>
    html, body, #container {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }</style>
    </head>
    <body>
    <div id="container"></div>
    </body>
    <script>
    anychart.onDocumentReady(function () {
    
        // create data
        var data = {
          nodes:[ ${nodes} 
          ],
          edges:[ ${final_edges}]
            
        };
    
        
        // create a chart and set the data
        var chart = anychart.graph(data);
        var loneWolf = chart.group("lone");
        loneWolf.normal().fill("red");
        // set the chart title
        chart.title("result : the terminal nodes are red");
    
        // set the container id
        chart.container("container");
    
        // initiate drawing the chart
        chart.draw();
    });</script>
    
    </html> 
    `;

    //writing html file
    try {
      fs.writeFileSync("index.html", htmlFile);
      //file written successfully
    } catch (err) {
      console.error(err);
    }
  }
};

var config = {
  iterations: 200,
  size: 1000,
  crossover: 0.65,
  mutation: 0.35,
  skip: 1,
};

var userData = {
  graph: graph,
};

genetic.evolve(config, userData);
