
function loadPlugin(name) {
  return new Promise((resolve, reject) => {
    let err = `Cannot laod plugin: ${name}`;
    try {
      resolve(require(`./${name}`));
      return;
    } catch (error) {
      err = error;
      try {
        resolve(require(`./plugin/${name}`));
        return;
      } catch (error2) {
        err = error2;
        reject(err);
      }
    }
    reject(err);
  });
}

module.exports = loadPlugin;