/* eslint-disable no-nested-ternary */
import Cell, { CellType } from "./Cell";

export default class GameLive {
  container: HTMLElement;

  width: number;

  height: number;

  grid: Array<Cell> = [];

  markable: boolean;

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
        this.markGrid();
      }
    });
  }

  fillGrid() {
    this.grid = [];
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
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
    const cellToUpdate: Set<Cell> = new Set();
    this.grid
      .filter((cell) => cell.type === CellType.alive)
      .forEach((cell) => {
        this.getCellNeighbours(cell).forEach((el) => cellToUpdate.add(el));
      });
    cellToUpdate.forEach((cell) => {
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
    this.grid.forEach((cell) => cell.changeType());
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
}
