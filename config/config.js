const dbConfig = require('./env/env.local.json').db;
// const dbConfig = require('./env/env.prod.json').db;
// const dbConfig = require('./env/env.uat.json').db;
// const dbConfig = require('./env/env.dev.json').db;
dbProd = dbConfig;
var dbObj = {
  "username": dbConfig.user,
  "password": dbConfig.password,
  "database": dbConfig.name,
  "host": dbConfig.host,
  "dialect": "postgres"
};
if (dbConfig.ssl) {
  dbObj.ssl = true;
  dbObj.dialectOptions = {
    ssl: {
      require: true
    }
  };
}

module.exports = {
  "development": dbObj,
  "production": dbObj
};
