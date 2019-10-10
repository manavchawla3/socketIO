var express = require('express'),
	https = require('https'),
	chalk = require('chalk'),
	fs = require('fs'),
	jwt = require('jsonwebtoken');

const connectionTimeout = 5;

var app = express();

// initialize env variables
var env = require('./config/env'),
	jwtSecret = env.jwtSecret || "",
	appPort = env.appPort || 3000,
	redisPort = env.redisPort || 6379,
	redisHost = env.redisHost || "127.0.0.1",
	redisPass = env.redisPassword || "",
	redisTLS = env.redisTLS || false,
	sslBaseDir = env.sslBaseDir || __dirname + '/ssl/',
	chainFileName = env.chainFileName || 'fullchain.pem',
	keyFileName = env.keyFileName || 'privkey.pem',
	certFileName = env.certFileName || 'cert.pem',
	listenChannel = env.listenChannel || "*";

var generateId = require('./lib/generateId');


//console.log("redis password", redisPass, env, env.redisPassword)
var ca = [];
var chain = fs.readFileSync(sslBaseDir + chainFileName, 'utf8');
chain = chain.split('\n');
var cert = [];
var len = chain.length;
for (i = 0; i < len; i++) {
	var line = chain[i];
	if (!(line.length !== 0)) {
		continue;
	}
	cert.push(line);
	if (line.match(/-END CERTIFICATE-/)) {
		ca.push(cert.join('\n'));
		cert = [];
	}
}

// SSL Certification
var sslOptions = {
	key: fs.readFileSync(sslBaseDir + keyFileName, 'utf8'),
	cert: fs.readFileSync(sslBaseDir + certFileName, 'utf8'),
	ca: ca
};

/****************************************
 * Creating HTTPS Server
 ****************************************/
var httpsServer = https.createServer(sslOptions, app);

var io = require('socket.io')(httpsServer);

/****************************************
 * CORS Settings
 ****************************************/
app.all('/*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', env.appCORSUrl);
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
	res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Content-disposition');
	res.header('Access-Control-Expose-Headers', 'Content-Length, Content-disposition');
	res.header('Access-Control-Allow-Credentials', 'true');

	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	} else {
		return next();
	}
});

var Redis = require('ioredis');
var redis = new Redis({
	port: redisPort,
	host: redisHost,
	password: redisPass,
	retryStrategy: function (times) {
		return Math.min(times * 200, 2000);
	},
	maxRetriesPerRequest: null,
	tls: redisTLS
});

var redis2 = new Redis({
	port: redisPort,
	host: redisHost,
	password: redisPass,
	retryStrategy: function (times) {
		return Math.min(times * 200, 2000);
	},
	maxRetriesPerRequest: null,
	tls: redisTLS

});

var channelName = listenChannel + "_notifications.*";

redis.psubscribe(channelName, (err, count) => {
	if (err) {
		console.log("Error Occured on Subscribing", err);
	} else console.log("Psubscribed to ", channelName, count);
});

io.on('connection', function (socket) {
	var userId, socketId;
	socket.on('auth', function (token) {
		if (token) {
			jwt.verify(token, jwtSecret, (err, decodedData) => {
				if (err) {
					console.log(err);
				} else {
					if (decodedData.exp) {
						socketId = socket;
						userId = 'WSUser_'+decodedData.sub.toString();
						redis2.hget(userId,'RedisId').then(async data => {
							if (data) {
								redis2.hset(userId,'Status',1);
								userRedisData =  await redis2.hgetall(userId);
								const connectionCount = userRedisData.ConnectionCount;
								const disconnectedAt = 'DisconnectedAt'+connectionCount;
												
								if (disconnectedAt){
									if((new Date() - new Date(disconnectedAt))/60000 > connectionTimeout){
										connectionCountNew = await redis2.hincrby(userId, 'ConnectionCount', 1);
										redis2.hset(userId,'ConnectedAt'+connectionCountNew,new Date());
									}
									else{
										redis2.hdel(userId,'DisconnectedAt'+connectionCount);
									}
								}
								socket.join(data);
							} else {
								var wsId = generateId(10);
								redis2.hset(userId,
									'RedisId', wsId,
									'Origin', socket.handshake.headers.origin,
									'Browser', socket.handshake.headers['user-agent'],
									'IP', socket.handshake.address,
									'ConnectedAt1', new Date(),
									'Token', token,
									'ConnectionCount', 1,
									'Status',1
								);
								socket.join(wsId);
							}
						})
					} else {
						console.log("expired token");
					}
				}
			})
		}
	});

	socket.on('disconnect', async socket => {
		if(socketId){
			const connectionCount = await redis2.hget(userId,'ConnectionCount');
			if(connectionCount){
				redis2.hset(userId,'DisconnectedAt'+connectionCount, new Date(),'Status',0);
			}
		}
	});
});


redis.on('pmessage', function (pattern, channel, message) {
	var str = message;
	var message = JSON.parse(str);
	var userId = 'WSUser_'+channel.split('.')[1].toString();
	redis2.hget(userId,'RedisId').then(data => {
		if (data) {
			// io.broadcast.to(data, message);
			io.sockets.in(data).emit("notification", message)
		}
	})
});

httpsServer.listen(appPort, function () {
	console.log(
		chalk.green('✓') + ' App is running at ' + chalk.green('https://localhost:' + appPort) + ' in ' + chalk.red(env.environment) + ' mode'
	);
	console.log('  Press CTRL-C to stop\n');
});

httpsServer.timeout = 5 * 1000 * 60;

process.on('uncaughtException', function (err, req) {
	console.log(chalk.red('Uncaught Exception: ') + err.stack);
	const exitProcess = () => {
		setTimeout(() => process.exit(1), env.retryTimeout / 2);
	};
	throw err.stack;
});

process.on('SIGINT', () => {
	httpsServer.close();
	process.exit(0);
});

process.once('SIGUSR2', function () {
	process.kill(process.pid, 'SIGUSR2');
});
