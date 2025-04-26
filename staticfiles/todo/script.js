const actions_buttons = document.querySelectorAll(".todo_panel > button");

actions_buttons.forEach((button) => {
  button.addEventListener("click", () => {
    // usuń klasę active z innych
    actions_buttons.forEach((btn) => btn.classList.remove("active"));
    // dodaj do klikniętego
    button.classList.add("active");
  });
});

function changeToDoView(element) {
  document
    .querySelector(".todo_content")
    .prepend(document.querySelector(`.${element}`));
}

function addProject() {
  let everyThingOk = true;
  let projectNameInput = document.querySelector(".add_project_input").value;
  document.querySelectorAll(".list_contents > div").forEach((element) => {
    if (element.classList.contains(`todo${projectNameInput}`)) {
      everyThingOk = false;
      document.querySelector(".add_project_input").value = "";
      document.querySelector(".add_project_input").placeholder = "Projekt już istnieje";
    } else {
        document.querySelector(".add_project_input").placeholder = "Nowy projekt";
    }
  });
  if (projectNameInput !== "" && everyThingOk) {
    document.querySelector(
      ".list_contents"
    ).innerHTML += `<div class="todo${projectNameInput}">
${projectNameInput}
            <button class="deleteProjectButton" onclick="deleteProject('todo${projectNameInput}')">
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
            <button class="add_task_button" onclick="addTask(this, '${projectNameInput}')">
                <div class="line1"><div class="line2"></div></div>
            </button>
            <div class="tasksStatusBar todo${projectNameInput}TaskBar" style="--progress-width: 0px"><span class='completedTasksPercents'>0%<span></div>
        </div>
        <ul>
        <div>Add a task to start</div>
        </ul>
        </div>
        `;

    document.querySelector(".add_project_input").value = "";
  }
}

function addTask(element, projectName) {
  let mainElement = element.parentElement;
  let sectionElement = mainElement.parentElement;
  let taskNameInput = mainElement.querySelector(".add_task_input").value;
  if (taskNameInput !== "") {
    if (
      sectionElement.querySelector("ul > div").textContent.trim() ===
      "Add a task to start"
    ) {
      sectionElement.querySelector("ul").innerHTML = "";
    }
    sectionElement.querySelector("ul").insertAdjacentHTML(
      "beforeend",
      `<div class="task">
    <label class="taskStatusLabel">
        <input type="checkbox" class="todo${projectName}Task taskStatus" oninput="changeCompletedTasksPercents('todo${projectName}Task')">
        <span class="checkmark"></span>
    </label>
    ${taskNameInput}
        <button class="delete_task_button" onclick="deleteTask(this)">
        <div class="line1"><div class="line2"></div></div>
        </button>
        </div>`
    );
    mainElement.querySelector(".add_task_input").value = "";
    changeCompletedTasksPercents(`todo${projectName}Task`);
  }
}

function deleteTask(element) {
  let taskElement = element.parentElement;
  let sectionElement = taskElement.parentElement;
  sectionElement.removeChild(taskElement);
  if (!sectionElement.querySelector("div")) {
    sectionElement.innerHTML = "<div>Add a task to start</div>";
  }
}

function changeCompletedTasksPercents(checkboxesClass) {
  let allCheckboxes = document.querySelectorAll(`.${checkboxesClass}`).length;
  let allCheckboxesChecked = document.querySelectorAll(
    `.${checkboxesClass}:checked`
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

function deleteProject(projectName) {
  let projectElement = document.querySelector(`.${projectName}`);
  let projectList = document.querySelector(".list_contents");
  projectList.removeChild(projectElement);
}

var taskSortType = 1;

function changeTaskSort() {
    if(taskSortType === 1) {
        taskSortType = 2;
        document.querySelector(".list_contents").classList.add("two_column");
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine").style.transform = "translateX(-75px)";
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine").style.transform = "translateX(-67.5px)";
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine").style.opacity = "0";
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine").style.opacity = "1";
    } else {
        taskSortType = 1;
        document.querySelector(".list_contents").classList.remove("two_column");
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine").style.transform = "translateX(7.5px)";
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine").style.transform = "translateX(15px)";
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .oneInLine").style.opacity = "1";
        document.querySelector(".todo_content > .list > .addProjectContainer > .sortProjectContainer > .twoInLine").style.opacity = "0";
    }
}

// function ileDniWMiesiacu(rok, miesiac) {
//     return new Date(rok, miesiac, 0).getDate();
//   }
  
//   // Przykład: październik 2025 (październik to miesiąc nr 10)
//   console.log(ileDniWMiesiacu(2025, 9)); // zwróci 31

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