/* eslint-disable default-case */
// eslint-disable-next-line no-shadow
export enum CellType {
  dead = "dead",
  alive = "alive"
};

// eslint-disable-next-line no-shadow
export enum MarkCellType {
  markForDead = "mark-for-dead",
  markForAlive = "mark-for-alive",
  markForDeadInvisible = "mark-for-dead-invisible",
  markForAliveInvisible = "mark-for-alive-invisible"
};

export default class Cell {
  readonly coorX: number;

  readonly coorY: number;

  readonly cellElement: HTMLElement;

  type: CellType;

  typeNextTic: MarkCellType | undefined = undefined;

  marked = false;

  constructor(coorX: number, coorY: number, type?: CellType) {
    this.coorX = coorX;
    this.coorY = coorY;
    this.type = type ?? CellType.dead;

    this.cellElement = document.createElement("cell");

    this.cellElement.classList.add("cell");
    this.cellElement.classList.add(this.type);
    this.cellElement.setAttribute("coor-x", `${this.coorX}`);
    this.cellElement.setAttribute("coor-y", `${this.coorY}`);
    this.cellElement.title = `Cell(${this.coorX},${this.coorY})`;
  }

  onClick() {
    switch (this.type) {
      case CellType.alive:
        this.setType(CellType.dead);
        break;
      case CellType.dead:
        this.setType(CellType.alive);
        break;
    }
  }

  setType(type: CellType) {
    this.type = type;
    this.cellElement.classList.remove(...this.cellElement.classList);
    this.cellElement.classList.add("cell");
    this.cellElement.classList.add(this.type);
  }

  mark(type: MarkCellType) {
    this.marked = true;
    this.typeNextTic = type;
    this.cellElement.classList.add(type);
  }

  processMark() {
    switch (this.typeNextTic) {
      case MarkCellType.markForAlive:
      case MarkCellType.markForAliveInvisible:
        this.setType(CellType.alive);
        break;
      case MarkCellType.markForDead:
      case MarkCellType.markForDeadInvisible:
        this.setType(CellType.dead);
        break;
    }
    this.marked = false;
    this.typeNextTic = undefined;
    this.cellElement.classList.remove(MarkCellType.markForAlive);
    this.cellElement.classList.remove(MarkCellType.markForDead);
  }
}
