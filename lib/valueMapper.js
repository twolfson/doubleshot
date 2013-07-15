// Constructor to save a dictionary for lookups
// DEV: Probably a sign of hanging around too much Python =P
function ValueMapper(dict) {
  this.dict = dict;
}
ValueMapper.prototype = {
  lookup: function (key, options) {
    // Get the value
    var value = this.dict[key];

    // TODO: Proxying

    // Return the value and any other relevant info
    // DEV: As I write this, I think it could be a sub-module of object-mappr easily
    return {
      value: value,
      keysUsed: [key],
      keysNotFound: []
    };
  }
};

module.exports = ValueMapper;