// edytor-mindmap.js
import { addTask, editTask, deleteTask, listTasks }   from "../api_bd_tasks.js";
import { addProject, editProject, deleteProject, listProjects }
                                                    from "../api_bd_projects.js";
import { addUser, editUser, deleteUser, listUsers }  from "../api_bd_users.js";
import { addGroupRequest, deleteGroupRequest, listGroupRequests }
                                                    from "../api_bd_groupRequests.js";
import { addMindMapTaskFunction }                   from "./script.js";

const userId = parseInt(sessionStorage.getItem("user_id"), 10);

// Set up SVG & zoom container
const width  = window.innerWidth,
      height = window.innerHeight;
const svg = d3.select("#mindmap")
  .attr("width",  width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", ({transform}) => container.attr("transform", transform)))
  .on("dblclick.zoom", null);
const defs = svg.append("defs");
defs.append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#333");
const container = svg.append("g");

let nodes = [], links = [], idCounter = 0;
let linkPath = container.selectAll(".link"),
    nodeGroup = container.selectAll(".node");

// 1) Rectangle–edge intersection helper
function intersectRectEdge(sx, sy, tx, ty, cx, cy, hw, hh) {
  const dx = tx - sx, dy = ty - sy;
  const ts = [
    { t: (cx - hw - sx)/dx, edge: "left" },
    { t: (cx + hw - sx)/dx, edge: "right" },
    { t: (cy - hh - sy)/dy, edge: "top" },
    { t: (cy + hh - sy)/dy, edge: "bottom" }
  ];
  let best = null;
  for (const {t, edge} of ts) {
    if (t > 0 && t <= 1) {
      const ix = sx + dx*t, iy = sy + dy*t;
      if (
        (edge === "left"  || edge === "right")  && iy >= cy-hh && iy <= cy+hh ||
        (edge === "top"   || edge === "bottom") && ix >= cx-hw && ix <= cx+hw
      ) {
        if (!best || t < best.t) best = {t, ix, iy};
      }
    }
  }
  return best ? { x: best.ix, y: best.iy } : { x: tx, y: ty };
}

// 2) Single tick handler
function ticked() {
  linkPath
    .attr("d", d => {
      const sx  = d.source.x, sy  = d.source.y;
      const tx  = d.target.x, ty  = d.target.y;
      const shw = d.source.width  / 2,
            shh = d.source.height / 2,
            thw = d.target.width  / 2,
            thh = d.target.height / 2;

      const start = intersectRectEdge(sx, sy, tx, ty, sx, sy, shw, shh);
      const end   = intersectRectEdge(tx, ty, sx, sy, tx, ty, thw, thh);

      const mx  = (start.x + end.x)/2,
            my  = (start.y + end.y)/2,
            dx  = end.x - start.x,
            dy  = end.y - start.y,
            len = Math.hypot(dx, dy),
            curv = d.curvature || 30,
            ox  = len ? -dy/len * curv : 0,
            oy  = len ?  dx/len * curv : 0;

      return `M${start.x},${start.y} Q${mx+ox},${my+oy} ${end.x},${end.y}`;
    })
    .attr("marker-end", "url(#arrow)");

  nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
}

// Build / update the graph
function restart() {
  // Links
  linkPath = container.selectAll(".link")
    .data(links, d => d.id);
  linkPath.exit().remove();
  linkPath = linkPath.enter()
    .append("path")
      .attr("class", "link")
      .on("click", (e,d) => {
        e.stopPropagation();
        [d.source, d.target] = [d.target, d.source];
        restart();
      })
    .merge(linkPath)
      .attr("marker-end", "url(#arrow)");

  // Nodes
  nodeGroup = container.selectAll(".node")
    .data(nodes, d => d.id);
  nodeGroup.exit().remove();
  const ngEnter = nodeGroup.enter()
    .append("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", (e,d) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (e,d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e,d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

  // Placeholder rect (will resize below)
  ngEnter.append("rect")
    .attr("class", "node-rect")
    .attr("width",  1)
    .attr("height", d => d.r*2)
    .attr("x",      0)
    .attr("y",      d => -d.r)
    .attr("rx",     10)
    .attr("ry",     10)
    .attr("fill",   d => d.color)
    .on("contextmenu", (e,d) => {
      e.preventDefault();
      const [px, py] = [e.pageX, e.pageY];
      showColorPicker(px, py, d.color, col => {
        d.color = col; restart();
      });
    });

  // Main label
  ngEnter.append("text")
    .attr("class", "node-label")
    .attr("dy", ".35em")
    .text(d => d.text);

  // “+” icon for adding subtasks
  ngEnter.append("text")
  .filter(d => d.parentId === null)
    .attr("class", "add-subtask")
    .attr("x", d => -4)
    .attr("y", d => -d.r + 12)
    .attr("font-size", "16px")
    .text("+")
    .on("click", (e,d) => {
      e.stopPropagation();
      if (d.parentId===null && d.color==="#98c0ea") {
        addMindMapTaskFunction(document.createElement("div"), d.text);
      } else {
        const txt = prompt("Tekst pod-zadania:",""); if (!txt) return;
        addNode(txt, d.x+150, d.y, 30, d.id);
        restart();
      }
    });

    function getTextWidth(text, fontSize, fontFamily) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = `${fontSize}px ${fontFamily}`;
        return context.measureText(text).width;
    }
    
    // Resize each rect to fit its label
    ngEnter.each(function(d) {
        const g = d3.select(this),
              label = g.select("text.node-label").text(), // Get the actual label text
              fontSize = 16,
              fontFamily = "sans-serif",
              tw = getTextWidth(label, fontSize, fontFamily), // Use label text here
              pad = 10,
              w = tw + pad, // Calculate width of rect
              h = d.r * 2;  // Calculate height of rect
    
        console.log("Text width:", tw);
        console.log("Label:", label);
    
        g.select("rect")
         .attr("width", w)
         .attr("height", h)
         .attr("x", -w / 2)
         .attr("y", -h / 2);
    
        d.width = w;   // Set width on data object
        d.height = h;  // Set height on data object
    });
    

  // Merge and kick simulation
  nodeGroup = ngEnter.merge(nodeGroup);
  nodeGroup.select("rect").attr("fill", d => d.color);

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(0.5).restart();
}

// Add a new node (project or task)
function addNode(text, x, y, radius=40, parentId=null) {
  const node = {
    id:       `n${idCounter++}`,
    text,
    x, y,
    r:        radius,
    parentId,
    color:    parentId===null ? "#98c0ea" : "#ffff99",
    curvature: 30
  };
  nodes.push(node);
  if (parentId != null) {
    links.push({
      id:       `l${parentId}-${node.id}`,
      source:   parentId,
      target:   node.id,
      curvature: 30
    });
  }
  return node;
}

// Initial simulation setup
const simulation = d3.forceSimulation(nodes)
  .force("link",      d3.forceLink(links).id(d=>d.id).distance(120))
  .force("charge",    d3.forceManyBody().strength(-200))
  .force("center",    d3.forceCenter(width/2, height/2))
  .force("collision", d3.forceCollide().radius(d=>d.r+5))
  .on("tick", ticked);

// Color picker helper
function showColorPicker(x, y, currentColor, callback) {
  const input = document.createElement("input");
  input.type              = "color";
  input.value             = currentColor;
  input.style.position    = "absolute";
  input.style.left        = `${x}px`;
  input.style.top         = `${y}px`;
  document.body.appendChild(input);
  input.focus();
  input.addEventListener("input", ()=>callback(input.value));
  input.addEventListener("blur", ()=>document.body.removeChild(input));
}

// Load data into mind-map
function showMindMap() {
  listProjects(userId).then(({projects=[]})=>{
    nodes.length = 0; links.length = 0;
    restart();
    const promises = projects.map(proj =>
      listTasks(proj.id).then(({tasks=[]})=>{
        const pNode = addNode(proj.name, width/2, height/2, 50, null);
        tasks.forEach(task => {
          addNode(task.text,
                  pNode.x + (Math.random()*200-100),
                  pNode.y + (Math.random()*200-100),
                  30,
                  pNode.id);
        });
      })
    );
    Promise.all(promises).then(restart);
  });
}

// Initial render
showMindMap();
window.showMindMap = showMindMap;
export { showMindMap };
