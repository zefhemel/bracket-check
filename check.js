var util = require("zed/util");

/**
 * inputs: text
 */
module.exports = function(info) {
    var text = info.inputs.text;
    var brackets = info.brackets;
    var skip = info.skip || [];
    var error;

    var stack = [];
    for (var i = 0; i < text.length; i++) {
        skipper();
        var ch = text[i];
        if (isOpenBracket(ch)) {
            stack.push(ch);
        } else if (isCloseBracket(ch)) {
            var closingBracket = getCloseBracket(stack[stack.length - 1]);
            if (ch !== closingBracket) {
                error = util.indexToPos(text, i);
                error.endColumn = error.column + 1;
                error.type = "error";
                if(closingBracket) {
                    error.text = "Invalid closing bracket, expected: " + closingBracket;
                } else {
                    error.text = "Closing bracket unexpected";
                }
                return [error];
            } else {
                stack.pop();
            }
        }
    }
    if(stack.length !== 0) {
        error = util.indexToPos(text, i);
        error.endColumn = error.column + 1;
        error.type = "error";
        error.text = "Still expecting: " + stack.map(getCloseBracket).join(", ");
        return [error];
    }
    return [];


    function skipper() {
        skip.forEach(function(s) {
            var start = s[0];
            var end = s[1];
            for(var j = 0; j < start.length; j++) {
                if(text[i + j] !== start[j]) {
                    return;
                }
            }
            // Still here? Good! Let's get skippin'
            i += start.length;
            // Now let's find the end
            for(j = []; Math.max.apply(null, j) < end.length && i < text.length; increment(j), i++) {
                //if (j.length > 0) console.log("Looking at", text[i], j, end);
                
                var k = 0;
                //Check that all current positions are valid
                while (k < j.length) {
                  if(text[i] !== end[j[k]]) {
                      // remove invalid ones
                      j.splice(k, 1);
                  } else {
                      k++;
                  }
                }
                
                // Add a new iterator
                if (text[i] === end[0]) j.push(0);
            }
        });
    }
    
    function increment(j) {
      for (var k = 0; k < j.length; k++) {
        j[k] = j[k] + 1;
      }
    }
    
    function isOpenBracket(ch) {
        for (var i = 0; i < brackets.length; i++) {
            if (ch === brackets[i][0]) {
                return true;
            }
        }
        return false;
    }

    function isCloseBracket(ch) {
        for (var i = 0; i < brackets.length; i++) {
            if (ch === brackets[i][1]) {
                return true;
            }
        }
        return false;
    }

    function getCloseBracket(ch) {
        for (var i = 0; i < brackets.length; i++) {
            if (ch === brackets[i][0]) {
                return brackets[i][1];
            }
        }
    }
};
