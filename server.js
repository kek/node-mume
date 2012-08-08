var express = require('express'),
    app = module.exports = express.createServer(),
    io = require('socket.io').listen(app),
    net = require('net');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res) {
  res.render('index', { title: 'node-mume' });
});

// Start

if (require.main === module) {
  app.listen(9000);
  console.log("Express server listening on port %d in %s mode",
              app.address().port, app.settings.env);
  
  var clients =[];
	
  io.sockets.on('connection', function(client) {
    client.mume = net.createConnection({ port: 4242, host: "mume.org" }); 
    client.mume.addListener("data", function(d){
      var newstring =  d.toString().split("\r\n").join("<br>");
      client.emit("data", { data:newstring });  
    });
                               
    clients.push(client);
    client.on('newcommand', function(d) {
      client.mume.write(d.cmd+"","utf8", function(d) {} );
    }); 
    client.on('disconnect', function() {});
  });
}
