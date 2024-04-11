/* eslint-disable no-nested-ternary */
import Cell, { CellType } from "./Cell";
import FIGURES from "./figures";

export default class GameLive {
  container: HTMLElement;

  width: number;

  height: number;

  grid: Array<Array<Cell>> = [];

  markable: boolean;

  cellToMark: Set<Cell> = new Set();

  cellToChangeNextTic: Set<Cell> = new Set();

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
  }

  fillGrid(width?: number, height?: number) {
    this.width = width ?? this.width;
    this.height = height ?? this.height;
    this.grid = [];
    for (let y = 0; y < this.height; y += 1) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x += 1) {
        this.grid[y][x] = new Cell(x, y);
      }
    }
    this.showGrid();
  }

  resizeWidth(width: number) {
    if (this.width !== width) {
      if (this.width > width) {
        this.grid.forEach((row) => row.splice(width, this.width - width));
      } else {
        this.grid.forEach((row, y) => {
          for (let x = this.width; x < width; x += 1) {
            row.push(new Cell(x, y));
          }
        });
      }
      this.width = width;
      this.showGrid();
    }
  }

  resizeHeight(height: number) {
    if (this.height !== height) {
      if (this.height > height) {
        this.grid.splice(height, this.height - height);
      } else {
        for (let y = this.height; y < height; y += 1) {
          this.grid[y] = [];
          for (let x = 0; x < this.width; x += 1) {
            this.grid[y][x] = new Cell(x, y);
          }
        }
      }
      this.height = height;
      this.showGrid();
    }
  }

  showGrid() {
    this.container.innerHTML = "";
    this.grid.forEach((row) => {
      row.forEach((cell) => this.container.appendChild(cell.getCellElement()));
    });
  }

  markGrid() {
    this.cellToChangeNextTic.clear();

    const cells: Set<Cell> = new Set();
    [...this.cellToMark].forEach((cell) => {
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
        this.cellToChangeNextTic.add(cell);
      }
      if (cell.type === CellType.dead && aliveCellNeighbours === 3) {
        if (this.markable) cell.mark(CellType.markForAlive);
        else cell.mark(CellType.markForAliveInvisible);
        this.cellToChangeNextTic.add(cell);
      }
    });
  }

  cellUpdateCheck(cell: Cell) {
    if (cell.type === CellType.alive) {
      this.cellToMark.add(cell);
    } else if (cell.type === CellType.dead) {
      this.cellToMark.delete(cell);
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

  nextTic(): boolean {
    this.grid.forEach((row) => {
      row
        .filter((cell) => cell.marked)
        .forEach((cell) => {
          cell.changeType();
          this.cellUpdateCheck(cell);
        });
    });

    this.cellToChangeNextTic.forEach((cell) => {
      cell.changeType();
      this.cellUpdateCheck(cell);
    });

    this.markGrid();

    return this.cellToChangeNextTic.size > 0;
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
    const result: Cell = this.grid[y][x];
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

    this.container.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const element = event.target as HTMLElement;
      currentCell = this.getCell(
        Number(element.getAttribute("coor-x")),
        Number(element.getAttribute("coor-y")),
      );
      contextMenu.style.left = `${event.clientX}px`;
      contextMenu.style.top = `${event.clientY}px`;
      contextMenu.style.display = "block";
    });

    window.addEventListener("click", () => {
      contextMenu.style.display = "none";
    });
  }
}
