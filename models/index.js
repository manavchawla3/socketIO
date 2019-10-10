var fs = require('fs');
var path = require('path');
var pg = require('pg');
// delete pg.native;
var Sequelize = require('sequelize');
var basename = path.basename(__filename);

var db = {};

const dbc = require('../config/env').db;

const dbName = dbc.name || "",
    dbHost = dbc.host || "",
    dbPort = dbc.port || 5432,
    dbUser = dbc.user || "",
    dbPasswd = dbc.password || "",
    maxPoolsize = dbc.maxPoolSize || 10,
    logging = dbc.logging || false,
    ssl = dbc.ssl || false;

var dbOptions = {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    timezone: '+05:30',
    pool: {
        max: maxPoolsize,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    reconnect: reconnectOptions || true,
    define: {
        "created_at": "created_at"
    }
};

if(!logging){
    dbOptions.logging = false;
}

if (ssl) {
    dbOptions.dialectOptions = {
        ssl: {
            require: true
        }
    };
    dbOptions.ssl = true;
}


const sequelize = new Sequelize(dbName, dbUser, dbPasswd, dbOptions);

var reconnectOptions = {
    max_retries: 9999,
    onRetry: (count) => {
        console.log("Connection lost, trying to reconnect (" + count + ")");
    }
};

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        let model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;