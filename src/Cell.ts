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

  marked = false;

  constructor(coorX: number, coorY: number, type?: CellType) {
    this.coorX = coorX;
    this.coorY = coorY;
    this.type = type ?? CellType.dead;
    this.typeNextTic = CellType.unknown;

    this.cellElement = this.createCellElement();
  }

  createCellElement(): HTMLElement {
    const element = document.createElement("cell");

    element.classList.add("cell");
    element.classList.add(this.type);
    element.setAttribute("coor-x", `${this.coorX}`);
    element.setAttribute("coor-y", `${this.coorY}`);
    element.title = `Cell(${this.coorX},${this.coorY})`;

    return element;
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
    this.marked = true;
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
    this.marked = false;
    this.typeNextTic = CellType.unknown;
    this.cellElement.classList.remove(CellType.markForAlive);
    this.cellElement.classList.remove(CellType.markForDead);
  }
}
