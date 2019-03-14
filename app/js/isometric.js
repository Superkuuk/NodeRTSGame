var Isometric = {
  debugObj: [],

  tileColumnOffset: 99, // pixels
  tileRowOffset: 49, // pixels
  defaultTileHeight: 50, // pixels

  extraWorldSizeX: 0, // Extra scrolling
  extraWorldSizeY: 0, // Extra scrolling

  originX: 0, // offset from left
  originY: 0, // offset from top

  offsetX: 0, // World displacement in X direction
  offsetY: 0,// World displacement in Y direction

  Xtiles: 0, // Number of tiles in X-dimension
  Ytiles: 0, // Number of tiles in Y-dimension

  fps: 0,

  selectedTileX: -1,
  selectedTileY: -1,

  mouseX: -1,
  mouseY: -1,

  context: undefined,
  canvas: undefined,

  tileImages: undefined,

  selectedBlock: undefined,

  showCoordinates: true,

  load: function(callbackFunction) {
    this.tileImages = new Array();
    var loadedImages = 0;
    var totalImages = 1;

    for (var key in IsometricMap.tiles) {
      if (IsometricMap.tiles.hasOwnProperty(key)){
        if (typeof IsometricMap.tiles[key] === "string") {
          totalImages++;
        } else {
          totalImages += IsometricMap.tiles[key].length;
        }
      }
    }

    // Load all the images before we run the app
    var self = this;
    for (var key in IsometricMap.tiles) {
      if (IsometricMap.tiles.hasOwnProperty(key)){
        if (typeof IsometricMap.tiles[key] === "string") {
          var i = this.tileImages.push( new Image() ) - 1;
          this.tileImages[i].onload = function() {
            if(++loadedImages >= totalImages-1) {
              self.run(callbackFunction);
            }
          };
          this.tileImages[i].src = IsometricMap.tiles[key];
          IsometricMap.tilesMap[IsometricMap.tiles[key]] = i;
        } else {
          for (var item = 0; item < IsometricMap.tiles[key].length; item++) {
            var i = this.tileImages.push( new Image() ) - 1;
            this.tileImages[i].onload = function() {
              if(++loadedImages >= totalImages-1) {
                self.run(callbackFunction);
              }
            };
            this.tileImages[i].src = IsometricMap.tiles[key][item];
            IsometricMap.tilesMap[IsometricMap.tiles[key][item]] = i;
          }
        }

      }
    }

  },

  run: function(callbackFunction) {
    this.canvas = $('#isocanvas');
    this.context = this.canvas[0].getContext("2d");

    this.Xtiles = IsometricMap.map.length;
    this.Ytiles = IsometricMap.map[0].length;

    var self = this;
    $(window).on('resize', function(){
      self.updateCanvasSize();
      // self.redrawTiles();
    });

   $(window).on('mousemove', function(e) {
     this.mouseX = e.pageX;
     this.mouseY = e.pageY;
     e.pageX = e.pageX - self.tileColumnOffset / 2 - self.originX;
     e.pageY = e.pageY - self.tileRowOffset / 2 - self.originY;
     tileX = Math.round(e.pageX / self.tileColumnOffset - e.pageY / self.tileRowOffset);
     tileY = Math.round(e.pageX / self.tileColumnOffset + e.pageY / self.tileRowOffset);

     self.selectedTileX = tileX - self.offsetX;
     self.selectedTileY = tileY - self.offsetY;
    // self.redrawTiles();

     // console.log(self.selectedTileX + ", " + self.selectedTileY);
   });

  // <- 37
  // -> 39
  // ^ 38
  // v 40
  // 1 = 49
  // 9 = 57
   $(window).on('keydown', function(e) {
    event = $.Event('mousemove');
    // coordinates
    event.pageX = this.mouseX; // TODO: re-calculate the mouse position from selectedTileX to coordinate
    event.pageY = this.mouseY; // TODO: re-calculate the mouse position from selectedTileY to coordinate

     if (e.key == "ArrowRight") { // To the left
       if (self.offsetX > (- 1 * (self.extraWorldSizeX + self.Xtiles)) / 2  ) {
         self.offsetX -= 1;
       }
       if (self.offsetY > (- 1 * (self.extraWorldSizeY + self.Ytiles)) / 2) {
         self.offsetY -= 1;
       }
     } else if (e.key == "ArrowLeft") { // To the right
       if (self.offsetX < ((self.extraWorldSizeX + self.Xtiles)) / 2) {
         self.offsetX += 1;
       }
       if (self.offsetY < ((self.extraWorldSizeY + self.Ytiles)) / 2) {
         self.offsetY += 1;
       }
     } else if (e.key == "ArrowDown") { // To the top
       if (self.offsetX < ((self.extraWorldSizeX + self.Xtiles)) / 2) {
         self.offsetX += 1;
       }
       if (self.offsetY > (- 1 * (self.extraWorldSizeY + self.Ytiles)) / 2) {
         self.offsetY -= 1;
       }
     } else if (e.key == "ArrowUp") { // To the bottom
       if (self.offsetX > (- 1 * (self.extraWorldSizeX + self.Xtiles)) / 2 ) {
         self.offsetX -= 1;
       }
       if (self.offsetY < ((self.extraWorldSizeY + self.Ytiles)) / 2) {
         self.offsetY += 1;
       }

     } else if (e.key == "0") {
       self.selectedBlock = undefined;
     } else if (e.key == "1") {
       self.selectedBlock = Tiles.grain;
     } else if (e.key == "2") {
       self.selectedBlock = Tiles.farm;
     } else if (e.key == "3") {
       self.selectedBlock = Tiles.house;
     } else if (e.key == "4") {
       self.selectedBlock = Tiles.grass;
     } else if (e.key == "5") {
       self.selectedBlock = Tiles.woodcutter;
     }
     $(window).trigger(event);
   });

    $(window).on('click', function() {
      //self.showCoordinates = !self.showCoordinates;
      if (self.isCursorOnMap() && self.selectedBlock != undefined) {
        IsometricMap.map[self.selectedTileX][self.selectedTileY] = $.extend(true, {}, self.selectedBlock); // Make deep copy
        if (self.selectedBlock.los) {
          for (var xi = -1*self.selectedBlock.los; xi <= self.selectedBlock.los; xi++) {
            for (var yi = -1*self.selectedBlock.los; yi <= self.selectedBlock.los; yi++) {
                if (IsometricMap.isTileOnMap(self.selectedTileX + xi, self.selectedTileY + yi)) {
                  IsometricMap.fog[self.selectedTileX + xi][self.selectedTileY + yi] = 'o';
                }
            }
          }
        }

        //self.redrawTiles();
      }
    });

    this.updateCanvasSize();
    //this.redrawTiles();
    callbackFunction();
  },

  updateCanvasSize: function() {
    var width = $(window).width();
    var height = $(window).height();

    this.context.canvas.width  = width;
    this.context.canvas.height = height;

    this.originX = width / 2 - this.Xtiles * this.tileColumnOffset / 2;
    this.originY = height / 2;
  },

  redrawTiles: function() {
    this.context.canvas.width = this.context.canvas.width;
    var offX = (this.offsetX) * this.tileColumnOffset / 2 + (this.offsetY) * this.tileColumnOffset / 2 + this.originX;
    var offY = (this.offsetY) * this.tileRowOffset / 2 - (this.offsetX) * this.tileRowOffset / 2 + this.originY;
    this.drawMap( offX  + (Parameters.worldSize) * this.tileColumnOffset / 2,
                  offY  - ((Parameters.worldSize - 1) * this.tileRowOffset) / 2,
                  Parameters.worldSize * this.tileColumnOffset,
                  Parameters.worldSize * this.tileRowOffset
                );

    this.drawFog();

    for(var Xi = (this.Xtiles - 1); Xi >= 0; Xi--) {
      for(var Yi = 0; Yi < this.Ytiles; Yi++) {
        if (this.isInViewport(Xi, Yi, 100)) {
          if (IsometricMap.fog[Xi][Yi] == "o") {
            this.drawTile(Xi, Yi);
          }
        }
      }
    }


    this.drawDiamond(this.selectedTileX + this.offsetX, this.selectedTileY + this.offsetY, 'yellow');
    if(this.showCoordinates) {
      this.context.fillStyle = 'yellow';
      var idx = (IsometricMap.isTileOnMap(this.selectedTileX, this.selectedTileY)) ? IsometricMap.map[this.selectedTileX][this.selectedTileY] : {tileType: undefined};
      this.context.font = '14pt Arial';

      this.context.fillText("Grain: " + Resources.grain, 20, 30);
      this.context.fillText("Wood: " + Resources.wood, 20, 50);
      this.context.fillText("FPS: " + this.fps, 20, 70);
      if (idx.tileType == IsometricMap.tiles.House) this.context.fillText("Happiness: " + idx.happiness, 20, 90);

    }
  },

  isCursorOnMap: function() {
    return (this.selectedTileX >= 0 && this.selectedTileX < this.Xtiles &&
            this.selectedTileY >= 0 && this.selectedTileY < this.Ytiles);
  },

  isInViewport: function(Xi, Yi, margin) {

    var offX = (Xi + this.offsetX) * this.tileColumnOffset / 2 + (Yi + this.offsetY) * this.tileColumnOffset / 2 + this.originX;
    var offY = (Yi + this.offsetY) * this.tileRowOffset / 2 - (Xi + this.offsetX) * this.tileRowOffset / 2 + this.originY;

    var w = this.context.canvas.width;
    var h = this.context.canvas.height;
    var px = this.offsetX;
    var py = this.offsetY; // + this.originY

    if(
        offX >= px - margin &&
        offX <= px + w + margin &&
        offY >= py - margin &&
        offY <= py + h + margin
    ) {
       return true;
    }

    return false;
  },

  drawTile: function(Xi, Yi) {
    var offX = (Xi + this.offsetX) * this.tileColumnOffset / 2 + (Yi + this.offsetY) * this.tileColumnOffset / 2 + this.originX;
    var offY = (Yi + this.offsetY) * this.tileRowOffset / 2 - (Xi + this.offsetX) * this.tileRowOffset / 2 + this.originY;

    var imageIndex = IsometricMap.map[Xi][Yi].tileType;
    if (typeof imageIndex != "undefined") { // && is in viewport
      this.context.drawImage(this.tileImages[IsometricMap.tilesMap[imageIndex]], offX, offY - (this.tileImages[IsometricMap.tilesMap[imageIndex]].height - this.defaultTileHeight));
    }
  },

  drawDiamond: function(Xi, Yi, color) {
    var offX = Xi * this.tileColumnOffset / 2 + Yi * this.tileColumnOffset / 2 + this.originX;
    var offY = Yi * this.tileRowOffset / 2 - Xi * this.tileRowOffset / 2 + this.originY;

    this.drawLine(offX, offY + this.tileRowOffset / 2, offX + this.tileColumnOffset / 2, offY, color);
    this.drawLine(offX + this.tileColumnOffset / 2, offY, offX + this.tileColumnOffset, offY + this.tileRowOffset / 2, color);
    this.drawLine(offX + this.tileColumnOffset, offY + this.tileRowOffset / 2, offX + this.tileColumnOffset / 2, offY + this.tileRowOffset, color);
    this.drawLine(offX + this.tileColumnOffset / 2, offY + this.tileRowOffset, offX, offY + this.tileRowOffset / 2, color);

    var imageIndex = this.selectedBlock !== undefined ? this.selectedBlock.tileType : 'undefined';
    if (imageIndex !== 'undefined') {
      this.context.drawImage(this.tileImages[IsometricMap.tilesMap[imageIndex]], offX, offY - (this.tileImages[IsometricMap.tilesMap[imageIndex]].height - this.defaultTileHeight));
    }
  },

  drawFog: function() {
    var offX = (this.offsetX) * this.tileColumnOffset / 2 + (this.offsetY) * this.tileColumnOffset / 2 + this.originX;
    var offY = (this.offsetY) * this.tileRowOffset / 2 - (this.offsetX) * this.tileRowOffset / 2 + this.originY;
    var x = offX  + (Parameters.worldSize) * this.tileColumnOffset / 2,
        y = offY  - ((Parameters.worldSize - 1) * this.tileRowOffset) / 2,
        width = Parameters.worldSize * this.tileColumnOffset,
        height = Parameters.worldSize * this.tileRowOffset;

    this.context.beginPath();
    // clockwise
    for(var Xi = (this.Xtiles - 1); Xi >= 0; Xi--) {
      for(var Yi = 0; Yi < this.Ytiles; Yi++) {
        if (this.isInViewport(Xi, Yi, 100)) {
          if (IsometricMap.fog[Xi][Yi] == "o") {
            var offX = (Xi + this.offsetX) * this.tileColumnOffset / 2 + (Yi + this.offsetY) * this.tileColumnOffset / 2 + this.originX;
            var offY = (Yi + this.offsetY) * this.tileRowOffset / 2 - (Xi + this.offsetX) * this.tileRowOffset / 2 + this.originY;

            // add hole
            this.context.moveTo(offX, offY + this.tileRowOffset / 2);

            // top left edge
            this.context.lineTo(offX + this.tileColumnOffset / 2, offY + this.tileRowOffset);

            // bottom left edge
            this.context.lineTo(offX + this.tileColumnOffset, offY + this.tileRowOffset / 2);

            // bottom right edge
            this.context.lineTo(offX + this.tileColumnOffset / 2, offY);

            // closing the path automatically creates
            // the top right edge
            this.context.closePath();
          }
        }
      }
    }

    this.context.fillStyle = "#8ab549";
    this.context.fill();
  },

  drawMap: function(x, y, width, height) {
    this.context.beginPath();
    this.context.moveTo(x, y);

    // top left edge
    this.context.lineTo(x - width / 2, y + height / 2);

    // bottom left edge
    this.context.lineTo(x, y + height);

    // bottom right edge
    this.context.lineTo(x + width / 2, y + height / 2);

    // closing the path automatically creates
    // the top right edge
    this.context.closePath();

    this.context.fillStyle = "black";
    this.context.fill();
  },

  drawLine: function(x1, y1, x2, y2, color) {
    color = typeof color !== 'undefined' ? color : 'white';
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  },
};
