let hasAsked = false;

  async function askYesNo() {
    const input = document.getElementById("yesno-input").value.trim();
    const desc = document.getElementById("yesno-desc");
    const answerBox = document.getElementById("yesno-answer");
    const gif = document.getElementById("yesno-gif");
    const result = document.getElementById("yesno-result");

    if (!input) {
      alert("Wpisz pytanie!");
      return;
    }

    if (!hasAsked) {
      desc.style.display = "none";
      hasAsked = true;
    }

    try {
      const res = await fetch("https://yesno.wtf/api");
      const data = await res.json();
      gif.src = data.image;
      result.textContent = data.answer.toUpperCase();
      answerBox.style.display = "block";
    } catch (err) {
      result.textContent = "Błąd przy pobieraniu odpowiedzi.";
      gif.src = "";
      answerBox.style.display = "block";
    }
  }