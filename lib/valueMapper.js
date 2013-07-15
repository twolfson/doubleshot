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
    var retObj =  {
          value: val,
          keysUsed: [key],
          keysNotFound: []
        };

    // TODO: Base taking action off of options
    // If it is an alias, look it up
    if (typeof val === 'string') {
      valObj = this.lookup(val);

      // If the value is undefined, add it to keys not found
      if (typeof valObj.value === 'undefined') {
        retObj.keysNotFound.push(val);
      }

      // Save the value and add on the keys
      retObj.value = valObj.value;
      retObj.keysUsed.push.apply(retObj.keysUsed, valObj.keysUsed);
      retObj.keysNotFound.push.apply(retObj.keysNotFound, valObj.keysNotFound);
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