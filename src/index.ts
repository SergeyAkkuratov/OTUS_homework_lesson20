import "./style.css";
import GameLive from "./GameLive";

const root = document.querySelector(":root") as HTMLElement;
const widthInput = document.getElementById("width-input") as HTMLInputElement;
const heightInput = document.getElementById("height-input") as HTMLInputElement;
const speedElement = document.getElementById("speed-input") as HTMLInputElement;
const markCheckbox = document.getElementById("mark-check") as HTMLInputElement;
const startButton = document.getElementById("start");

let startFlag = false;
let timerId: NodeJS.Timeout;
widthInput.value = getComputedStyle(document.body).getPropertyValue(
  "--field-width",
);
heightInput.value = getComputedStyle(document.body).getPropertyValue(
  "--field-height",
);

const liveApp = new GameLive(
  document.querySelector(".live-game-container") as HTMLElement,
  Number(widthInput.value),
  Number(heightInput.value),
  markCheckbox.checked,
);

document.getElementById("createGrid")?.addEventListener("click", () => {
  root.style.setProperty("--field-width", widthInput.value);
  root.style.setProperty("--field-height", heightInput.value);
  liveApp.width = Number(widthInput.value);
  liveApp.height = Number(heightInput.value);
  liveApp.fillGrid();
  liveApp.showGrid();
});

document.getElementById("nextTic")?.addEventListener("click", () => {
  liveApp.nextTic();
});

startButton?.addEventListener("click", () => {
  if (!startFlag) {
    timerId = setInterval(
      () => {
        liveApp.nextTic();
      },
      1000 / Number(speedElement.value),
    );
    startFlag = true;
    startButton.innerText = "Стоп";
  } else {
    clearInterval(timerId);
    startFlag = false;
    startButton.innerText = "Start";
  }
});

markCheckbox?.addEventListener("change", () => {
  liveApp.markable = markCheckbox.checked;
});
