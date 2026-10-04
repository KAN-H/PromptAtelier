const fs = require('fs');
const os = require('os');
const path = require('path');

const dataDirectory = process.pkg
  ? process.env.PROMPTATELIER_DATA_DIR || path.join(os.homedir(), '.promptatelier', 'data')
  : path.resolve(__dirname, '../../data');

if (process.pkg) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

module.exports = fileName => path.join(dataDirectory, fileName);
