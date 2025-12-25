import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');
export { spawn };
