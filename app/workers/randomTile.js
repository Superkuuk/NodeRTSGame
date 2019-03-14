importScripts('../js/parameters.js'); 

onmessage = function(e) {
  var randomOrder = e.data;

  var shuffleInterval = setInterval(function() {
    // shuffle tiles
    var n = randomOrder.length;
    var tempArr = [];
    for ( var i = 0; i < n-1; i++ ) {
      // The following line removes one random element from arr
      // and pushes it onto tempArr
      tempArr.push(randomOrder.splice(Math.floor(Math.random()*randomOrder.length),1)[0]);
    }
    // Push the remaining item onto tempArr
    tempArr.push(randomOrder[0]);
    randomOrder = tempArr;

    postMessage(randomOrder);
  }, Parameters.shuffleInterval);

}
