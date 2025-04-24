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
    document.querySelector(".todo_content").prepend(document.querySelector(`.${element}`));
}