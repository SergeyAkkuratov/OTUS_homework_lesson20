// eslint-disable-next-line no-shadow
export enum CellType {
  dead = "dead",
  alive = "alive",
  markForDead = "mark-for-dead",
  markForAlive = "mark-for-alive",
  markForDeadInvisible = "mark-for-dead-invisible",
  markForAliveInvisible = "mark-for-alive-invisible",
  unknown = "",
}

export default class Cell {
  cellElement: HTMLElement;

  type: CellType;

  typeNextTic: CellType;

  coorX: number;

  coorY: number;

  constructor(coorX: number, coorY: number, type?: CellType) {
    this.coorX = coorX;
    this.coorY = coorY;
    this.type = type ?? CellType.dead;
    this.typeNextTic = CellType.unknown;

    this.cellElement = document.createElement("cell");
    this.cellElement.classList.add("cell");
    this.cellElement.classList.add(this.type);
    this.cellElement.setAttribute("coor-x", `${this.coorX}`);
    this.cellElement.setAttribute("coor-y", `${this.coorY}`);
  }

  onClick() {
    switch (this.type) {
      case CellType.alive:
      case CellType.markForAlive:
        this.setType(CellType.dead);
        break;
      case CellType.dead:
      case CellType.markForDead:
        this.setType(CellType.alive);
        break;
      default:
        break;
    }
  }

  getCellElement(): HTMLElement {
    return this.cellElement;
  }

  setType(type: CellType) {
    this.type = type;
    this.cellElement.classList.remove(...this.cellElement.classList);
    this.cellElement.classList.add("cell");
    this.cellElement.classList.add(this.type);
  }

  mark(type: CellType) {
    this.typeNextTic = type;
    this.cellElement.classList.add(type);
  }

  changeType() {
    switch (this.typeNextTic) {
      case CellType.markForAlive:
      case CellType.markForAliveInvisible:
        this.setType(CellType.alive);
        break;
      case CellType.markForDead:
      case CellType.markForDeadInvisible:
        this.setType(CellType.dead);
        break;
      default:
        break;
    }
  }

  markClear() {
    this.typeNextTic = CellType.unknown;
    this.cellElement.classList.remove(CellType.markForAlive);
    this.cellElement.classList.remove(CellType.markForDead);
  }
}
