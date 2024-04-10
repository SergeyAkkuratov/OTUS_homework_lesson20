interface Figure {
  name: string;
  coordinates: string;
}

interface Figures {
  [key: string]: Figure;
}

const FIGURES: Figures = {
  GOSPER_GLIDER_GUN: {
    name: "Ружьё Госпера",
    coordinates:
      "1,5;1,6;2,5;2,6;11,5;11,6;11,7;12,4;12,8;13,3;13,9;14,3;14,9;15,6;16,4;16,8;17,5;17,6;17,7;18,6;21,3;21,4;21,5;22,3;22,4;22,5;23,2;23,6;25,1;25,2;25,6;25,7;35,3;35,4;36,3;36,4",
  },
  EATER_1: {
    name: "Пожиратель-1",
    coordinates: "1,1;1,2;2,1;3,2;3,3;3,4;4,4",
  },
  GLIDER: {
    name: "Планер",
    coordinates: "1,3;2,1;2,3;3,2;3,3",
  },
};

export default FIGURES;
