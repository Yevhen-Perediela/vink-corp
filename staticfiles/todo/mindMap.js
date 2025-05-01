import { addTask, editTask, deleteTask, listTasks } from "../api_bd_tasks.js";
import {
  addProject,
  editProject,
  deleteProject,
  listProjects,
} from "../api_bd_projects.js";
import { addUser, editUser, deleteUser, listUsers } from "../api_bd_users.js";
import {
  addGroupRequest,
  deleteGroupRequest,
  listGroupRequests,
} from "../api_bd_groupRequests.js";

import { addMindMapTaskFunction } from "./script.js"; // popraw ścieżkę, jeśli trzeba

var userId = 10;

const width = window.innerWidth,
  height = window.innerHeight;
const svg = d3
  .select("#mindmap")
  .attr("width", width)
  .attr("height", height)
  .call(
    d3
      .zoom()
      .on("zoom", (event) => container.attr("transform", event.transform))
  )
  .on("dblclick.zoom", null);

const defs = svg.append("defs");
defs
  .append("marker")
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
let nodes = [],
  links = [],
  idCounter = 0;

const simulation = d3
  .forceSimulation(nodes)
  .force(
    "link",
    d3
      .forceLink(links)
      .id((d) => d.id)
      .distance(120)
  )
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force(
    "collision",
    d3.forceCollide().radius((d) => d.r + 5)
  )
  .on("tick", ticked);

function showColorPicker(x, y, currentColor, callback) {
  const input = document.createElement("input");
  input.type = "color";
  input.value = currentColor;
  input.style.position = "absolute";
  input.style.left = x + "px";
  input.style.top = y + "px";
  document.body.appendChild(input);
  input.focus();
  input.addEventListener("input", () => callback(input.value));
  input.addEventListener("blur", () => document.body.removeChild(input));
}

function borderPoint(src, tgt, r) {
  const dx = tgt.x - src.x,
    dy = tgt.y - src.y;
  if (dx === 0 && dy === 0) return { x: src.x, y: src.y };
  const tx = r / Math.abs(dx || 1e-6);
  const ty = r / Math.abs(dy || 1e-6);
  const t = Math.min(tx, ty);
  return { x: src.x + dx * t, y: src.y + dy * t };
}

function ticked() {
  linkPath.attr("d", (d) => {
    const start = borderPoint(d.source, d.target, d.source.r);
    const end = borderPoint(d.target, d.source, d.target.r);
    const mx = (start.x + end.x) / 2,
      my = (start.y + end.y) / 2;
    const dx = end.x - start.x,
      dy = end.y - start.y;
    const len = Math.hypot(dx, dy);
    const ox = len ? (-dy / len) * d.curvature : 0;
    const oy = len ? (dx / len) * d.curvature : 0;
    return `M${start.x},${start.y} Q${mx + ox},${my + oy} ${end.x},${end.y}`;
  });
  nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
}

function restart() {
  linkPath = container.selectAll(".link").data(links, (d) => d.id);
  linkPath.exit().remove();
  linkPath = linkPath
    .enter()
    .append("path")
    .attr("class", "link")
    .on("click", (event, d) => {
      event.stopPropagation();
      [d.source, d.target] = [d.target, d.source];
      restart();
    })
    .merge(linkPath)
    .attr("marker-end", "url(#arrow)");

  nodeGroup = container.selectAll(".node").data(nodes, (d) => d.id);
  nodeGroup.exit().remove();
  const ngEnter = nodeGroup
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

  ngEnter
    .append("rect")
    .attr("class", "node-rect")
    .attr("x", (d) => -d.r)
    .attr("y", (d) => -d.r)
    .attr("width", (d) => d.r * 2)
    .attr("height", (d) => d.r * 2)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", (d) => d.color)
    .on("contextmenu", (event, d) => {
      event.preventDefault();
      const [px, py] = [event.pageX, event.pageY];
      showColorPicker(px, py, d.color, (color) => {
        d.color = color;
        restart();
      });
    });

  ngEnter
    .append("text")
    .attr("dy", ".35em")
    .text((d) => d.text);
    ngEnter.append("text").attr("class", "add-subtask")
    .attr("x", d => d.r - 8)
    .attr("y", d => -d.r + 12)
    .attr("font-size", "16px").text("+")
    .on("click", (event, d) => {
      event.stopPropagation();
      if (d.parentId === null && d.color === "#98c0ea") {
        // niebieski – projekt
        const fakeElement = document.createElement("div"); // placeholder wymagany przez addMindMapTaskFunction
        addMindMapTaskFunction(fakeElement, d.text); // d.text = nazwa projektu
      } else {
        // żółty – zadanie → dodaj lokalnie w mapie
        const txt = prompt("Tekst pod-zadania:", "");
        if (!txt) return;
        addNode(txt, d.x + 150, d.y, 30, d.id);
        restart();
      }
    });

  nodeGroup = ngEnter.merge(nodeGroup);
  nodeGroup.select("rect").attr("fill", (d) => d.color);

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(0.5).restart();
}

function addNode(text, x, y, radius = 40, parentId = null) {
  const defaultColor = parentId == null ? "#98c0ea" : "#ffff99";
  const node = {
    id: `n${idCounter++}`,
    text,
    x,
    y,
    r: radius,
    parentId,
    color: defaultColor,
  };
  nodes.push(node);
  if (parentId != null)
    links.push({
      id: `l${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      curvature: 30,
    });
  return node;
}

// document.getElementById("addRoot").addEventListener("click", () => {
//   const txt = document.getElementById("newText").value.trim(); if (!txt) return;
//   addNode(txt, width/2, height/2, 40, null); restart();
//   document.getElementById("newText").value = "";
// });

function showMindMap() {
  listProjects(userId).then(({ projects = [] }) => {
    // 1) wyczyść stan
    nodes.length = 0;
    links.length = 0;
    restart();

    // 2) dla każdego projektu pobierz zadania i dodaj węzły
    const promises = projects.map((project) => {
      // dodaj węzeł projektu
      const projectNode = addNode(
        project.name,
        width / 2,
        height / 2,
        50,
        null
      );

      // pobierz zadania dla tego projektu
      return listTasks(project.id).then(({ tasks = [] }) => {
        tasks.forEach((task) => {
          addNode(
            task.text,
            projectNode.x + Math.random() * 200 - 100,
            projectNode.y + Math.random() * 200 - 100,
            30,
            projectNode.id
          );
        });
      });
    });

    // 3) po wstawieniu wszystkich projektów i zadań – odpal restart raz jeszcze
    Promise.all(promises).then(() => {
      restart();
    });
  });
}

showMindMap();

window.showMindMap = showMindMap;

export { showMindMap };

let linkPath = container.selectAll(".link"),
  nodeGroup = container.selectAll(".node");
restart();
