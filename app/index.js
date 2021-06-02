'use strict';

const restify = require('restify');
const { collectDefaultMetrics, register, Counter, Gauge, Histogram, Summary } = require('prom-client');

const largeJSONHandler = require('./lib/largeJSONFromServer');
const randomPromiseLeakHandler = require('./lib/leakyPromises');
const dbPromiseLeakHandler = require('./lib/leakyDBPromises');
const dbPromiseHandler = require('./lib/leakyDBPromises2');
const newClassInFunctionHandler = require('./lib/newClassInFunction');
const newClassOutOfFunctionHandler = require('./lib/newClassOutOfFunction');
const leakyEventsHandler = require('./lib/events');

collectDefaultMetrics({ eventLoopMonitoringPrecision: 5, register });

const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

const requests = new Counter({
    name: 'requests',
    help: 'rps'
});

const restarts = new Counter({
    name: 'process_restarts',
    help: 'process restarts'
});

const requestLatency = new Summary({
    name: 'latency',
    help: 'request latency'
});

const inflightRequests = new Gauge({
    name: 'inflight_requests',
    help: 'inflight requests'
});

server.first(function(req, res) {
    inflightRequests.set(server.inflightRequests());
    return true;
});

// slows everything down because it is too fast with too few middleware
// and no real business logic
server.pre(function (req, res, next) {
    const slowDown = Math.random() * 20;
    return setTimeout(function timeout() {
        return next();
    }, slowDown);
})

server.on('after', restify.plugins.metrics({ server: server }, function (err, metrics, req, res, route) {
    requests.inc();
    requestLatency.observe(metrics.totalLatency);
}));

server.get('/metrics', function (req, res, next) {
    return register.metrics()
        .then(data => {
            res.contentType = register.contentType;
            res.send(data);
            return next();
        })
        .catch(err => {
            return next(err);
        });
});

server.get('/largeJson', largeJSONHandler);
server.get('/events', leakyEventsHandler);
server.get('/promises', randomPromiseLeakHandler);
server.get('/promisesDB', dbPromiseLeakHandler);
server.get('/promisesDB2', dbPromiseHandler);
server.get('/classInFunc', newClassInFunctionHandler);
server.get('/classInFunc2', newClassOutOfFunctionHandler);
server.get('/randomCrash', function (req, res, next) {
    if (Math.random() > 0.5) throw new Error('big failure');
    res.json({ok: true});
    return next();
});

server.get('/echo', function baseline(req, res, next) {
    res.json(req.headers);
    return next();
})

function properCrash() {
    console.info('bye bye');
    process.abort();
}

process.on('uncaughtException', properCrash);
process.on('unhandledRejection', ()=> {
    console.info('ops!');
});

server.listen(8080, function() {
    restarts.inc();
    console.log('%s listening at %s', server.name, server.url);
});

