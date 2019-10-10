var Redis = require('ioredis');
var env = require('../config/env');
    
// Making Redis Connection
var redis = new Redis({
	port: env.redisPort || 6379,
	host: env.redisHost || "127.0.0.1",
	password: env.redisPassword || "foobared",
	retryStrategy: function (times) {
		return Math.min(times * 200, 2000);
	},
	maxRetriesPerRequest: null,
	tls: env.redisTLS || false
});

module.exports = redis;