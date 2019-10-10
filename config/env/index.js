/*
 Set your environment variables and credentials in env.*.js. Make a copy of env.example.js and rename it as env.prod.js for production and env.local.js for local server. Make sure env.prod.js and env.local.js always be part of .gitignore and must not commited in git. 
*/

let env;
if (process.env.NODE_ENV === 'prod' || process.argv[2] == 'prod') {
    env = require('./env.prod.json');
} else if (process.env.NODE_ENV === 'dev'|| process.argv[2] == 'dev') {
    env = require('./env.dev.json');
} else if (process.env.NODE_ENV === 'uat'|| process.argv[2] == 'uat') {
    env = require('./env.uat.json');
} else {
    env = require('./env.local.json');
}

module.exports = env;