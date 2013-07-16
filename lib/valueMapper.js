// Constructor to save a dictionary for lookups
// DEV: Probably a sign of hanging around too much Python =P
function ValueMapper(dict) {
  this.dict = dict;
}
ValueMapper.prototype = {
  lookup: function (key, options) {
    // Get the primitive value
    var val = this.dict[key],
        valObj;

    // Prepare a return object
    var keysUsed = [],
        keysNotFound = [],
        retObj =  {
          value: val,
          keysUsed: keysUsed,
          keysNotFound: keysNotFound
        };

    // TODO: Base taking action off of options
    // If it is an alias, look it up
    if (typeof val === 'string') {
      valObj = this.lookup(val);

      // Save the key used
      keysUsed.push(val);

      // If the value is undefined, add it to keys not found
      var foundVal = valObj.value;
      if (typeof foundVal === 'undefined') {
        keysNotFound.push(val);
      }

      // Save the value and add on the keys
      retObj.value = foundVal;
      keysUsed.push.apply(keysUsed, valObj.keysUsed);
      keysNotFound.push.apply(keysNotFound, valObj.keysNotFound);
    }

    // // If it is an array, look up the values
    // if (Array.isArray(val)) {
    //   // val = val.map(ObjectMapper.aliasMiddleware, this);
    //   valObj = val.map(this.lookup, this);
    // }

    // Return the value and any other relevant info
    // DEV: As I write this, I think it could be a sub-module of object-mappr easily
    return retObj;
  }
};

module.exports = ValueMapper;