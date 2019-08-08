'use-strict';

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
            db.one('SELECT * FROM babyfoot_match WHERE id = $1', [matchId])
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

    checkMatchFinished: (matchId) =>
        new Promise((resolve, reject) => {
            db.one('SELECT finished FROM babyfoot_match WHERE id = $1', [matchId])
                .then(data => resolve(data.finished))
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
            db.one('INSERT INTO babyfoot_match(player1, player2) VALUES($1, $2) RETURNING id', [player1, player2])
                .then((data) => {
                    console.log(data);
                    resolve(data.id);
                })
                .catch((error) => {
                    console.error(error);
                    reject(errors.InternalError);
                });
        }),

    updateMatchFinished: (id, finished) =>
        new Promise((resolve, reject) => {
            db.query('UPDATE babyfoot_match SET finished = $1 WHERE id = $2', [finished, id])
                .then(() => resolve())
                .catch((error) => {
                    console.error(error);
                    reject(errors.InternalError);
                });
        }),

    deleteMatch: (id) =>
        new Promise((resolve, reject) => {
            db.query('DELETE FROM babyfoot_match WHERE id = $1', [id])
                .then(() => resolve())
                .catch((error) => {
                    console.error(error);
                    reject(errors.InternalError);
                });
        })
} 
