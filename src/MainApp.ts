import GameLive from "./GameLive";
import FIGURES from "./figures";

function disableButton(button: HTMLButtonElement) {
  // eslint-disable-next-line no-param-reassign
  button.disabled = true;
}

function enableButton(button: HTMLButtonElement) {
  // eslint-disable-next-line no-param-reassign
  button.disabled = false;
}

export default class MainApp {
  readonly appTemplate = `
    <div class="settings-block">
    <input class="mark-check" type="checkbox" name="mark-check" />
    <label for="mark-check">
      Указывать какие клетки изменятся на следующем тике
    </label>
  </div>
  <div class="settings-block">
    <label>Рзамер сетки :</label>
    <input class="width-input" placeholder="Width" type="number" pattern="[0-9]+" required />
    X
    <input class="height-input" placeholder="Height" type="number" pattern="[0-9]+" required />
    <button class="createGrid" type="button">Создать новую сетку</button>
  </div>
  <div class="settings-block">
    <label>Скорость :</label>
    <input class="speed-input" type="range" min="0" value="10" max="18" step="2" />
  </div>
  <div class="settings-block">
    <button class="nextTic" type="button">Следующий тик</button>
    <button class="start" type="button">Старт</button>
  </div>
  <div class="settings-block legend">
    <label>Легенда:</label>
    <cell class="cell-legend dead" title="Мёртвая клетка"></cell>
    <cell class="cell-legend alive" title="Живая клетка"></cell>
    <cell class="cell-legend mark-for-dead invisible" title="Умрёт на следующем тике"></cell>
    <cell class="cell-legend mark-for-alive invisible" title="Оживёт на следующем тике"></cell>
  </div>
  <div class="settings-block figures">
    <label>Вставить фигуру: </label>
  </div>
  <div class="live-game-container"></div>`;

  readonly root: HTMLElement;

  widthInput: HTMLInputElement;

  heightInput: HTMLInputElement;

  speedElement: HTMLInputElement;

  markCheckbox: HTMLInputElement;

  startButton: HTMLButtonElement;

  gridButton: HTMLButtonElement;

  nextTicButton: HTMLButtonElement;

  legendBlock: HTMLElement;

  figuresBlock: HTMLElement;

  startFlag = false;

  timerId!: NodeJS.Timeout;

  gameLive!: GameLive;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.innerHTML = this.appTemplate;

    // class fields init
    this.widthInput = this.root.querySelector(
      ".width-input",
    ) as HTMLInputElement;
    this.heightInput = this.root.querySelector(
      ".height-input",
    ) as HTMLInputElement;
    this.speedElement = this.root.querySelector(
      ".speed-input",
    ) as HTMLInputElement;
    this.markCheckbox = this.root.querySelector(
      ".mark-check",
    ) as HTMLInputElement;
    this.startButton = this.root.querySelector(".start") as HTMLButtonElement;
    this.gridButton = this.root.querySelector(
      ".createGrid",
    ) as HTMLButtonElement;
    this.nextTicButton = this.root.querySelector(
      ".nextTic",
    ) as HTMLButtonElement;
    this.legendBlock = this.root.querySelector(".legend") as HTMLElement;
    this.figuresBlock = this.root.querySelector(".figures") as HTMLElement;

    this.widthInput.value = getComputedStyle(this.root).getPropertyValue(
      "--field-width",
    );
    this.heightInput.value = getComputedStyle(this.root).getPropertyValue(
      "--field-height",
    );

    this.createFiguresButtons();

    // listeners init
    document.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "Space":
          event.preventDefault();
          this.startButtonClick();
          break;
        case "ArrowUp":
          this.speedElement.stepUp();
          this.speedElement.dispatchEvent(new Event("change"));
          break;
        case "ArrowDown":
          this.speedElement.stepDown();
          this.speedElement.dispatchEvent(new Event("change"));
          break;
        case "ArrowRight":
          this.nextTicButton.click();
          break;
        default:
      }
    });

    this.markCheckbox.addEventListener("change", () => {
      this.legendBlock
        .querySelector(".mark-for-dead")
        ?.classList.toggle("invisible");
      this.legendBlock
        .querySelector(".mark-for-alive")
        ?.classList.toggle("invisible");
    });

    this.widthInput.addEventListener("change", () => {
      this.root.style.setProperty("--field-width", this.widthInput.value);
      this.gameLive.resizeWidth(Number(this.widthInput.value));
    });

    this.heightInput.addEventListener("change", () => {
      this.root.style.setProperty("--field-height", this.heightInput.value);
      this.gameLive.resizeHeight(Number(this.heightInput.value));
    });

    this.gridButton.addEventListener("click", () => {
      this.root.style.setProperty("--field-width", this.widthInput.value);
      this.root.style.setProperty("--field-height", this.heightInput.value);

      if (!this.gameLive) {
        this.gameLive = new GameLive(
          document.querySelector(".live-game-container") as HTMLElement,
          Number(this.widthInput.value),
          Number(this.heightInput.value),
          this.markCheckbox.checked,
        );
      }
      this.gameLive.fillGrid(
        Number(this.widthInput.value),
        Number(this.heightInput.value),
      );
    });

    this.speedElement.addEventListener("change", () => {
      if (this.startFlag) {
        this.gameStop();
        this.gameStart();
      }
    });

    this.nextTicButton.addEventListener("click", () => {
      this.gameLive.nextTic();
    });

    this.startButton.addEventListener("click", () => {
      this.startButtonClick();
    });

    this.markCheckbox.addEventListener("change", () => {
      this.gameLive.markable = this.markCheckbox.checked;
    });
  }

  start() {
    this.gameLive = new GameLive(
      document.querySelector(".live-game-container") as HTMLElement,
      Number(this.widthInput.value),
      Number(this.heightInput.value),
      this.markCheckbox.checked,
    );

    this.gameLive.insertFigure(
      this.gameLive.getCell(0, 0),
      FIGURES.GOSPER_GLIDER_GUN.coordinates,
    );
    this.gameLive.insertFigure(
      this.gameLive.getCell(34, 20),
      FIGURES.EATER_1.coordinates,
    );
  }

  startButtonClick() {
    if (!this.startFlag) {
      this.gameStart();
      this.startFlag = true;
      this.startButton.innerText = "Стоп";
      disableButton(this.nextTicButton);
      disableButton(this.gridButton);
      this.figuresBlock.querySelectorAll("button").forEach(button => disableButton(button))
      this.root.classList.toggle("run");
    } else {
      this.gameStop();
      this.startFlag = false;
      this.startButton.innerText = "Старт";
      enableButton(this.nextTicButton);
      enableButton(this.gridButton);
      this.figuresBlock.querySelectorAll("button").forEach(button => enableButton(button))
      this.root.classList.toggle("run");
    }
  }

  gameStart() {
    this.timerId = setInterval(
      () => {
        if (!this.gameLive.nextTic()) {
          this.startButtonClick();
        }
      },
      1000 / (Number(this.speedElement.value) + 2),
    );
  }

  gameStop() {
    if (this.timerId) clearInterval(this.timerId);
  }

  createFiguresButtons() {
    Object.keys(FIGURES).forEach((key) => {
      const figure = FIGURES[key];

      const button = document.createElement("button");
      button.innerText = figure.name;
      button.classList.add("figure");
      button.classList.add(key);
      button.type = "button";

      button.addEventListener('click', () => {
        this.gameLive.showInsertFigure(figure);
      })

      this.figuresBlock.appendChild(button);
    })
  }
}
