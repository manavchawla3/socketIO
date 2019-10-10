# Release - Notes (Dockabl)

##Release-18Sept2019 - User Metrics
- User Metrics to get number of users online realtime and stats on total time spend on app by users on daily basis

**Installation / Useful scripts**

Create or make changes to DB
```shell script
$ sudo npx sequelize-cli db:migrate
```
Command to Fetch Current Online users
```shell script
$ node scripts/currentUsers.js
```
Command to move all redis data to postgres table (Need to be set in cron)
```shell script
$ node scripts/moveDataToPostgres.js
```
