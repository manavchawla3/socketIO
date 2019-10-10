var moment = require('moment'),
    db = require('../models'),
    redis = require('../lib/redisConnection'),
    Sequelize = require('sequelize');

const CHUNKSIZE = 500;

// Inserting All Data to postgres table i.e. user_stats in chunks of each 500
Promise.all([
  redis.keys('*')
]).then(async results => {

  var chunkStarter = "INSERT INTO user_stats(user_id, redis_id, origin, browser, ip, token, connected_at, disconnected_at) VALUES ?";
  var chunk = [];

  for (var i = 0; i < results[0].length; i++) {
    var details = await redis.hgetall(results[0][i]);
    // $tempQuery = "INSERT INTO user_stats(user_id, redis_id, origin, browser, ip, token, connected_at, disconnected_at) VALUES ("+results[0][i].split("_")[1]+",'"+details.RedisId+"','"+details.Origin+"','"+details.Browser+"','"+details.IP+"','"+details.Token;
    
    for(var j=1; j<=await redis.hget(results[0][i], 'ConnectionCount'); j++){
  
      var disconnectedAt = details['DisconnectedAt'+j]
                          ? moment(new Date(details['DisconnectedAt'+j])).format('YYYY-MM-DD HH:mm:ss')
                          : moment(details['DisconnectedAt'+j]).format('YYYY-MM-DD HH:mm:ss');

      // $dataEntry = $tempQuery+"','"+moment(new Date(details['ConnectedAt'+j])).format('YYYY-MM-DD HH:mm:ss')+"','"+disconnectedAt+"')";    
  
      var values = [Number(results[0][i].split("_")[1]),details.RedisId,details.Origin,details.Browser,details.IP,details.Token,moment(new Date(details['ConnectedAt'+j])).format('YYYY-MM-DD HH:mm:ss'),disconnectedAt];
      chunk.push(values);

      if(chunk.length === CHUNKSIZE){
        await db.sequelize.query(chunkStarter, {
          replacements: [chunk],
          type: Sequelize.QueryTypes.INSERT
        })
        .then(data => {
          chunk = [];
          console.log(data);
        })
        .catch(err => {
          console.log(err);
        })
      }
      
    }
  }

  if(chunk.length > 0){
    await db.sequelize.query(chunkStarter, {
      replacements: [chunk],
      type: Sequelize.QueryTypes.INSERT
    })
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    })
  }

}).then(() => {
  redis.flushall();
  redis.quit();
  db.sequelize.close();
}).catch(err => {
  console.log(err);
})
