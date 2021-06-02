'use strict';

const EventEmitter = require('events');
const { sendData } = require('./utils');

class Registry extends EventEmitter {
    #interval = undefined;
    metrics = [];
    started = false;

    constructor(frequency = 5000) {
        super();
        this.frequency = frequency;
    }

    start() {
        this.started = true;
        this.#interval = setInterval(Registry.publish, this.frequency, this);
        this.#interval.unref();
    }

    stop() {
        clearInterval(this.#interval);
        this.started = false;
        sendData(this);
    }

    register(metric) {
        this.metrics.push(metric);
    }

    static publish(registry) {
        const dataSet = registry.metrics.map(metric => metric.data);
        sendData(dataSet);
        registry.emit('dataSent', dataSet);
    }
}

let registry = new Registry();

module.exports = function getRegistry() {
    if (!registry.started) registry.start();
    return registry;
};
