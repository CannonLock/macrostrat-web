import { SETTINGS } from "../Settings";

// https://devtiles.macrostrat.org/carto-slim/4/0/5.mvt

export const mapStyle = {
  version: 8,
  sources: {
    burwell: {
      type: "vector",
      tiles: [`${SETTINGS.burwellTileDomain}/carto-slim/{z}/{x}/{y}.mvt`],
      tileSize: 512
    },
    elevationPoints: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    },
    elevationLine: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    },
    elevationMarker: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    }
  },
  layers: [
    {
      id: "burwell_fill",
      type: "fill",
      source: "burwell",
      "source-layer": "units",
      filter: ["!=", "color", ""],
      minzoom: 0,
      maxzoom: 16,
      paint: {
        "fill-color": {
          property: "color",
          type: "identity"
        },
        "fill-opacity": {
          stops: [
            [0, 0.8],
            [12, 0.5]
          ]
        }
      }
    },
    {
      id: "burwell_stroke",
      type: "line",
      source: "burwell",
      "source-layer": "units",
      filter: ["!=", "color", ""],
      minzoom: 0,
      maxzoom: 16,
      paint: {
        //  "line-color": "#777777",
        // "line-width": 0,
        "line-color": {
          property: "color",
          type: "identity"
        },
        "line-width": {
          stops: [
            [0, 0.15],
            [1, 0.15],
            [2, 0.15],
            [3, 0.15],
            [4, 0.2],
            [5, 0.4],
            [6, 0.05],
            [7, 0.1],
            [8, 0.4],
            [9, 0.5],
            [10, 0.35],
            [11, 0.4],
            [12, 0.5],
            [13, 0.55],
            [14, 0.6],
            [15, 0.7],
            [16, 0.8]
          ]
        },
        "line-opacity": {
          stops: [
            [0, 0],
            [4, 1]
          ]
        }
      }
    },
    // Hide water
    {
      id: "burwell_water_fill",
      type: "fill",
      source: "burwell",
      "source-layer": "units",
      filter: ["==", "color", ""],
      minzoom: 0,
      maxzoom: 16,
      paint: {
        "fill-opacity": 0
      }
    },
    {
      id: "burwell_water_line",
      type: "line",
      source: "burwell",
      "source-layer": "units",
      filter: ["==", "color", ""],
      minzoom: 0,
      maxzoom: 16,
      paint: {
        "line-opacity": 0,
        "line-width": 1
      }
    },
    {
      id: "faults",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: [
        "in",
        "type",
        "fault",
        "normal fault",
        "thrust fault",
        "strike-slip fault",
        "reverse fault",
        "growth fault",
        "fault zone",
        "zone"
      ],
      minzoom: 0,
      maxzoom: 16,
      paint: {
        "line-color": "#000000",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          ["case", ["!=", ["get", "name"], ""], 0.6, 0.3],
          1,
          ["case", ["!=", ["get", "name"], ""], 0.6, 0.3],
          2,
          ["case", ["!=", ["get", "name"], ""], 0.6, 0.3],
          3,
          ["case", ["!=", ["get", "name"], ""], 0.6, 0.3],
          4,
          ["case", ["!=", ["get", "name"], ""], 1, 0.5],
          5,
          ["case", ["!=", ["get", "name"], ""], 1.2, 0.6],
          6,
          ["case", ["!=", ["get", "name"], ""], 0.9, 0.45],
          7,
          ["case", ["!=", ["get", "name"], ""], 0.8, 0.4],
          8,
          ["case", ["!=", ["get", "name"], ""], 1.4, 0.7],
          9,
          ["case", ["!=", ["get", "name"], ""], 1.6, 0.8],
          10,
          ["case", ["!=", ["get", "name"], ""], 1.4, 0.7],
          11,
          ["case", ["!=", ["get", "name"], ""], 2.2, 1.1],
          12,
          ["case", ["!=", ["get", "name"], ""], 2.6, 1.3],
          13,
          ["case", ["!=", ["get", "name"], ""], 3, 1.5],
          14,
          ["case", ["!=", ["get", "name"], ""], 3.2, 1.6],
          15,
          ["case", ["!=", ["get", "name"], ""], 3.5, 1.75],
          16,
          ["case", ["!=", ["get", "name"], ""], 4.4, 2.2]
        ],
        "line-opacity": 1
      },
      layout: {
        "line-join": "round",
        "line-cap": "round"
      }
    },
    {
      id: "moraines",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "moraine"],
      minzoom: 12,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#3498DB",
        "line-dasharray": [1, 2],
        "line-width": {
          stops: [
            [10, 1],
            [11, 2],
            [12, 2],
            [13, 2.5],
            [14, 3],
            [15, 3]
          ]
        },
        "line-opacity": {
          stops: [
            [10, 0.2],
            [13, 1]
          ]
        }
      }
    },
    {
      id: "eskers",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "esker"],
      minzoom: 12,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#00FFFF",
        "line-dasharray": [1, 4],
        "line-width": {
          stops: [
            [10, 1],
            [11, 2],
            [12, 2],
            [13, 2.5],
            [14, 3],
            [15, 3]
          ]
        },
        "line-opacity": {
          stops: [
            [10, 0.2],
            [13, 1]
          ]
        }
      }
    },
    {
      id: "lineaments",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "lineament"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#000000",
        "line-dasharray": [2, 2, 7, 2],
        "line-width": {
          stops: [
            [9, 1],
            [10, 1],
            [11, 2],
            [12, 2],
            [13, 2.5],
            [14, 3],
            [15, 3]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "synclines",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "syncline"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#F012BE",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "monoclines",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "monocline"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#F012BE",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "folds",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "fold"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#F012BE",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "dikes",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "dike"],
      minzoom: 6,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#FF4136",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": {
          stops: [
            [6, 0.2],
            [10, 1]
          ]
        }
      }
    },
    {
      id: "anticlines",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "anticline"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#F012BE",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "flows",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "flow"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#FF4136",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "sills",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "sill"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#FF4136",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "veins",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["==", "type", "vein"],
      minzoom: 0,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#FF4136",
        "line-width": {
          stops: [
            [0, 1],
            [7, 0.25],
            [8, 0.4],
            [9, 0.45],
            [10, 0.45],
            [11, 0.6],
            [12, 0.7],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": {
          stops: [
            [6, 0.2],
            [10, 1]
          ]
        }
      }
    },
    {
      id: "marker_beds",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["in", "type", "marker bed", "bed"],
      minzoom: 12,
      maxzoom: 16,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#333333",
        "line-width": {
          stops: [
            [10, 0.8],
            [11, 0.8],
            [12, 0.9],
            [13, 0.9],
            [14, 1.4],
            [15, 1.75],
            [16, 2.2]
          ]
        },
        "line-opacity": 1
      }
    },
    {
      id: "craters",
      type: "line",
      source: "burwell",
      "source-layer": "lines",
      filter: ["in", "type", "crater", "impact structure"],
      minzoom: 10,
      maxzoom: 16,
      paint: {
        "line-dasharray": [6, 6],
        "line-color": "#000000",
        "line-width": {
          stops: [
            [10, 0.6],
            [11, 0.6],
            [12, 0.72],
            [13, 0.72],
            [14, 1],
            [15, 1.3],
            [16, 1.8]
          ]
        },
        "line-opacity": 1
      }
    }
  ]
};
