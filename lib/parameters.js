exports.data = {

  worldSize: 100,

  generator: {
    tree: {
      Frequency: 1, // How often it spawns (%)
      ClusterSize: [10, 20], // Size of spawned clusters
      Size: [40, 60], // Min, max amount of resources per tile
    },

    concrete: {
      Frequency: 0.1,
      ClusterSize: [20, 25],
      Size: [80, 120],
    },

  },

};

exports.clientdata = {
  worldSize: exports.data.worldSize,

}
