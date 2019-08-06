var pgp = require('pg-promise')();

const queryResultErrorCodes = pgp.errors.queryResultErrorCode;
const db = pgp('postgres://postgres:admin@localhost:5432/babyfoot-manager');

const errors = {
    NotFound: 'not found',
    InternalError: 'internal error'
};

module.exports = {
    errors: errors,

    getMatches: () =>
        new Promise((resolve, reject) => {
            db.many('SELECT * FROM babyfoot_match')
                .then(data => resolve(data))
                .catch(function (error) {
                    if (error.code === queryResultErrorCodes.noData) {
                        resolve([]);
                    } else {
                        console.error(error);
                        reject(errors.InternalError);
                    }
                });
        }),

    getMatch: (matchId) =>
        new Promise((resolve, reject) => {
            db.one(`SELECT * FROM babyfoot_match WHERE id='${matchId}'`)
                .then(data => resolve(data))
                .catch(function (error) {
                    if (error.code === queryResultErrorCodes.noData) {
                        reject(errors.NotFound);
                    } else {
                        console.error(error);
                        reject(errors.InternalError);
                    }
                });
        }),

    createMatch: (player1, player2) =>
        new Promise((resolve, reject) => {
            db.query(`INSERT INTO babyfoot_match(player1, player2) VALUES('${player1}', '${player2}')`)
                .then(() => resolve())
                .catch((error) => {
                    console.error(error);
                    reject();
                });
        }),

    updateMatch: (id, player1, player2, finished) =>
        new Promise((resolve, reject) => {
            var updatePlayer1 = player1 !== undefined ? `player1='${player1}',` : '';
            var updatePlayer2 = player2 !== undefined ? `player2='${player2}',` : '';
            var updateFinished = finished !== undefined ? `finished=${finished}` : '';

            db.query(`UPDATE babyfoot_match SET ${ updatePlayer1 } ${ updatePlayer2 } ${ updateFinished } WHERE id=${id}`)
                .then((data) => resolve(data))
                .catch((error) => {
                    console.error(error);
                    reject();
                });
        }),

    deleteMatch: (id) =>
        new Promise((resolve, reject) => {
            db.query(`DELETE FROM babyfoot_match WHERE id=${id}`)
                .then(() => resolve())
                .catch((error) => {
                    console.error(error);
                    reject();
                });
        })
} 