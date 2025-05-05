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

import { showMindMap } from "./mindMap.js";

var userId = 10;

async function showMyProjects() {
  try {
    const { projects } = await listProjects(userId);
    console.log(projects);
    projects.forEach(async (project) => {
      await addProjectFromDBFunction(project.name, project.id);
      refreshSelect();
    });
    showTasks();
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

showMyProjects(); // ← teraz userId zostanie użyty poprawnie

const actions_buttons = document.querySelectorAll(".todo_panel > button");

actions_buttons.forEach((button) => {
  button.addEventListener("click", () => {
    actions_buttons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

function changeToDoView(element) {
  document
    .querySelector(".todo_content")
    .prepend(document.querySelector(`.${element}`));

  //     document.querySelectorAll('.todo_content > div').forEach(div => div.style.display = 'none');

  //   const section = document.querySelector(`.todo_content > .${view}`);
  //   if (section) {
  //     section.style.display = 'block';
  //   }

  if (element === "whiteboard") {
    setTimeout(() => {
      initWhiteboard();
    }, 100);
  }
}

window.changeToDoView = changeToDoView;

async function addProjectFunction() {
  try {
    let everyThingOk = true;
    let projectNameInput = document.querySelector(".add_project_input").value;
    const { projects } = await listProjects(userId);
    console.log("Y" + projects);
    projects.forEach((project) => {
      if (project.name === projectNameInput) {
        everyThingOk = false;
        document.querySelector(".add_project_input").value = "";
        document.querySelector(".add_project_input").placeholder =
          "Projekt już istnieje";
      } else {
        document.querySelector(".add_project_input").placeholder =
          "Nowy projekt";
      }
    });
    if (projectNameInput !== "" && everyThingOk) {
      addProject({
        name: projectNameInput,
        user_id: userId,
      }).then((data) => {
        document.querySelector(
          ".list_contents"
        ).innerHTML += `<div class="todo${projectNameInput}">
            ${projectNameInput}
            <button class="deleteProjectButton" onclick="deleteProjectFunction('todo${projectNameInput}')">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 69 14"
                    class="svgIcon bin-top"
                >
                    <g clip-path="url(#clip0_35_24)">
                        <path
                            fill="black"
                            d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                        ></path>
                    </g>
                    <defs>
                        <clipPath id="clip0_35_24">
                            <rect fill="white" height="14" width="69"></rect>
                        </clipPath>
                    </defs>
                </svg>
      
                <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 69 57"
                class="svgIcon bin-bottom"
                >
                    <g clip-path="url(#clip0_35_22)">
                        <path
                            fill="black"
                            d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                        ></path>
                    </g>
                    <defs>
                        <clipPath id="clip0_35_22">
                            <rect fill="white" height="57" width="69"></rect>
                        </clipPath>
                    </defs>
                </svg>
            </button>
                <div class="addTaskContainer">
                    <input type="text" class="add_task_input" placeholder="Nowe zadanie">
                    <button class="add_task_button" onclick="addTaskFunction(this, '${projectNameInput}')">
                        <div class="line1"><div class="line2"></div></div>
                    </button>
                    <div class="tasksStatusBar todo${projectNameInput}TaskBar" style="--progress-width: 0px">
                        <span class='completedTasksPercents'>0%<span>
                    </div>
                </div>
                <ul>
                    <div>Add a task to start</div>
                </ul>
        </div>`;
        document.querySelector(".add_project_input").value = "";
        showMindMap();
        showTasks();
        drawCalendar(currentDate);
      });
    }
  } catch (error) {
    console.error("Error adding project:", error);
  }
}

window.addProjectFunction = addProjectFunction;

async function addProjectFromDBFunction(projectName, projectId) {
  try {
    let projectNameInput = projectName;
    console.log("::" + projectId);
    const { tasks } = await listTasks(projectId);
    let taskElements =
      tasks.length == 0 ? "<div>Add a task to start</div>" : "";
    const { users } = await listUsers(userId);
    for (const task of tasks) {
      let usersList = "";
      const me = users.find((user) => user.id === userId);
      console.log(me);
      let myGroup;
      if (me.friend_id === null) {
        myGroup = users.filter(
          (user) => user.friend_id === me.id || user.id === me.id
        );
      } else {
        myGroup = users.filter(
          (user) => user.friend_id === me.friend_id || user.id === me.friend_id
        );
      }
      myGroup.forEach((user) => {
        usersList += `<div class="option" project-id="${projectId}" task-name="${task.id}" data-value="${user.id}" data-text="${user.name}">${user.name}</div>`;
      });
      let currentSelectedUser = users.find(
        (user) => user.id === task.assigned_user_id
      );
      let currentSelected = currentSelectedUser.name;
      console.log("T" + task.id);
      taskElements += `<div class="task">
          <label class="taskStatusLabel ${
            task.progress === "in_progress"
              ? "inProgress"
              : task.progress === "done"
              ? "done"
              : ""
          }">
              <input type="checkbox" class="todo${projectName}Task taskStatus" task_status="${
        task.progress
      }" oninput="changeTaskStatus(this, '${projectId}', '${task.id}')" checked>
              <span class="checkmark"></span>
          </label>
          ${task.text}
          <div class="tools">
              <div class="taskPriority">
                <label class="priorityLow">
                    <input type='radio' name='taskPriority${projectName}${
        task.text
      }' oninput="changePriority(this, '${projectName}', '${
        task.text
      }', 'low')" ${task.priority === "low" ? "checked" : ""}>
                </label>
                <label class="priorityMedium">
                    <input type='radio' name='taskPriority${projectName}${
        task.text
      }' oninput="changePriority(this, '${projectName}', '${
        task.text
      }', 'medium')" ${task.priority === "medium" ? "checked" : ""}>
                </label>
                <label class="priorityHigh">
                    <input type='radio' name='taskPriority${projectName}${
        task.text
      }' oninput="changePriority(this, '${projectName}', '${
        task.text
      }', 'high')" ${task.priority === "high" ? "checked" : ""}>
                </label>
              </div>
              <div class="select" data-default="All">
                <div class="selected">${currentSelected}</div>
                <div class="options">
                    ${usersList}
                </div>
            </div>
          </div>
          <button class="delete_task_button" onclick="deleteTaskFunction(this, '${
            task.text
          }', '${projectName}')">
          <div class="line1"><div class="line2"></div></div>
          </button>
      </div>`;
    }
    document.querySelector(
      ".list_contents"
    ).innerHTML += `<div class="todo${projectNameInput} project">
      ${projectNameInput}
        <button class="deleteProjectButton" onclick="deleteProjectFunction(this, '${projectNameInput}')">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 69 14"
            class="svgIcon bin-top"
            >
                <g clip-path="url(#clip0_35_24)">
                    <path
                        fill="black"
                        d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                    ></path>
                </g>
                <defs>
                    <clipPath id="clip0_35_24">
                        <rect fill="white" height="14" width="69"></rect>
                    </clipPath>
                </defs>
            </svg>
      
            <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 69 57"
            class="svgIcon bin-bottom"
            >
                <g clip-path="url(#clip0_35_22)">
                    <path
                        fill="black"
                        d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                    ></path>
                </g>
                <defs>
                    <clipPath id="clip0_35_22">
                        <rect fill="white" height="57" width="69"></rect>
                    </clipPath>
                </defs>
            </svg>
        </button>
            <div class="addTaskContainer">
                <input type="text" class="add_task_input" placeholder="Nowe zadanie">
                <button class="add_task_button" onclick="addTaskFunction(this, '${projectNameInput}')">
                    <div class="line1"><div class="line2"></div></div>
                </button>
                <div class="tasksStatusBar todo${projectNameInput}TaskBar" style="--progress-width: 0px">
                    <span class='completedTasksPercents'>0%<span>
                </div>
            </div>
            <ul>
                ${taskElements}
            </ul>
    </div>`;
    document.querySelector(".add_project_input").value = "";
    changeCompletedTasksPercents(`todo${projectName}Task`);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

async function deleteProjectFunction(element, projectName) {
  try {
    let projectElement = element.parentElement;
    let projectList = document.querySelector(".list_contents");
    const { projects } = await listProjects(userId);
    projects.forEach((project) => {
      if (project.name === projectName) {
        deleteProject(project.id);
        projectList.removeChild(projectElement);
        showMindMap();
        showTasks();
        drawCalendar(currentDate);
      }
    });
  } catch (error) {
    console.log("Error" + error);
  }
}

window.deleteProjectFunction = deleteProjectFunction;

// <input type="checkbox" class="todo${projectName}Task taskStatus" task_status="todo" oninput="changeCompletedTasksPercents('todo${projectName}Task')">

async function addTaskFunction(element, projectName) {
  try {
    let everyThingOk = true;
    let mainElement = element.parentElement;
    let sectionElement = mainElement.parentElement;
    let taskNameInput = mainElement.querySelector(".add_task_input").value;
    let projectId;
    const { projects } = await listProjects(userId);
    projects.forEach(async (project) => {
      if (project.name === projectName) {
        projectId = project.id;
        const { tasks } = await listTasks(projectId);
        console.log("T" + tasks);
        tasks.forEach((task) => {
          if (task.text === taskNameInput) {
            everyThingOk = false;
            mainElement.querySelector(".add_task_input").value = "";
            mainElement.querySelector(".add_task_input").placeholder =
              "Zadanie już istnieje";
          } else {
            mainElement.querySelector(".add_task_input").placeholder =
              "Nowe zadanie";
          }
        });
      }
    });
    if (everyThingOk && taskNameInput !== "" && projectId) {
      if (
        sectionElement.querySelector("ul > div").textContent.trim() ===
        "Add a task to start"
      ) {
        sectionElement.querySelector("ul").innerHTML = "";
      }
      addTask({
        text: taskNameInput,
        priority: "medium",
        progress: "to_do",
        due_date: null,
        project_id: projectId,
        assigned_user_id: userId,
      }).then(async (data) => {
        let usersList = "";
        const { users } = await listUsers(userId);
        const me = users.find((user) => user.id === userId);
        console.log(me);
        let myGroup;
        if (me.friend_id === null) {
          myGroup = users.filter(
            (user) => user.friend_id === me.id || user.id === me.id
          );
        } else {
          myGroup = users.filter(
            (user) =>
              user.friend_id === me.friend_id || user.id === me.friend_id
          );
        }
        myGroup.forEach((user) => {
          usersList += `<div class="option" project-id="${projectId}" task-name="${data.task_id}" data-value="${user.id}" data-text="${user.name}">${user.name}</div>`;
        });
        let currentSelected = me.name;
        sectionElement.querySelector("ul").insertAdjacentHTML(
          "beforeend",
          `<div class="task">
                <label class="taskStatusLabel">
                    <input type="checkbox" class="todo${projectName}Task taskStatus" task_status="to_do" oninput="changeTaskStatus(this, '${projectId}', '${data.task_id}')" checked>
                    <span class="checkmark"></span>
                </label>
                ${taskNameInput}
                <div class="tools">
                    <div class="taskPriority">
                        <label class="priorityLow">
                            <input type='radio' name='taskPriority${projectName}${taskNameInput}' oninput="changePriority(this, '${projectName}', '${taskNameInput}', 'low')">
                        </label>
                        <label class="priorityMedium">
                            <input type='radio' name='taskPriority${projectName}${taskNameInput}' oninput="changePriority(this, '${projectName}', '${taskNameInput}', 'medium')" checked>
                        </label>
                        <label class="priorityHigh">
                            <input type='radio' name='taskPriority${projectName}${taskNameInput}' oninput="changePriority(this, '${projectName}', '${taskNameInput}', 'high')">
                        </label>
                    </div>
                    <div class="select" data-default="All">
                        <div class="selected">${currentSelected}</div>
                        <div class="options">
                        ${usersList}
                        </div>
                    </div>
                </div>
                <button class="delete_task_button" onclick="deleteTaskFunction(this, '${taskNameInput}', '${projectName}')">
                <div class="line1"><div class="line2"></div></div>
                </button>
            </div>`
        );
        mainElement.querySelector(".add_task_input").value = "";
        changeCompletedTasksPercents(`todo${projectName}Task`);
        showMindMap();
        refreshSelect();
        showTasks();
        drawCalendar(currentDate);
      });
    }
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

window.addTaskFunction = addTaskFunction;

async function addMindMapTaskFunction(element, projectName) {
  try {
    const taskNameInput = prompt("Podaj nazwę zadania:");
    if (!taskNameInput) return;

    let projectId = null;
    let taskExists = false;

    const { projects } = await listProjects(userId);

    for (const project of projects) {
      if (project.name === projectName) {
        projectId = project.id;
        const { tasks } = await listTasks(projectId);

        for (const task of tasks) {
          if (task.text === taskNameInput) {
            taskExists = true;
            alert("Zadanie już istnieje");
            break;
          }
        }

        break; // już znaleźliśmy projekt, nie szukamy dalej
      }
    }

    if (taskExists || !projectId) return;

    const newTask = await addTask({
      text: taskNameInput,
      priority: "medium",
      progress: "to_do",
      due_date: null,
      project_id: projectId,
      assigned_user_id: userId,
    });

    console.log("Dodano nowe zadanie do projektu:", projectName, newTask);
    showMindMap();
    drawCalendar(currentDate);
    document.querySelector(".list_contents").innerHTML = "";
    showMyProjects();
  } catch (error) {
    console.error("Error adding task from mind map:", error);
  }
}

window.addMindMapTaskFunction = addMindMapTaskFunction;
export { addMindMapTaskFunction };

async function deleteTaskFunction(element, taskName, projectName) {
  try {
    let taskElement = element.parentElement;
    let sectionElement = taskElement.parentElement;
    const { projects } = await listProjects(userId);
    projects.forEach(async (project) => {
      if (project.name === projectName) {
        let projectId = project.id;
        const { tasks } = await listTasks(projectId);
        tasks.forEach((task) => {
          if (task.text === taskName) {
            deleteTask(task.id);
            sectionElement.removeChild(taskElement);
            showMindMap();
            showTasks();
            drawCalendar(currentDate);
            if (!sectionElement.querySelector("div")) {
              sectionElement.innerHTML = "<div>Add a task to start</div>";
            }
          }
        });
      }
    });
  } catch (error) {
    console.log("Error" + error);
  }
}

window.deleteTaskFunction = deleteTaskFunction;

async function changePriority(element, projectName, taskName, priorityType) {
  try {
    // 1) Pobierz wszystkie projekty
    const { projects = [] } = await listProjects(userId);

    // 2) Znajdź projekt o danej nazwie
    const project = projects.find((p) => p.name === projectName);
    if (!project) {
      console.warn(`Projekt "${projectName}" nie znaleziony`);
      return;
    }

    // 3) Pobierz zadania dla tego projektu
    const { tasks = [] } = await listTasks(project.id);

    // 4) Znajdź zadanie o danej nazwie
    const task = tasks.find((t) => t.text === taskName);
    if (!task) {
      console.warn(
        `Zadanie "${taskName}" w projekcie "${projectName}" nie znalezione`
      );
      return;
    }

    console.log(priorityType);

    // 5) Wyślij update do API i poczekaj na odpowiedź
    const updated = await editTask({
      id: task.id,
      priority: priorityType,
    });
    console.log("Zmieniono priorytet:", updated);

    // 6) (Opcjonalnie) odśwież interfejs, np. przeładuj mapę lub zaktualizuj pojedynczy węzeł:
    showMindMap();
  } catch (error) {
    console.error("Błąd podczas zmiany priorytetu:", error);
  }
}

window.changePriority = changePriority;

async function changeAssignedUser(element) {
  try {
    const { projects } = await listProjects(userId);
    let chosenProject = projects.find(
      (project) => String(project.id) === element.getAttribute("project-id")
    );
    console.log(chosenProject);
    if (chosenProject) {
      const { tasks } = await listTasks(chosenProject.id);
      let chosenTask = tasks.find(
        (task) => String(task.id) === element.getAttribute("task-name")
      );
      if (chosenTask) {
        const selectedUser = element.getAttribute("data-value");
        const { users } = await listUsers(userId);
        let chosenUser = users.find((user) => String(user.id) === selectedUser);
        if (chosenUser) {
          console.log("YYYY");
          showTasks();
          await editTask({
            id: chosenTask.id,
            assigned_user_id: chosenUser.id,
          });
          console.log(
            `Zmieniono przypisanego użytkownika na ${chosenUser.name}`
          );
        } else {
          console.warn(`Nie znaleziono użytkownika o id ${selectedUser}`);
        }
      }
    }
  } catch (error) {
    console.error("Error changing assigned user:", error);
  }
}

window.changeAssignedUser = changeAssignedUser;

async function changeTaskStatus(element, projectId, taskId) {
  try {
    const { projects } = await listProjects(userId);
    let chosenProject = projects.find(
      (project) => String(project.id) === projectId
    );
    if (chosenProject) {
      const { tasks } = await listTasks(chosenProject.id);
      let chosenTask = tasks.find((task) => String(task.id) === taskId);
      if (chosenTask) {
        const newStatus =
          element.getAttribute("task_status") === "to_do"
            ? "in_progress"
            : element.getAttribute("task_status") === "in_progress"
            ? "done"
            : "to_do";
        await editTask({
          id: chosenTask.id,
          progress: newStatus,
        });
        showTasks();
        drawCalendar(currentDate);
        console.log(`Zmieniono status zadania na ${newStatus}`);
      }
    }
  } catch (error) {
    console.error("Error changing task status:", error);
  }
  if (element.getAttribute("task_status") === "to_do") {
    element.checked = true;
    element.setAttribute("task_status", "in_progress");
    element.parentElement.classList.add("inProgress");
  } else if (element.getAttribute("task_status") === "in_progress") {
    element.checked = true;
    element.setAttribute("task_status", "done");
    element.parentElement.classList.remove("inProgress");
    element.parentElement.classList.add("done");
    changeCompletedTasksPercents(`${element.classList[0]}`);
  } else if (element.getAttribute("task_status") === "done") {
    element.checked = true;
    element.setAttribute("task_status", "to_do");
    element.parentElement.classList.remove("done");
    changeCompletedTasksPercents(`${element.classList[0]}`);
  }
}

window.changeTaskStatus = changeTaskStatus;

function changeCompletedTasksPercents(checkboxesClass) {
  let allCheckboxes = document.querySelectorAll(`.${checkboxesClass}`).length;
  let allCheckboxesChecked = document.querySelectorAll(
    `.taskStatusLabel.done > .${checkboxesClass}:checked`
  ).length;
  document
    .querySelector(`.${checkboxesClass}Bar`)
    .style.setProperty(
      "--progress-width",
      (allCheckboxesChecked / allCheckboxes) * 90 + "px"
    );
  document.querySelector(
    `.${checkboxesClass}Bar > .completedTasksPercents`
  ).innerHTML = Math.round((allCheckboxesChecked / allCheckboxes) * 100) + "%";
}

window.changeCompletedTasksPercents = changeCompletedTasksPercents;

var taskSortType = 1;

function changeTaskSort() {
  if (taskSortType === 1) {
    taskSortType = 2;
    document.querySelector(".list_contents").classList.add("two_column");
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine"
    ).style.transform = "translateX(-75px)";
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine"
    ).style.transform = "translateX(-67.5px)";
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine"
    ).style.opacity = "0";
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine"
    ).style.opacity = "1";
  } else {
    taskSortType = 1;
    document.querySelector(".list_contents").classList.remove("two_column");
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine"
    ).style.transform = "translateX(7.5px)";
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine"
    ).style.transform = "translateX(15px)";
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine"
    ).style.opacity = "1";
    document.querySelector(
      ".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine"
    ).style.opacity = "0";
  }
}

window.changeTaskSort = changeTaskSort;

var currentDate = new Date();

var tasksFilter = "my";

var tasksDayFilter = "none";

async function drawCalendar(dateObj) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // obliczenia dni
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const emptyDays = firstDay === 0 ? 6 : firstDay - 1;

  // Ustawienie daty w formacie YYYY-MM-DD
  document.querySelector(".calendarDate > .date").innerHTML = `${year}-${String(
    month + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Wyciąganie pełnej nazwy miesiąca
  const monthNames = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];
  document.querySelector(".calendarDate > .month").innerHTML =
    monthNames[month]; // np. Kwiecień

  let html = "",
    count = 0;
  // puste pola przed rozpoczęciem miesiąca
  for (let i = 0; i < emptyDays; i++) {
    html += `<div class="day empty"></div>`;
    count++;
  }
  // dni miesiąca
  for (let d = 1; d <= daysInMonth; d++) {
    const D = new Date(year, month, d);
    D.setHours(12, 0, 0, 0);
    const dayStr = D.toISOString().slice(0, 10); // np. "2025-05-04"

    const isPast = D < today;
    const isToday = D.getTime() === today.getTime();
    const cls = `day${isToday ? " today" : ""}${isPast ? " disabled" : ""}`;

    const { projects } = await listProjects(userId);

    let totalToDo = 0;
    let totalInProgress = 0;
    let totalDone = 0;

    for (const project of projects) {
      const { tasks } = await listTasks(project.id);

      let tasksForDay = tasks.filter(
        (task) => task.due_date === dayStr // dopasuj zadania do konkretnego dnia
      );

      if (tasksFilter === "my") {
        tasksForDay = tasksForDay.filter(
          (task) => task.assigned_user_id === userId
        );
      }

      totalToDo += tasksForDay.filter(
        (task) => task.progress === "to_do"
      ).length;
      totalInProgress += tasksForDay.filter(
        (task) => task.progress === "in_progress"
      ).length;
      totalDone += tasksForDay.filter(
        (task) => task.progress === "done"
      ).length;
    }

    let tasksThisDay = "";

    if (totalToDo > 0) {
      tasksThisDay += `<div>
        <div style="height:15px; width: 15px; border-radius: 2.5px; background-color: rgb(255, 69, 69);"></div>
        <span>${totalToDo}</span>
      </div>`;
    }
    if (totalInProgress > 0) {
      tasksThisDay += `<div>
        <div style="height:15px; width: 15px; border-radius: 2.5px; background-color: rgb(255, 132, 0);"></div>
        <span>${totalInProgress}</span>
      </div>`;
    }
    if (totalDone > 0) {
      tasksThisDay += `<div>
        <div style="height:15px; width: 15px; border-radius: 2.5px; background-color: rgb(74, 229, 39);"></div>
        <span>${totalDone}</span>
      </div>`;
    }

    html += `<div class="${cls}" onmouseover="mouseOverTask(this)" onmouseout="mouseOutTask(this)" onclick="setTasksDayFilter(this)" data-date="${dayStr}">
        ${d}
        <div class="dayTasks">
            ${tasksThisDay}
        </div>
    </div>`;
    count++;
  }

  // dopełnienie do 35 lub 42
  const total = count <= 35 ? 35 : 42;
  for (let i = count; i < total; i++) {
    html += `<div class="day empty"></div>`;
  }

  // wstawienie i ułożenie grid
  const container = document.querySelector(".kalendarz .calendarContent");
  container.style.gridTemplateRows = `repeat(${total === 35 ? 5 : 6}, 1fr)`;
  container.innerHTML = html;

  // podświetlanie dni przy drag
  addCalendarDragIndicators();
}

window.drawCalendar = drawCalendar;

drawCalendar(currentDate);

function mouseOverTask(element) {
  element.classList.add("hover");
}

window.mouseOverTask = mouseOverTask;

function mouseOutTask(element) {
  // zamiast natychmiast usuwać .hover — daj animacji czas
  element.classList.add("hover-out");
  setTimeout(() => {
    element.classList.remove("hover");
    element.classList.remove("hover-out");
  }, 300); // czas trwania musi być zgodny z transition
}

window.mouseOutTask = mouseOutTask;

function previousCalendarMounth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  drawCalendar(currentDate);
}

window.previousCalendarMounth = previousCalendarMounth;

function nextCalendarMounth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  drawCalendar(currentDate);
}

window.nextCalendarMounth = nextCalendarMounth;

// addTask({
//     text: "A",
//     due_date: "2025-05-03",
//     priority: "high",
//     progress: "todo",
//     project_id: 1,
//     assigned_user_id: 2
// }).then(data => console.log(data));

// listTasks().then(data => console.log(data.tasks));

// addFriendRequest({
//     from_id: 1,
//     to_id: 5,
// }).then(data => console.log(data));

function selectChatMenu(element, menuType) {
  let regularMenu = document.querySelector("#chatgpt > .regularMenu");
  regularMenu.prepend(regularMenu.querySelector(`${menuType}`));
  regularMenu.prepend(regularMenu.querySelector(".chatMenu"));
  regularMenu.querySelectorAll(".chatMenu > div").forEach((element) => {
    element.classList.remove("selectedChatMenu");
  });
  element.classList.add("selectedChatMenu");
}

window.selectChatMenu = selectChatMenu;

function showFrends() {
  listUsers()
    .then((response) => {
      if (response.users) {
        console.log(response.users);
        const me = response.users.find((user) => user.id === userId);
        console.log(me);
        let myGroup;
        if (me.friend_id === null) {
          myGroup = response.users.filter(
            (user) => user.friend_id === me.id || user.id === me.id
          );
        } else {
          myGroup = response.users.filter(
            (user) =>
              user.friend_id === me.friend_id || user.id === me.friend_id
          );
        }

        console.log("My group:", myGroup);

        // // Wyświetl ich na stronie
        // filteredUsers.forEach((user) => {
        //   const userDiv = document.createElement("div");
        //   userDiv.textContent = `User: ${user.name} (id: ${user.id})`;
        //   document.querySelector(".groups").appendChild(userDiv);
        // });
      } else {
        console.error(
          "No users found or unexpected response format:",
          response
        );
      }
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
    });
}

window.showFrends = showFrends;

showFrends();

async function searchGroup(inputElement) {
  const q = inputElement.value.toLowerCase().trim();
  const out = document.querySelector(".search-results");
  out.innerHTML = "";

  if (!q) return;

  try {
    const [usersResp, grResp] = await Promise.all([
      listUsers(),
      listGroupRequests(),
    ]);
    const users = usersResp.users || [];
    const grs = grResp.group_requests || [];

    const me = users.find((u) => u.id === userId) || {};
    if (me.friend_id !== null) {
      inputElement.value = "";
      inputElement.placeholder =
        "Jesteś już w grupie i nie możesz wyszukiwać innych.";
      setTimeout(() => {
        inputElement.placeholder = "Search The Matrix...";
      }, 3000);
      return;
    }

    const sentToMe = grs
      .filter((r) => r.to_user === userId)
      .map((r) => r.from_user);
    const sentByMe = grs
      .filter((r) => r.from_user === userId)
      .map((r) => r.to_user);

    const candidates = users.filter(
      (u) =>
        u.id !== userId &&
        u.friend_id === null &&
        u.name.toLowerCase().includes(q)
    );

    for (const u of candidates) {
      const row = document.createElement("div");
      row.textContent = u.name + " ";

      if (sentByMe.includes(u.id)) {
        const wait = document.createElement("button");
        wait.textContent = "Oczekiwanie";
        wait.disabled = true;
        const cancel = document.createElement("button");
        cancel.textContent = "Anuluj";
        cancel.onclick = async () => {
          const r = grs.find(
            (r) => r.from_user === userId && r.to_user === u.id
          );
          await deleteGroupRequest(r.id);
          searchGroup(inputElement);
        };
        row.append(wait, cancel);
      } else if (sentToMe.includes(u.id)) {
        const btnJoin = document.createElement("button");
        btnJoin.textContent = "Dołącz";
        btnJoin.onclick = async () => {
          const r = grs.find(
            (r) => r.from_user === u.id && r.to_user === userId
          );
          await deleteGroupRequest(r.id);
          await editUser({ id: userId, friend_id: u.id });
          searchGroup(inputElement);
        };
        const btnReject = document.createElement("button");
        btnReject.textContent = "Odrzuć";
        btnReject.onclick = async () => {
          const r = grs.find(
            (r) => r.from_user === u.id && r.to_user === userId
          );
          await deleteGroupRequest(r.id);
          searchGroup(inputElement);
        };
        row.append(btnJoin, btnReject);
      } else {
        const btn = document.createElement("button");
        btn.textContent = "+";
        btn.onclick = async () => {
          await addGroupRequest({ from_id: userId, to_id: u.id });
          searchGroup(inputElement);
        };
        row.append(btn);
      }

      out.append(row);
    }
  } catch (e) {
    console.error("searchGroup error:", e);
  }
}

window.searchGroup = searchGroup;

function refreshSelect() {
  console.log(
    "Selected count:",
    document.querySelectorAll(".task > .tools .select .selected").length
  );
  console.log(
    "Option count:",
    document.querySelectorAll(".task > .tools .select .option").length
  );

  // kopiuj dla scope
  const selectedEls = document.querySelectorAll(
    ".task > .tools .select .selected"
  );
  const optionEls = document.querySelectorAll(".task > .tools .select .option");

  // najpierw usuń poprzednie eventy (przez klonowanie elementu — najprościej)
  selectedEls.forEach((el) => {
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
  });

  optionEls.forEach((el) => {
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
  });

  // teraz świeże elementy z zresetowanymi eventami
  document
    .querySelectorAll(".task > .tools .select .selected")
    .forEach((selectedEl) => {
      selectedEl.addEventListener("click", (e) => {
        const sel = e.currentTarget.parentNode;
        document
          .querySelectorAll(".task > .tools .select.open")
          .forEach((opened) => {
            if (opened !== sel) opened.classList.remove("open");
          });
        sel.classList.toggle("open");
      });
    });

  document
    .querySelectorAll(".task > .tools .select .option")
    .forEach((optionEl) => {
      optionEl.addEventListener("click", async (e) => {
        const opt = e.currentTarget;
        const sel = opt.closest(".task > .tools .select");
        const txt = opt.getAttribute("data-text");
        const val = opt.getAttribute("data-value");

        sel.querySelector(".selected").textContent = txt;
        sel.setAttribute("data-value", val);
        sel.classList.remove("open");

        sel.dispatchEvent(
          new CustomEvent("change", {
            detail: { value: val },
          })
        );

        await changeAssignedUser(opt);
      });
    });
}

window.refreshSelect = refreshSelect;

var tasksOpened = false;

function openTasks(element) {
  tasksOpened = !tasksOpened;
  let chatgpt = document.querySelector("#chatgpt");
  if (tasksOpened) {
    element.style.color = "rgb(255, 132, 0)";
    chatgpt.prepend(chatgpt.querySelector(".allTasks"));
  } else {
    element.style.color = "white";
    chatgpt.prepend(chatgpt.querySelector(".regularMenu"));
  }
}

window.openTasks = openTasks;

function setTasksDayFilter(element) {
  tasksDayFilter = element.dataset.date;
  tasksOpened = true;
  document.querySelector(".openTasksIcon").style.color = "rgb(255, 132, 0)";
  chatgpt.prepend(chatgpt.querySelector(".allTasks"));
  showTasks();
}

window.setTasksDayFilter = setTasksDayFilter;

function resetTasksDayFilter() {
  tasksDayFilter = "none";
  showTasks();
}

window.resetTasksDayFilter = resetTasksDayFilter;

async function showTasks() {
  const tasksResult = document.querySelector(".tasksResult");
  tasksResult.innerHTML = "";
  if (tasksDayFilter !== "none") {
    tasksResult.innerHTML = `<b>${tasksDayFilter} <span onclick="resetTasksDayFilter()">-</span></b>`;
  }

  const { projects } = await listProjects(userId);
  let tasksAdded = false;
  for (const project of projects) {
    let { tasks } = await listTasks(project.id);
    for (const task of tasks) {
      if (tasksFilter === "my" && task.assigned_user_id !== userId) continue;
      if (tasksDayFilter !== "none" && task.due_date !== tasksDayFilter)
        continue;
      const bg =
        task.progress === "in_progress"
          ? "rgb(255,132,0)"
          : task.progress === "done"
          ? "rgb(74,229,39)"
          : "rgb(255,69,69)";
      tasksResult.innerHTML += `
          <div class="taskView" draggable="true" data-task-id="${task.id}"
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

  document.querySelectorAll(".taskView").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      // 1. zapisz taskId
      e.dataTransfer.setData("text/plain", el.dataset.taskId);

      // 2. wylicz offset kursora wewnątrz elementu
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      // 3. ustaw drag image z tym offsetem
      e.dataTransfer.setDragImage(el, offsetX, offsetY);
    });
  });
}

