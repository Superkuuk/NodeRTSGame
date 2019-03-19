var Tiles = {
  grass: {
    tileType: IsometricMap.tiles.Grain[0]
  },

  grain: {
    tileType: IsometricMap.tiles.Grain[0],
    growth: 0,
    age: 0, // age in milliseconds
    los: 1
  },

  farm: {
    tileType: IsometricMap.tiles.Farm,
    timeToHarvest: 0,
    los: 3
  },

  woodcutter: {
    tileType: IsometricMap.tiles.Woodcutter,
    timeToHarvest: 0,
    los: 5
  },

  trees: {
    tileType: IsometricMap.tiles.Trees[0],
    growth: 0,
    age: 0
  },

  house: {
    tileType: IsometricMap.tiles.House,
    los: 2,
    habitants: 2,

    happiness: 100,

    timeSinceMeal: 0
  }

};
