'use-strict';

const express = require('express');
const dbi = require('./database-interface');
const cors = require('cors');

const api = {
    port: 3000,
};

const app = express();
app.use(express.json())
app.use(cors());

// READ

app.get('/', (req, res) => res.send('You are connected to babyfoot manager backend.'));

app.get('/matches', (req, res) => {
    dbi.getMatches()
        .then(data => res.json(data))
        .catch(() => {
            res.sendStatus(500);
        });
});

app.get('/matches/:matchId', (req, res) => {
    dbi.getMatch(req.params.matchId)
        .then(data => res.json(data))
        .catch(error => {
            if (error === dbi.errors.NotFound) {
                res.sendStatus(404);
            } else {
                res.sendStatus(500);
            }
        });
});

// CREATE 

app.post('/matches', (req, res) => {
    if (req.body.player1 && req.body.player2) {
        dbi.createMatch(req.body.player1, req.body.player2)
            .then(() => res.sendStatus(201))
            .catch(() => res.sendStatus(500));
    } else {
        res.status(400);
        res.send('You must provide "player1" and "player2" which are player names');
    }
});

// UPDATE

app.patch('/matches/:matchId', (req, res) => {
    dbi.updateMatchFinished(req.params.matchId, req.body.player1, req.body.player2, req.body.finished)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

// DELETE

app.delete('/matches/:matchId', (req, res) => {
    dbi.deleteMatch(req.params.matchId)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

// APP LAUNCHING

app.listen(api.port, () => console.log(`Listening to port ${api.port}`));
