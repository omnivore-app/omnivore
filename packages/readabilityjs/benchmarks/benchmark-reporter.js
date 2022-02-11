var clean = require("matcha/lib/matcha/reporters/clean");

function average(list) {
  if (!list.length)
    return 0;

  var sum = list.reduce(function(previous, current) {
    return previous + current;
  });
  return (sum / list.length).toFixed(0);
}


// Like clean, but also produces an average:
module.exports = function(runner, utils) {
  var humanize = utils.humanize;
  var padBefore = utils.padBefore;
  var color = utils.color;
  var results = {};
  var currentResults = [];
  runner.on("bench end", function(benchResults) {
    currentResults.push(benchResults.ops);
  });
  runner.on("suite end", function(suite) {
    var avg = humanize(average(currentResults));
    console.log(padBefore(avg + " op/s", 22) + " » " + suite.title);
    console.log();
    results[suite.title] = avg;
    currentResults = [];
  });

  runner.on("end", function() {
    for (var k in results) {
      console.log(color(padBefore(k, 30) + ":  ", "gray") + results[k] + " op/s");
    }
    console.log();
  });

  clean(runner, utils);
};
