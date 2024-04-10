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
      "5,1;6,1;5,2;6,2;5,11;6,11;7,11;4,12;8,12;3,13;9,13;3,14;9,14;6,15;4,16;8,16;5,17;6,17;7,17;6,18;3,21;4,21;5,21;3,22;4,22;5,22;2,23;6,23;1,25;2,25;6,25;7,25;3,35;4,35;3,36;4,36",
  },
  EATER_1: {
    name: "Пожиратель-1",
    coordinates: "1,1;2,1;1,2;2,3;3,3;4,3;4,4",
  },
  GLIDER: {
    name: "Планер",
    coordinates: "3,1;1,2;3,2;2,3;3,3",
  },
};

export default FIGURES;