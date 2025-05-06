import { addTask, editTask, deleteTask, listTasks } from "./api_bd_tasks.js";
import {
    addProject,
    editProject,
    deleteProject,
    listProjects,
} from "./api_bd_projects.js";

var userId = parseInt(sessionStorage.getItem("user_id")); // Użyj userId z sessionStorage

var tasksFilter = "my";

function selectTaskFilter(element, newState) {
    tasksFilter = newState === "all" ? "all" : "my";
    showTasks();
    document
      .querySelectorAll("#small-todo > .tasksSelect > div")
      .forEach((element) => {
        element.classList.remove("selectedChatMenu");
      });
    element.classList.add("selectedChatMenu");
  }
  
  globalThis.selectTaskFilter = selectTaskFilter;

  async function showTasks() {
    const tasksResult = document.querySelector(".tasksResult");
    tasksResult.innerHTML = "";
  
    const { projects } = await listProjects(userId);
    let tasksAdded = false;
    for (const project of projects) {
      let { tasks } = await listTasks(project.id);
      for (const task of tasks) {
        if (tasksFilter === "my" && task.assigned_user_id !== userId) continue;
        const bg =
          task.progress === "in_progress"
            ? "rgb(255,132,0)"
            : task.progress === "done"
            ? "rgb(74,229,39)"
            : "rgb(255,69,69)";
        tasksResult.innerHTML += `
            <div class="taskView" onclick="openToDo()"
                 style="background:${bg}">
              <b>${task.text}</b><br>
              <span style="float:right;opacity:.7;">${project.name}</span>
            </div>`;
        tasksAdded = true;
      }
    }
    if (!tasksAdded) {
      tasksResult.innerHTML += "Brak zadań spełniających wybrane filtry.";
    }
  }
  
  globalThis.showTasks = showTasks;

  showTasks();

  function openToDo() {
    window.open(
      "/todo",
      "_self"
);
  } 

  window.openToDo = openToDo;