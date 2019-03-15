exports.data = {
  grass: {
    tileType: IsometricMap.tiles.Grain[0]
  },

  grain: {
    tileType: IsometricMap.tiles.Grain[0],
    growth: 0,
    age: 0, // age in milliseconds
    los: 1,
    run: function(delta) {
      if (this.growth < 6) {
        this.age += delta;
        if (this.age >= (this.growth + 1) * rand(Parameters.grainGrowSpeedMin, Parameters.grainGrowSpeedMax)) {
          this.growth++;
          this.tileType = IsometricMap.tiles.Grain[this.growth];
        }
      }
    }
  },

  farm: {
    tileType: IsometricMap.tiles.Farm,
    timeToHarvest: 0,
    los: 3,
    run: function(delta) {
      this.timeToHarvest += delta;

      if (this.timeToHarvest >= rand(Parameters.harvestSpeedMin, Parameters.harvestSpeedMax)) {
        var p = loc(this);
        var grownTiles = [];
        for (var xi = -1; xi < 2; xi++) {
          for (var yi = -1; yi < 2; yi++) {
            if (!(xi == 0 && yi == 0)) {
              if (IsometricMap.isTileOnMap(p.x + xi, p.y + yi) &&  IsometricMap.map[p.x + xi][p.y + yi].tileType == IsometricMap.tiles.Grain[6]) {
                grownTiles.push([p.x + xi, p.y + yi]);
              }
            }
          }
        }

        if (grownTiles.length > 0) {
          var takeTile = Math.floor(Math.random() * grownTiles.length);
          IsometricMap.map[grownTiles[takeTile][0]][grownTiles[takeTile][1]] = $.extend(true, {}, Tiles.grain); // Make deep copy
          Resources.grain += 1;
        }

        this.timeToHarvest = 0;

      }
    }
  },

  woodcutter: {
    tileType: IsometricMap.tiles.Woodcutter,
    timeToHarvest: 0,
    los: 5,
    run: function(delta) {
      this.timeToHarvest += delta;

      if (this.timeToHarvest >= rand(Parameters.harvestSpeedMin, Parameters.harvestSpeedMax)) {
        var p = loc(this);
        var grownTiles = [];
        for (var xi = -3; xi <= 3; xi++) {
          for (var yi = -3; yi <= 3; yi++) {
            if (!(xi == 0 && yi == 0)) {
              if (IsometricMap.isTileOnMap(p.x + xi, p.y + yi) &&  IsometricMap.map[p.x + xi][p.y + yi].tileType == IsometricMap.tiles.Trees[6]) {
                grownTiles.push([p.x + xi, p.y + yi]);
              }
            }
          }
        }

        if (grownTiles.length > 0) {
          var takeTile = Math.floor(Math.random() * grownTiles.length);
          IsometricMap.map[grownTiles[takeTile][0]][grownTiles[takeTile][1]] = [];
          Resources.wood += 1;
        }

        this.timeToHarvest = 0;

      }
    }
  },

  trees: {
    tileType: IsometricMap.tiles.Trees[0],
    growth: 0,
    age: 0,

    run: function(delta)  {
      if (this.growth < 6) {
        this.age += delta;
        if (this.age >= (this.growth + 1) * rand(Parameters.treeGrowSpeedMin, Parameters.treeGrowSpeedMax)) {
          this.growth++;
          this.tileType = IsometricMap.tiles.Trees[this.growth];
        }
      }
    }
  },

  house: {
    tileType: IsometricMap.tiles.House,
    los: 2,
    habitants: 2,

    happiness: 100,

    timeSinceMeal: 0,

    run: function(delta) {
      this.timeSinceMeal += delta;
      if (this.timeSinceMeal >= rand(Parameters.consumeSpeedMin, Parameters.consumeSpeedMax)) {
        this.timeSinceMeal = 0;
        if (this.habitants <= Resources.grain) {
          Resources.grain -= this.habitants;
          if (this.habitants < Parameters.maxHabitants && Parameters.chanceToExpand <= rand(1, 100 + 10 * (100 - this.happiness) )) {
            this.habitants++;
          }
        } else {
          this.happiness -= (this.habitants - Resources.grain);
          Resources.grain = 0;
          if (this.happiness <= 0) {
            var p = loc(this);
            IsometricMap.map[p.x][p.y] = []; // House gets destroyed
          }
        }
      }
    }
  }

};
