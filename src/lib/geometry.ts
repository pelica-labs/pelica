export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Line = {
  from: Coordinates;
  to: Coordinates;
  style: {
    strokeColor: string;
    strokeWidth: number;
  };
};

export type PolyLine = {
  points: Coordinates[];
  style: {
    strokeColor: string;
    strokeWidth: number;
  };
};

export type Point = {
  coordinates: Coordinates;
  style: {
    strokeColor: string;
    strokeWidth: number;
  };
};

export const joinPoints = (points: Coordinates[]): Coordinates[][] => {
  const lines: Coordinates[][] = [];

  for (let i = 1; i < points.length; i++) {
    const previousPoint = points[i - 1];
    const point = points[i];

    lines.push([previousPoint, point]);
  }

  return lines;
};
