var Parameters = require('../lib/parameters').data;

function rand(min, max) {
  return  Math.floor((Math.random() * (max - min)) + min);
}

exports.tile = function(type) {
  this.new = type;
  switch (type) {
    case "tree":
      this.resources = rand(Parameters.generator.tree.Size[0], Parameters.generator.tree.Size[1]);
      this.age = 6;
      break;
    case "concrete":
      this.resources = rand(Parameters.generator.concrete.Size[0], Parameters.generator.concrete.Size[1]);
      break;
  }
}
