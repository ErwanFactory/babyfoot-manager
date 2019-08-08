'use-strict';

const dbi = require('./database-interface');
const WebSocketServer = require('websocket').server;
const http = require('http');
const uuidv4 = require('uuid/v4');

/* TYPES */

const EventTypes = {
    Create: 'create',
    Get: 'get',
    Finish: 'finish',
    Unfinish: 'unfinish',
    Delete: 'delete',
    Error: 'error'
};

/* UTILS */

const generateEvent = (event, value) => {
    return {
        event: event,
        value: value
    };
}

const sendError = (connection, error) => {
    console.error('An error occurred : ', error);
    const data = generateEvent(EventTypes.Error, { error: error });
    connection.send(JSON.stringify(data));
}

// All current client connections 
var connections = [];

const notifyEveryConnections = (data) => connections.forEach(c => c.connection.send(JSON.stringify(data)));

/* CONTROLLERS */

const onCreateEvent = (connection, player1, player2) => {
    dbi.createMatch(player1, player2)
        .then(id => {
            const value = {
                id: id,
                player1: player1,
                player2: player2
            };
            const data = generateEvent(EventTypes.Create, value);
            notifyEveryConnections(data);
        })
        .catch(error => sendError(connection, error));
}

const onGetEvent = (connection) => {
    dbi.getMatches()
        .then(matches => {
            const data = generateEvent(EventTypes.Get, matches);
            connection.send(JSON.stringify(data));
        })
        .catch(error => sendError(connection, error));
}

const onFinishEvent = (connection, matchId) => {
    // Checks match finished value to avoid useless update which may create an endless loop of updates
    dbi.checkMatchFinished(matchId)
        .then((isFinished) => {
            if (!isFinished) {
                dbi.updateMatchFinished(matchId, true)
                    .then(() => {
                        const data = generateEvent(EventTypes.Finish, { id: matchId });
                        notifyEveryConnections(data);
                    })
                    .catch(error => sendError(connection, error));
            }
        })
        .catch(error => sendError(connection, error));
}

const onUnfinishEvent = (connection, matchId) => {
    // Checks match finished value to avoid useless update which may create an endless loop of updates
    dbi.checkMatchFinished(matchId)
        .then((isFinished) => {
            if (isFinished) {
                dbi.updateMatchFinished(matchId, false)
                    .then(() => {
                        const data = generateEvent(EventTypes.Unfinish, { id: matchId });
                        notifyEveryConnections(data);
                    })
                    .catch(error => sendError(connection, error));
            }
        })
        .catch((error) => sendError(connection, error));
}

const onDeleteEvent = (connection, matchId) => {
    dbi.deleteMatch(matchId)
        .then(() => {
            const data = generateEvent(EventTypes.Delete, { id: matchId });
            notifyEveryConnections(data);
        })
        .catch(error => sendError(connection, error));
}

/* SERVER BEHAVIOUR */

var server = http.createServer((req, res) => { });
var port = 3000;

server.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});

// create the server
var wsServer = new WebSocketServer({
    httpServer: server
});

// Socket opening
wsServer.on('request', (request) => {
    const connectionId = uuidv4();
    console.log(`new connection : ${connectionId}`);

    var connection = request.accept(null, request.origin);
    connections.push(
        {
            id: connectionId,
            connection: connection
        });

    // Server behaviour when receiving a message from the socket
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log(`Received from ${connectionId} : `, message.utf8Data);
            var data = {};

            try {
                data = JSON.parse(message.utf8Data);
            } catch {
                console.error('Not a JSON object :', message.utf8Data);
                sendError(connection, 'Not a JSON object');
            }

            if (data.event === EventTypes.Create) {
                onCreateEvent(connection, data.value.player1, data.value.player2);
            } else if (data.event === EventTypes.Get) {
                onGetEvent(connection);
            } else if (data.event === EventTypes.Finish) {
                onFinishEvent(connection, data.value.id);
            } else if (data.event === EventTypes.Unfinish) {
                onUnfinishEvent(connection, data.value.id);
            } else if (data.event === EventTypes.Delete) {
                onDeleteEvent(connection, data.value.id);
            }
        }
    });

    connection.on('close', (code, desc) => {
        connections = connections.filter(c => c.id !== connectionId);
        console.log(`connection end with code ${code} : ${connectionId}`);
    });
});