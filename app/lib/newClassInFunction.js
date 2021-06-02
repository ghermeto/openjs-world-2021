'use strict';

const assert = require('assert');
const { scheduleToSendData } = require('./utils');

class Percentile {
    values = [];
    constructor(id, min = 0, max = Infinity) {
        this.id = id;
        this.min = min;
        this.max = max;
    }

    static get Builder() {
        class Builder {
            constructor() {
                this.min = 0;
                this.max = Infinity;
            }
            withId(id) {
                this.id = id;
                return this;
            }
            withTags(tags) {
                this.tags = tags;
                return this;
            }
            build() {
                let id;
                if (this.id) id = this.id;
                if (this.tags) id += '#' + [].concat(this.tags).join(',');
                return new Percentile(id, this.min, this.max);
            }
        }
        return Builder;
    }

    record(val) {
        assert(Number.isFinite(val) && val >= this.min && val <= this.max);
        this.values.push(val);
        scheduleToSendData(this);
    }
}

module.exports = function newClassInFunctionHandler(req, res, next) {
    const percentile = new Percentile
        .Builder()
        .withId('requests')
        .withTags([req.headers['Host']])
        .build();

    percentile.record(Date.now());

    // do some meaningful work here...

    res.json({ok: true});
    next();
};
