var express = require('express');

const api = {
    port: 3000,
};

const app = express();

app.get('/', function (req, res) {
    res.send('You are connected to babyfoot manager backend.')
});

app.listen(api.port, function () {
    console.log(`Listening to port ${ api.port }`);
});