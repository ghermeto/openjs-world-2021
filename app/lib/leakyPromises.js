'use strict';

const { vegieClient } = require('./utils');

module.exports = function randomPromiseLeakHandler(req, res, next) {
    return vegieClient()
        .get()
        .then(fruitOrVegetable => {
            res.json({ fruitOrVegetable });
            next();
        });
};
