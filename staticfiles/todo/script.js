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

import { showMindMap } from './mindMap.js';

var userId = 10;

async function showMyProjects() {
  try {
    const { projects } = await listProjects(userId);
    console.log(projects);
    projects.forEach((project) => {
      addProjectFromDBFunction(project.name, project.id);
    });
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

  if (element === 'whiteboard') {
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
      });
    }
  } catch (error) {
    console.error("Error adding project:", error);
  }
}

window.addProjectFunction = addProjectFunction;

async function addProjectFromDBFunction(projectName, projectId) {
  let projectNameInput = projectName;
  console.log("::" + projectId);
  const { tasks } = await listTasks(projectId);
  let taskElements = tasks.length == 0 ? "<div>Add a task to start</div>" : "";
  tasks.forEach((task) => {
    console.log("T" + task.id);
    taskElements += `<div class="task">
          <label class="taskStatusLabel">
              <input type="checkbox" class="todo${projectName}Task taskStatus" task_status="To Do" oninput="changeTaskStatus(this)" checked>
              <span class="checkmark"></span>
          </label>
          ${task.text}
          <div class="tools">
              <div class="taskPriority">
                  <label class="priorityLow">
                      <input type='radio' name='taskPriority${projectName}${task.text}' oninput="changePriority(this, 'todo${projectName}Task', 'Low')">
                  </label>
                  <label class="priorityMedium">
                      <input type='radio' name='taskPriority${projectName}${task.text}' oninput="changePriority(this, 'todo${projectName}Task', 'Medium')" checked>
                  </label>
                  <label class="priorityHigh">
                      <input type='radio' name='taskPriority${projectName}${task.text}' oninput="changePriority(this, 'todo${projectName}Task', 'High')">
                  </label>
              </div>
          </div>
          <button class="delete_task_button" onclick="deleteTaskFunction(this, '${task.text}', '${projectName}')">
          <div class="line1"><div class="line2"></div></div>
          </button>
      </div>`;
  })
  document.querySelector(
    ".list_contents"
  ).innerHTML += `<div class="todo${projectNameInput}">
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
      }).then((data) => {
        sectionElement.querySelector("ul").insertAdjacentHTML(
          "beforeend",
          `<div class="task">
                <label class="taskStatusLabel">
                    <input type="checkbox" class="todo${projectName}Task taskStatus" task_status="To Do" oninput="changeTaskStatus(this)" checked>
                    <span class="checkmark"></span>
                </label>
                ${taskNameInput}
                <div class="tools">
                    <div class="taskPriority">
                        <label class="priorityLow">
                            <input type='radio' name='taskPriority${projectName}${taskNameInput}' oninput="changePriority(this, 'todo${projectName}Task', 'Low')">
                        </label>
                        <label class="priorityMedium">
                            <input type='radio' name='taskPriority${projectName}${taskNameInput}' oninput="changePriority(this, 'todo${projectName}Task', 'Medium')" checked>
                        </label>
                        <label class="priorityHigh">
                            <input type='radio' name='taskPriority${projectName}${taskNameInput}' oninput="changePriority(this, 'todo${projectName}Task', 'High')">
                        </label>
                    </div>
                </div>
                <button class="delete_task_button" onclick="deleteTaskFunction(this, '${taskNameInput}', '${projectName}')">
                <div class="line1"><div class="line2"></div></div>
                </button>
            </div>`);
        mainElement.querySelector(".add_task_input").value = "";
        changeCompletedTasksPercents(`todo${projectName}Task`);
        showMindMap();
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
      document.querySelector(
        ".list_contents"
      ).innerHTML = "";
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

function changePriority(element, taskClass, priorityType) {}

window.changePriority = changePriority;

function changeTaskStatus(element) {
  if (element.getAttribute("task_status") === "To Do") {
    element.checked = true;
    element.setAttribute("task_status", "In Progress");
    element.parentElement.classList.add("inProgress");
  } else if (element.getAttribute("task_status") === "In Progress") {
    element.checked = true;
    element.setAttribute("task_status", "Done");
    element.parentElement.classList.remove("inProgress");
    element.parentElement.classList.add("done");
    changeCompletedTasksPercents(`${element.classList[0]}`);
  } else if (element.getAttribute("task_status") === "Done") {
    element.checked = true;
    element.setAttribute("task_status", "To Do");
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

function drawCalendar() {
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let calendarHTML = "";
    
    for (let i = 1; i <= daysInMonth; i++) {
        calendarHTML += `<div class="day">${i}</div>`;
    }
    
    document.querySelector(".kalendarz > .calendarContent").innerHTML = calendarHTML;
}

drawCalendar();

function drawCalendar(functionDate) {
  let date = functionDate;
  let currentYear = date.getFullYear();
  let currentMonth = date.getMonth();
  let currentDay = date.getDate();
  console.log(currentDay);
  let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDay = new Date(currentYear, currentMonth, 1).getDay();

  let calendarHTML = "";

  let daysCounter = 0;

  let emptyDays = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < emptyDays; i++) {
    calendarHTML += `<div class="day empty"></div>`;
    daysCounter++;
  }

  const today = new Date();

  for (let i = 1; i <= daysInMonth; i++) {
    const thisDay = new Date(currentYear, currentMonth, i);
    const isToday = thisDay.toDateString() === today.toDateString();

    calendarHTML += `<div class="day${isToday ? " today" : ""}">${i}</div>`;
    daysCounter++;
  }

  if (daysCounter < 35) {
    for (let i = 0; i < 35 - daysCounter; i++) {
      calendarHTML += `<div class="day empty"></div>`;
    }
  }

  if (daysCounter > 35) {
    document.querySelector(
      ".kalendarz > .calendarSection > .calendarContent"
    ).style.gridTemplateRows = "repeat(6, 1fr)";
    for (let i = 0; i < 42 - daysCounter; i++) {
      calendarHTML += `<div class="day empty"></div>`;
    }
  } else {
    document.querySelector(
      ".kalendarz > .calendarSection > .calendarContent"
    ).style.gridTemplateRows = "repeat(5, 1fr)";
  }

  document.querySelector(
    ".kalendarz > .calendarSection > .calendarContent"
  ).innerHTML = calendarHTML;

  document.querySelector(
    ".kalendarz > .calendarSection > .calendarContent"
  ).innerHTML = calendarHTML;

  let monthText = [
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

  let monthNumber = currentMonth + 1;

  if (monthNumber < 10) {
    monthNumber = "0" + monthNumber;
  }

  document.querySelector(".kalendarz > .calendarDate > .date").innerHTML =
    monthNumber + "." + currentYear;
  document.querySelector(".kalendarz > .calendarDate > .month").innerHTML =
    monthText[currentMonth];
}

drawCalendar(currentDate);

window.drawCalendar = drawCalendar;

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
  let chatgpt = document.querySelector("#chatgpt");
  chatgpt.prepend(chatgpt.querySelector(`${menuType}`));
  chatgpt.prepend(chatgpt.querySelector(".chatMenu"));
  chatgpt.querySelectorAll(".chatMenu > div").forEach((element) => {
    element.classList.remove("selectedChatMenu");
  });
  element.classList.add("selectedChatMenu");
}

window.selectChatMenu = selectChatMenu;

function showFrends() {
  listUsers()
    .then((response) => {
      if (response.users) {
        const filteredUsers = response.users.filter(
          (user) => user.friend_id === 1
        );
        console.log(filteredUsers);

        // Wyświetl ich na stronie
        filteredUsers.forEach((user) => {
          const userDiv = document.createElement("div");
          userDiv.textContent = `User: ${user.name} (id: ${user.id})`;
          document.querySelector(".groups").appendChild(userDiv);
        });
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
