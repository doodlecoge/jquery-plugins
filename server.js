var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    var files = fs.readdirSync(path.join(__dirname, 'public' + path.sep + 'html'));
    console.log(files);
    res.render('index', {files:files});
});


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});