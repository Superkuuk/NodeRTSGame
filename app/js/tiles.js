var Tiles = {
  grass: {
    tileType: IsometricMap.tiles.Grain[0],
    load: function() {},
  },

  grain: {
    tileType: IsometricMap.tiles.Grain[0],
    los: 1,
    load: function() {},
  },

  farm: {
    tileType: IsometricMap.tiles.Farm,
    los: 3,
    load: function() {},
  },

  woodcutter: {
    tileType: IsometricMap.tiles.Woodcutter,
    los: 5,
    load: function() {},
  },

  tree: {
    tileType: IsometricMap.tiles.Trees[0],
    setTreeType: function(age) {
      this.tileType = IsometricMap.tiles.Trees[age];
    },
    load: function() {
      this.setTreeType(this.age);
    },
  },

  house: {
    tileType: IsometricMap.tiles.House,
    los: 2,
    load: function() {},
  },

  concrete: {
    tileType: IsometricMap.tiles.Concrete,
    load: function() {},
  },


};
