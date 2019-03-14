// Map between index and filename
var IsometricMap = {
  tiles: {
    Woodcutter: "images/Woodcutter.png",
    Farm: "images/Farm.png",
    House: "images/House.png",
    Grain: ["images/Grain_0.png", // 0
            "images/Grain_1.png", // 1
            "images/Grain_2.png", // 2
            "images/Grain_3.png", // 3
            "images/Grain_4.png", // 4
            "images/Grain_5.png", // 5
            "images/Grain_6.png" // 6
          ],
    Trees: ["images/Trees_0.png", // 0
            "images/Trees_1.png", // 1
            "images/Trees_2.png", // 2
            "images/Trees_3.png", // 3
            "images/Trees_4.png", // 4
            "images/Trees_5.png", // 5
            "images/Trees_6.png" // 6
          ],
  },
  tilesMap: {},
  map: [],
  fog: [],
  isTileOnMap: function(x, y) {
    var isOnMap = false;
    if (typeof this.map[x] != "undefined") {
      if (typeof this.map[x][y] != "undefined") {
        isOnMap = true;
      }
    }
    return isOnMap;
  }
};
