var redis = require('../lib/redisConnection');

// Getting Currently Online Users Count
Promise.all([
    redis.keys('*')
]).then(async results => {
    let count = 0;
    for (let i = 0; i < results[0].length; i++) { 
        if (await redis.hget(results[0][i],'Status') == 1){
            count+=1;
        }
    }
    console.log(count);
    redis.quit();
})