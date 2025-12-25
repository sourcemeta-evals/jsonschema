import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const main = require('./main.js');

export const spawn = main.spawn;
export const getExecutablePath = main.getExecutablePath;
