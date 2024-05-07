import Cell, { CellType, MarkCellType } from "./Cell";
import GameLive from "./GameLive";
import FIGURES from "./figures";

describe("GameLive class tests", () => {
  const rootElement = document.createElement("div") as HTMLElement;
  let gameLive: GameLive;

  beforeEach(() => {
    gameLive = new GameLive(rootElement, 5, 5);
  });

  function getGrid(width: number, height: number): Array<Array<Cell>> {
    const grid: Array<Array<Cell>> = [];
    for (let y = 0; y < height; y += 1) {
      grid[y] = [];
      for (let x = 0; x < width; x += 1) {
        grid[y][x] = new Cell(x, y);
      }
    }
    return grid;
  }

  function setEventProperty(
    event: Event,
    propertyName: string,
    propertyValue: HTMLElement,
  ) {
    Object.defineProperty(event, propertyName, {
      value: propertyValue,
      configurable: true,
    });
  }

  it("Constructor tests", () => {
    const grid = getGrid(5, 5);
    const cell = grid[0][0];

    const element = rootElement.querySelector(
      `cell[coor-x = '0'][coor-y = '0']`,
    ) as HTMLElement;
    element.click();
    cell.onClick();
    cell.mark(MarkCellType.markForDeadInvisible);

    expect(gameLive.width).toBe(5);
    expect(gameLive.height).toBe(5);
    expect(gameLive.markable).toBe(false);
    expect(gameLive.container).toBe(rootElement);
    expect(gameLive.grid).toStrictEqual(grid);

    gameLive.currentHoverCell = new Cell(0, 0);
    element.click();
    expect(gameLive.grid).toStrictEqual(grid);
  });

  it("check fillGrid function", () => {
    gameLive.fillGrid(10, 10);
    expect(gameLive.grid).toStrictEqual(getGrid(10, 10));
  });

  it("Check resizeWidth funcrion", () => {
    gameLive.resizeWidth(10);
    expect(gameLive.grid).toStrictEqual(getGrid(10, 5));

    gameLive.resizeWidth(3);
    expect(gameLive.grid).toStrictEqual(getGrid(3, 5));

    gameLive.resizeWidth(3);
    expect(gameLive.grid).toStrictEqual(getGrid(3, 5));
  });

  it("Check resizeHeight funcrion", () => {
    gameLive.resizeHeight(10);
    expect(gameLive.grid).toStrictEqual(getGrid(5, 10));

    gameLive.resizeHeight(3);
    expect(gameLive.grid).toStrictEqual(getGrid(5, 3));

    gameLive.resizeHeight(3);
    expect(gameLive.grid).toStrictEqual(getGrid(5, 3));
  });

  it("Check showGrid function", () => {
    const div = document.createElement("div");
    getGrid(10, 10).forEach((row) =>
      row.forEach((cell) => div.appendChild(cell.cellElement)),
    );

    gameLive.fillGrid(10, 10);
    gameLive.showGrid();

    expect(rootElement.innerHTML).toBe(div.innerHTML);
  });

  it("Check markGrid (invisible) function", () => {
    const grid = getGrid(5, 5);
    for (let i = 1; i < 4; i += 1) {
      (
        rootElement.querySelector(
          `cell[coor-x = '${i}'][coor-y = '1']`,
        ) as HTMLElement
      ).click();
      grid[1][i].onClick();
    }

    gameLive.markGrid();

    grid[0][2].mark(MarkCellType.markForAliveInvisible);
    grid[2][2].mark(MarkCellType.markForAliveInvisible);
    grid[1][1].mark(MarkCellType.markForDeadInvisible);
    grid[1][3].mark(MarkCellType.markForDeadInvisible);

    expect(gameLive.grid).toStrictEqual(grid);
  });

  it("Check markGrid function", () => {
    gameLive.markable = true;
    const grid = getGrid(5, 5);
    for (let i = 1; i < 4; i += 1) {
      (
        rootElement.querySelector(
          `cell[coor-x = '${i}'][coor-y = '1']`,
        ) as HTMLElement
      ).click();
      grid[1][i].onClick();
    }

    gameLive.markGrid();

    grid[0][2].mark(MarkCellType.markForAlive);
    grid[2][2].mark(MarkCellType.markForAlive);
    grid[1][1].mark(MarkCellType.markForDead);
    grid[1][3].mark(MarkCellType.markForDead);

    expect(gameLive.grid).toStrictEqual(grid);
  });

  it("Check cellUpdateCheck function", () => {
    const cell = new Cell(0, 0, CellType.alive);
    const set = new Set();
    set.add(cell);

    gameLive.cellUpdateCheck(cell);

    expect(gameLive.cellToMark).toStrictEqual(set);

    cell.setType(CellType.dead);
    set.delete(cell);

    gameLive.cellUpdateCheck(cell);

    expect(gameLive.cellToMark).toStrictEqual(set);
  });

  it("Check getCellNeighbours function", () => {
    const expected = [
      new Cell(1, 0),
      new Cell(4, 0),
      new Cell(0, 1),
      new Cell(1, 1),
      new Cell(4, 1),
      new Cell(0, 4),
      new Cell(1, 4),
      new Cell(4, 4),
    ];

    expect(gameLive.getCellNeighbours(new Cell(0, 0))).toEqual(
      expect.arrayContaining(expected),
    );
  });

  it("Check nextTic function", () => {
    const grid = getGrid(5, 5);
    grid[0][2].onClick();
    grid[1][2].onClick();
    grid[2][2].onClick();

    grid[0][2].mark(MarkCellType.markForDeadInvisible);
    grid[2][2].mark(MarkCellType.markForDeadInvisible);

    grid[1][1].mark(MarkCellType.markForAliveInvisible);
    grid[1][3].mark(MarkCellType.markForAliveInvisible);

    for (let i = 1; i < 4; i += 1) {
      (
        rootElement.querySelector(
          `cell[coor-x = '${i}'][coor-y = '1']`,
        ) as HTMLElement
      ).click();
    }

    gameLive.nextTic();

    expect(gameLive.grid).toStrictEqual(grid);
  });

  it.each([
    [0, 0, 0, 0],
    [4, 4, 4, 4],
    [11, 0, 1, 0],
    [-8, 0, 2, 0],
    [0, 5, 0, 0],
    [0, -3, 0, 2],
  ])(
    "Checks getCell function",
    (x: number, y: number, expectX: number, expectY: number) => {
      expect(gameLive.getCell(x, y)).toBe(gameLive.grid[expectY][expectX]);
    },
  );

  it("Check insertFigure function", () => {
    const grid = getGrid(5, 5);
    grid[1][2].onClick();
    grid[2][3].onClick();
    grid[3][1].onClick();
    grid[3][2].onClick();
    grid[3][3].onClick();

    gameLive.insertFigure(gameLive.grid[0][0], FIGURES.GLIDER.coordinates);

    expect(gameLive.grid).toStrictEqual(grid);
  });

  it("Check deleteFigure function", () => {
    const grid = getGrid(5, 5);

    gameLive.insertFigure(gameLive.grid[0][0], FIGURES.GLIDER.coordinates);
    gameLive.deleteFigure(gameLive.grid[0][0], FIGURES.GLIDER.coordinates);

    expect(gameLive.grid).toStrictEqual(grid);
  });

  it("Check showFigure function", () => {
    let grid = getGrid(5, 5);
    grid[1][1].onClick();
    grid[1][2].onClick();
    grid[2][1].onClick();
    grid[2][3].onClick();
    grid[3][3].onClick();
    grid[4][3].onClick();
    grid[4][4].onClick();

    const stopShowingFunction = gameLive.showFigure(FIGURES.EATER_1);
    const eventMouseOver = new MouseEvent("mouseover");
    const eventMouseOut = new MouseEvent("mouseout");

    setEventProperty(
      eventMouseOut,
      "relatedTarget",
      rootElement.querySelector(
        `cell[coor-x = '1'][coor-y = '0']`,
      ) as HTMLElement,
    );
    rootElement.dispatchEvent(eventMouseOut);

    expect(gameLive.grid).toStrictEqual(getGrid(5, 5));

    setEventProperty(
      eventMouseOver,
      "target",
      rootElement.querySelector(
        `cell[coor-x = '0'][coor-y = '0']`,
      ) as HTMLElement,
    );
    rootElement.dispatchEvent(eventMouseOver);

    expect(gameLive.grid).toStrictEqual(grid);

    setEventProperty(
      eventMouseOver,
      "target",
      rootElement.querySelector(
        `cell[coor-x = '1'][coor-y = '0']`,
      ) as HTMLElement,
    );
    rootElement.dispatchEvent(eventMouseOver);

    expect(gameLive.grid).toStrictEqual(grid);

    grid = getGrid(5, 5);
    grid[1][2].onClick();
    grid[1][3].onClick();
    grid[2][2].onClick();
    grid[2][4].onClick();
    grid[3][4].onClick();
    grid[4][4].onClick();
    grid[4][0].onClick();

    rootElement.dispatchEvent(eventMouseOut);
    rootElement.dispatchEvent(eventMouseOver);

    expect(gameLive.grid).toStrictEqual(grid);

    stopShowingFunction();
    rootElement.dispatchEvent(eventMouseOut);
    rootElement.dispatchEvent(eventMouseOver);

    expect(gameLive.grid).toStrictEqual(grid);
  });
});
