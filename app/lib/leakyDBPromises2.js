'use strict';

const { createPool , sql } = require('slonik');

const pool = createPool('postgres://postgres:supersecret@localhost:5433/openjs');
const query = sql`SELECT * FROM US_STATES;`;

module.exports = function dbPromiseLeakHandler(req, res, next) {
    pool.connect(async (connection) => {
        const rows = await connection.any(query);
        return res.json(rows);
    })
    .then(rows => {
        return next();
    })
    .catch(err => {
        return next(err);
    });
}
