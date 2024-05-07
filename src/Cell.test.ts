import Cell, { CellType, MarkCellType } from "./Cell";

describe("Cell class tests", () => {
  let cell: Cell;

  function getCellElementWithType(
    x: number,
    y: number,
    type: string,
  ): HTMLElement {
    const cellElement = document.createElement("cell");
    cellElement.classList.add("cell");
    cellElement.classList.add(type);
    cellElement.setAttribute("coor-x", `${x}`);
    cellElement.setAttribute("coor-y", `${y}`);
    cellElement.title = `Cell(${x},${y})`;

    return cellElement;
  }

  beforeEach(() => {
    cell = new Cell(0, 0);
  });

  it("Check constructor", () => {
    expect(cell.coorX).toBe(0);
    expect(cell.coorY).toBe(0);
    expect(cell.type).toBe(CellType.dead);
    expect(cell.typeNextTic).toBe(undefined);
    expect(cell.marked).toBe(false);
    expect(cell.cellElement).toStrictEqual(
      getCellElementWithType(0, 0, "dead"),
    );
  });

  it("Check onClick function", () => {
    cell.onClick();

    expect(cell.type).toBe(CellType.alive);
    expect(cell.cellElement).toStrictEqual(
      getCellElementWithType(0, 0, "alive"),
    );

    cell.onClick();

    expect(cell.type).toBe(CellType.dead);
    expect(cell.cellElement).toStrictEqual(
      getCellElementWithType(0, 0, "dead"),
    );
  });

  it.each([[CellType.alive], [CellType.dead]])(
    "Check setType function",
    (type: CellType) => {
      cell.setType(type);
      expect(cell.type).toBe(type);
      expect(cell.cellElement).toStrictEqual(
        getCellElementWithType(0, 0, type),
      );
    },
  );

  it.each([
    [MarkCellType.markForAlive],
    [MarkCellType.markForDead],
    [MarkCellType.markForAliveInvisible],
    [MarkCellType.markForDeadInvisible],
  ])("Check mark function for %p", (type: MarkCellType) => {
    const element = getCellElementWithType(0, 0, CellType.dead);
    element.classList.add(type);

    cell.mark(type);

    expect(cell.typeNextTic).toBe(type);
    expect(cell.marked).toBe(true);
    expect(cell.cellElement).toStrictEqual(element);
  });

  it.each([
    [MarkCellType.markForAlive, CellType.dead, CellType.alive],
    [MarkCellType.markForDead, CellType.alive, CellType.dead],
    [MarkCellType.markForAliveInvisible, CellType.dead, CellType.alive],
    [MarkCellType.markForDeadInvisible, CellType.alive, CellType.dead],
  ])(
    "Check processMark function for %p",
    (
      markType: MarkCellType,
      startCellType: CellType,
      finishCellType: CellType,
    ) => {
      cell.type = startCellType;
      const element = getCellElementWithType(0, 0, finishCellType);

      cell.mark(markType);
      cell.processMark();

      expect(cell.type).toBe(finishCellType);
      expect(cell.typeNextTic).toBe(undefined);
      expect(cell.marked).toBe(false);
      expect(cell.cellElement).toStrictEqual(element);
    },
  );

  it("Check markClear function", () => {
    const element = getCellElementWithType(0, 0, CellType.dead);
    element.classList.add(MarkCellType.markForAliveInvisible);

    cell.mark(MarkCellType.markForAliveInvisible);

    expect(cell.typeNextTic).toBe(MarkCellType.markForAliveInvisible);
    expect(cell.marked).toBe(true);
    expect(cell.cellElement).toStrictEqual(element);

    element.classList.remove(MarkCellType.markForAliveInvisible);
    cell.markClear();

    expect(cell.typeNextTic).toBe(undefined);
    expect(cell.marked).toBe(false);
    expect(cell.cellElement).toStrictEqual(element);
  });
});
