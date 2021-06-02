'use strict';

const Registry = require('./registry');

const metricsRegistry = new Registry();
metricsRegistry.start();

class CounterMetric {
    #counter = 0;
    #registry = undefined;

    constructor(id, registry) {
        this.id = id;
        this.#registry = registry;

        registry.register(this);
        registry.on('dataSent', (data) => {
            this.prune();
        });
    }

    prune() {
        this.#counter = 0;
    }

    increment(num = 1) {
        this.#counter = this.#counter + num;
    }

    data() {
        return { id: this.id, count: this.#counter, time: Date.now() };
    }
}

module.exports = [
    function metricsMiddleware(req, res, next) {
        const path = req.getPath();
        const counter = new CounterMetric(path, metricsRegistry);
        counter.increment();
        next();
    },

    function eventsHandler(req, res, next) {
        res.json({ ok: true });
        return next();
    }
];
