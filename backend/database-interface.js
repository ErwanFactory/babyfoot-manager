var pgp = require('pg-promise')();

const queryResultErrorCodes = pgp.errors.queryResultErrorCode;
const db = pgp('postgres://postgres:admin@localhost:5432/babyfoot-manager');

const errors = {
    NotFound: 'not found',
    InternalError: 'internal error'
};

module.exports = {
    errors: errors,

    getMatches: function () {
        return new Promise((resolve, reject) => {
            db.many('SELECT * FROM babyfoot_match')
                .then(function (data) {
                    resolve(data);
                })
                .catch(function (error) {
                    if (error.code === queryResultErrorCodes.noData) {
                        resolve([]);
                    } else {
                        console.error(error);
                        reject(errors.InternalError);
                    }
                });
        });
    },

    getMatch: function(matchId) {
        return new Promise((resolve, reject) => {
            db.one(`SELECT * FROM babyfoot_match WHERE id='${matchId}'`)
                .then(function (data) {
                    resolve(data);
                })
                .catch(function (error) {
                    if (error.code === queryResultErrorCodes.noData) {
                        reject(errors.NotFound);
                    } else {
                        console.error(error);
                        reject(errors.InternalError);
                    }
                });
        });
    },

    createMatch: function (player1, player2) {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO babyfoot_match(player1, player2) VALUES('${player1}', '${player2}')`)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error(error);
                reject();
            });
        });
    }
} 