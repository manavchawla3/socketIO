<!Doctype html>

<html>
    <head>Socket</head>

<body>
    <h1 id='notifications'> Notifications : 0</h1>
    <h1 id='taskfeeds'> Taskfeeds : 0 </h1>
    <script src="http://localhost/socket/socket.io.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script>
    <script>
     var socket = io("http://localhost:3000");
     (function() {
         socket.on('notifications.310',function(data){
             document.getElementById("notifications").innerHTML = "Notifications : "+data.data.notifications;
             document.getElementById("taskfeeds").innerHTML = "Taskfeeds : "+data.data.taskfeeds;
       });
    })();
    </script>
</body>
</html>
