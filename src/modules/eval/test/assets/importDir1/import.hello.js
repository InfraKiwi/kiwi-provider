const another = require('./importNested/import.another');

module.exports.doAddAndLog = () => {
  console.log('Hello world! I will add two numbers');

  return another.add(42, 66);
};