window.showTasks = showTasks;

function selectTaskFilter(element, newState) {
  tasksFilter = newState === "all" ? "all" : "my";
  showTasks();
  drawCalendar(currentDate);
  chatgpt
    .querySelectorAll(".allTasks > .tasksSelect > div")
    .forEach((element) => {
      element.classList.remove("selectedChatMenu");
      console.log(element);
    });
  element.classList.add("selectedChatMenu");
}

window.selectTaskFilter = selectTaskFilter;

function allowDrop(ev) {
  ev.preventDefault();
}
window.allowDrop = allowDrop;

async function updateTaskDueDate(taskId, newDate) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(newDate)) {
    throw new Error("Nieprawidłowy format daty. Użyj formatu YYYY-MM-DD.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(newDate);
  inputDate.setHours(0, 0, 0, 0);

  if (isNaN(inputDate.getTime()) || inputDate < today) {
    throw new Error("Nie można ustawić daty w przeszłości.");
  }

  const { projects } = await listProjects(userId);
  let foundTask = false;
  for (const project of projects) {
    const { tasks } = await listTasks(project.id);
    const task = tasks.find((task) => String(task.id) === taskId);
    console.log("TASKS", tasks);
    if (task) {
      foundTask = true;
      return editTask({ id: taskId, due_date: newDate });
    }
  }

  if (!foundTask) throw new Error(`Nie znaleziono zadania o id ${taskId}`);
}
window.updateTaskDueDate = updateTaskDueDate;

function addCalendarDragIndicators() {
  document
    .querySelectorAll(".calendarContent > .day:not(.empty):not(.disabled)")
    .forEach((day) => {
      day.addEventListener("dragenter", (e) => {
        e.preventDefault();
        day.classList.add("highlight");
      });
      day.addEventListener("dragover", (e) => e.preventDefault());
      day.addEventListener("dragleave", () => {
        day.classList.remove("highlight");
      });
      day.addEventListener("drop", async (e) => {
        e.preventDefault();
        day.classList.remove("highlight");

        // TU masz pewność, że day === komórka pod kursorem
        const dateStr = day.dataset.date;
        const taskId = e.dataTransfer.getData("text/plain");

        try {
          await updateTaskDueDate(taskId, dateStr);
          console.log(`Zadanie ${taskId} przeniesione na ${dateStr}`);
          await showTasks();
          drawCalendar(currentDate);
        } catch (err) {
          console.error(err);
        }
      });
    });
}
