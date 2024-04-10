/* eslint-disable no-nested-ternary */
import Cell, { CellType } from "./Cell";
import FIGURES from "./figures";

export default class GameLive {
  container: HTMLElement;

  width: number;

  height: number;

  grid: Array<Cell> = [];

  markable: boolean;

  cellToUpdate: Set<Cell> = new Set();

  constructor(
    container: HTMLElement,
    width: number,
    height: number,
    markable?: boolean,
  ) {
    this.container = container;
    this.width = width;
    this.height = height;
    this.markable = markable ?? false;

    this.fillGrid();

    this.container.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement) {
        const element = event.target as HTMLElement;
        const cell = this.getCell(
          Number(element.getAttribute("coor-x")),
          Number(element.getAttribute("coor-y")),
        );
        cell.onClick();
        this.cellUpdateCheck(cell);
        this.markGrid();
      }
    });

    this.contextMenuInit();

    this.showGrid();
  }

  fillGrid() {
    this.grid = [];
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.grid.push(new Cell(x, y));
      }
    }
  }

  showGrid() {
    this.container.innerHTML = "";
    this.grid.forEach((cell) => {
      this.container.appendChild(cell.getCellElement());
    });
  }

  markGrid() {
    const cells: Set<Cell> = new Set();
    [...this.cellToUpdate].forEach((cell) => {
      cells.add(cell);
      this.getCellNeighbours(cell).forEach(cells.add, cells);
    });
    cells.forEach((cell) => {
      cell.markClear();
      const aliveCellNeighbours = this.getCellNeighbours(cell).reduce(
        (result, el: Cell) =>
          el.type === CellType.alive ? result + 1 : result,
        0,
      );
      if (
        cell.type === CellType.alive &&
        (aliveCellNeighbours < 2 || aliveCellNeighbours > 3)
      ) {
        if (this.markable) cell.mark(CellType.markForDead);
        else cell.mark(CellType.markForDeadInvisible);
      }
      if (cell.type === CellType.dead && aliveCellNeighbours === 3) {
        if (this.markable) cell.mark(CellType.markForAlive);
        else cell.mark(CellType.markForAliveInvisible);
      }
    });
  }

  cellUpdateCheck(cell: Cell) {
    if (cell.type === CellType.alive) {
      this.cellToUpdate.add(cell);
    } else if (cell.type === CellType.dead) {
      this.cellToUpdate.delete(cell);
    }
  }

  getCellNeighbours(cell: Cell) {
    return [
      this.getCell(cell.coorX - 1, cell.coorY - 1),
      this.getCell(cell.coorX, cell.coorY - 1),
      this.getCell(cell.coorX + 1, cell.coorY - 1),
      this.getCell(cell.coorX - 1, cell.coorY),
      this.getCell(cell.coorX + 1, cell.coorY),
      this.getCell(cell.coorX - 1, cell.coorY + 1),
      this.getCell(cell.coorX, cell.coorY + 1),
      this.getCell(cell.coorX + 1, cell.coorY + 1),
    ];
  }

  nextTic() {
    this.grid
      .filter((cell) => cell.marked)
      .forEach((cell) => {
        cell.changeType();
        this.cellUpdateCheck(cell);
      });
    this.markGrid();
  }

  getCell(coorX: number, coorY: number): Cell {
    const x =
      coorX >= 0 && coorX < this.width
        ? coorX
        : coorX < 0
          ? this.width + coorX
          : coorX - this.width;
    const y =
      coorY >= 0 && coorY < this.height
        ? coorY
        : coorY < 0
          ? this.height + coorY
          : coorY - this.height;
    const result: Cell = this.grid.find(
      (cell) => cell.coorX === x && cell.coorY === y,
    )!;
    if (result == null || result === undefined) {
      throw Error(`Не смогли получить клетку по координатам x: ${x}, y: ${y}`);
    } else {
      return result;
    }
  }

  insertFigure(startCell: Cell, figureCoor: string) {
    figureCoor.split(";").forEach((coorPair) => {
      const [x, y] = coorPair.split(",");
      const cell = this.getCell(
        Number(x) + startCell.coorX,
        Number(y) + startCell.coorY,
      );
      cell.setType(CellType.alive);
      this.cellUpdateCheck(cell);
    });
  }

  contextMenuInit() {
    const contextMenu = document.querySelector(
      ".context-menu-open",
    ) as HTMLElement;
    const menuList = contextMenu.querySelector("ul") as HTMLElement;
    let currentCell: Cell;

    Object.keys(FIGURES).forEach((figureKey) => {
      const figure = FIGURES[figureKey];
      menuList.innerHTML += `<li figure="${figureKey}">${figure.name}</li>`;
    });

    menuList.addEventListener("click", (event) => {
      const li = event.target as HTMLElement;
      const figure = FIGURES[li.getAttribute("figure")!];
      this.insertFigure(currentCell, figure.coordinates);
    });

    this.container.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const element = e.target as HTMLElement;
      currentCell = this.getCell(
        Number(element.getAttribute("coor-x")),
        Number(element.getAttribute("coor-y")),
      );
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.display = "block";
    });

    window.addEventListener("click", () => {
      contextMenu.style.display = "none";
    });
  }
}
