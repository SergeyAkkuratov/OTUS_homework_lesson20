import GameLive from "./GameLive";
import MainApp, { disableButton, enableButton } from "./MainApp";
import FIGURES from "./figures";

describe("MainApp class tests", () => {
  let rootElement: HTMLElement;
  let mainApp: MainApp;

  beforeEach(() => {
    rootElement = document.createElement("div");
    rootElement.style.setProperty("--field-width", "40");
    rootElement.style.setProperty("--field-height", "25");
    mainApp = new MainApp(rootElement);
  });

  function getContainer(): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("live-game-container");
    return container;
  }

  it("Check standalone function", () => {
    const button = document.createElement("button") as HTMLButtonElement;

    disableButton(button);
    expect(button.disabled).toBe(true);

    enableButton(button);
    expect(button.disabled).toBe(false);
  });

  it("Check constructor", () => {
    const divExpected = document.createElement("div");
    divExpected.innerHTML = `
        <div class="settings-block">
          <input class="mark-check" type="checkbox" name="mark-check">
          <label for="mark-check">
            Указывать какие клетки изменятся на следующем тике
          </label>
        </div>
        <div class="settings-block">
          <label>Рзамер сетки :</label>
          <input class="width-input" placeholder="Width" type="number" pattern="[0-9]+" required="">
          X
          <input class="height-input" placeholder="Height" type="number" pattern="[0-9]+" required="">
          <button class="createGrid" type="button" disabled="">Создать новую сетку</button>
        </div>
        <div class="settings-block">
          <label>Скорость :</label>
          <input class="speed-input" type="range" min="0" value="10" max="45" step="5">
        </div>
        <div class="settings-block">
          <button class="nextTic" type="button" disabled="">Следующий тик</button>
          <button class="start" type="button" disabled="">Старт</button>
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
          <button figureid="GOSPER_GLIDER_GUN" class="figure" type="button">Ружьё Госпера</button><button
            figureid="EATER_1" class="figure" type="button">Пожиратель-1</button><button figureid="GLIDER" class="figure"
            type="button">Планер</button></div>
        <div class="live-game-container"></div>`;

    expect(
      rootElement.innerHTML.split("\n").map((str) => str.trim()),
    ).toStrictEqual(divExpected.innerHTML.split("\n").map((str) => str.trim()));

    expect(rootElement.querySelector(".mark-for-dead")?.classList).toContain(
      "invisible",
    );
    expect(rootElement.querySelector(".mark-for-alive")?.classList).toContain(
      "invisible",
    );

    mainApp.markCheckbox.click();
    mainApp.markCheckbox.dispatchEvent(new Event("change"));

    expect(
      rootElement.querySelector(".mark-for-dead")?.classList,
    ).not.toContain("invisible");
    expect(
      rootElement.querySelector(".mark-for-alive")?.classList,
    ).not.toContain("invisible");

    const mockButton = document.createElement("button") as HTMLButtonElement;
    mockButton.click = jest.fn();
    mainApp.nextTicButton = mockButton;
    mainApp.startButtonClick = jest.fn();

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowLeft" }));
    expect(mockButton.click).toHaveBeenCalledTimes(0);
    expect(mainApp.speedElement.value).toBe("10");

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowUp" }));
    expect(mainApp.speedElement.value).toBe("15");

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowDown" }));
    expect(mainApp.speedElement.value).toBe("10");

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowRight" }));
    expect(mockButton.click).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));
    expect(mainApp.startButtonClick).toHaveBeenCalledTimes(1);
  });

  it("Check start function", () => {
    let game = new GameLive(getContainer(), 40, 25, false);
    game.insertFigure(game.grid[0][0], FIGURES.GOSPER_GLIDER_GUN.coordinates);
    game.insertFigure(game.grid[20][34], FIGURES.EATER_1.coordinates);

    mainApp.start();

    expect(mainApp.gridButton.disabled).toBe(false);
    expect(mainApp.startButton.disabled).toBe(false);
    expect(mainApp.nextTicButton.disabled).toBe(false);
    expect(mainApp.gameLive).toStrictEqual(game);

    mainApp.widthInput.value = "41";
    mainApp.widthInput.dispatchEvent(new Event("change"));
    game.resizeWidth(41);

    expect(
      getComputedStyle(rootElement).getPropertyValue("--field-width"),
    ).toBe("41");
    expect(mainApp.gameLive).toStrictEqual(game);

    mainApp.heightInput.value = "26";
    mainApp.heightInput.dispatchEvent(new Event("change"));
    game.resizeHeight(26);

    expect(
      getComputedStyle(rootElement).getPropertyValue("--field-height"),
    ).toBe("26");
    expect(mainApp.gameLive).toStrictEqual(game);

    game = new GameLive(getContainer(), 5, 5, false);
    mainApp.widthInput.value = "5";
    mainApp.heightInput.value = "5";
    mainApp.gridButton.dispatchEvent(new Event("click"));
    expect(mainApp.gameLive).toStrictEqual(game);

    mainApp.gameLive.nextTic = jest.fn();
    mainApp.nextTicButton.dispatchEvent(new Event("click"));
    expect(mainApp.gameLive.nextTic).toHaveBeenCalled();

    mainApp.startButtonClick = jest.fn();
    mainApp.startButton.dispatchEvent(new Event("click"));
    expect(mainApp.startButtonClick).toHaveBeenCalled();

    mainApp.markCheckbox.checked = true;
    mainApp.markCheckbox.dispatchEvent(new Event("change"));
    expect(mainApp.gameLive.markable).toBeTruthy();

    mainApp.gameStart = jest.fn();
    mainApp.gameStop = jest.fn();
    mainApp.speedElement.dispatchEvent(new Event("change"));
    expect(mainApp.gameStart).not.toHaveBeenCalled();
    expect(mainApp.gameStop).not.toHaveBeenCalled();

    mainApp.startFlag = true;
    mainApp.speedElement.dispatchEvent(new Event("change"));
    expect(mainApp.gameStart).toHaveBeenCalled();
    expect(mainApp.gameStop).toHaveBeenCalled();
  });

  it("Check startButtonClick function", () => {
    mainApp.gameStart = jest.fn();
    mainApp.gameStop = jest.fn();

    const figureButtons = Array.from(
      mainApp.figuresBlock.querySelectorAll(".figure"),
    );

    mainApp.start();
    mainApp.startButtonClick();

    expect(rootElement.classList).toContain("run");
    expect(mainApp.gameStart).toHaveBeenCalled();
    expect(mainApp.startFlag).toBeTruthy();
    expect(mainApp.startButton.innerText).toBe("Стоп");
    expect(mainApp.nextTicButton.disabled).toBeTruthy();
    expect(mainApp.gridButton.disabled).toBeTruthy();
    expect(
      figureButtons.map((button) => (button as HTMLButtonElement).disabled),
    ).toStrictEqual([true, true, true]);

    mainApp.startButtonClick();

    expect(rootElement.classList).not.toContain("run");
    expect(mainApp.gameStop).toHaveBeenCalled();
    expect(mainApp.startFlag).not.toBeTruthy();
    expect(mainApp.startButton.innerText).toBe("Старт");
    expect(mainApp.nextTicButton.disabled).not.toBeTruthy();
    expect(mainApp.gridButton.disabled).not.toBeTruthy();
    expect(
      figureButtons.map((button) => (button as HTMLButtonElement).disabled),
    ).toStrictEqual([false, false, false]);
  });

  it("Check gameStart and gameStop function", () => {
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");

    mainApp.start();
    mainApp.gameLive.nextTic = jest.fn(() => true);
    mainApp.startButtonClick = jest.fn();

    mainApp.gameStop();
    expect(mainApp.timerId).toBe(undefined);

    mainApp.gameStart();
    expect(mainApp.timerId).not.toBe(undefined);
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenLastCalledWith(
      expect.any(Function),
      1000 / 15,
    );

    mainApp.gameStop();
    expect(mainApp.timerId).toBe(undefined);
  });

  it("Check gameStartFunction function", () => {
    mainApp.start();
    mainApp.gameLive.nextTic = jest.fn(() => true);
    mainApp.startButtonClick = jest.fn();

    mainApp.gameStartFunction()();
    expect(mainApp.gameLive.nextTic).toHaveBeenCalledTimes(1);
    expect(mainApp.startButtonClick).toHaveBeenCalledTimes(1);

    mainApp.gameLive.nextTic = jest.fn(() => false);
    mainApp.startButtonClick = jest.fn();

    mainApp.gameStartFunction()();
    expect(mainApp.gameLive.nextTic).toHaveBeenCalledTimes(1);
    expect(mainApp.startButtonClick).toHaveBeenCalledTimes(0);
  });

  it("Checks figures button", () => {
    mainApp.start();

    mainApp.gameLive.showFigure = jest.fn(() => {
      const func = () => true;
      return func;
    });

    mainApp.widthInput.value = "5";
    mainApp.heightInput.value = "5";
    mainApp.gridButton.dispatchEvent(new Event("click"));

    const figureButtons = Array.from(
      mainApp.figuresBlock.querySelectorAll(".figure"),
    );

    const event = new Event("click");
    mainApp.figuresBlock.dispatchEvent(event);
    expect((figureButtons[0] as HTMLButtonElement).disabled).not.toBeTruthy();
    expect((figureButtons[1] as HTMLButtonElement).disabled).not.toBeTruthy();
    expect((figureButtons[2] as HTMLButtonElement).disabled).not.toBeTruthy();
    expect(mainApp.gameLive.showFigure).not.toHaveBeenCalled();

    Object.defineProperty(event, "target", {
      value: figureButtons[2],
      configurable: true,
    });
    mainApp.figuresBlock.dispatchEvent(event);

    expect((figureButtons[0] as HTMLButtonElement).disabled).toBeTruthy();
    expect((figureButtons[1] as HTMLButtonElement).disabled).toBeTruthy();
    expect((figureButtons[2] as HTMLButtonElement).disabled).toBeTruthy();
    expect(mainApp.gameLive.showFigure).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event("click"));
    expect((figureButtons[0] as HTMLButtonElement).disabled).not.toBeTruthy();
    expect((figureButtons[1] as HTMLButtonElement).disabled).not.toBeTruthy();
    expect((figureButtons[2] as HTMLButtonElement).disabled).not.toBeTruthy();
  });
});
