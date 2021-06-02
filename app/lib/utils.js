'use strict';

exports.scheduleToSendData = function () {
    //...
};

exports.sendData = function () {
    //...
};

exports.vegieClient = () => {
    return {
        get() {
            return new Promise((resolve, reject) => {
                setImmediate(function () {
                    Math.random() > 0.6
                        ? reject(new Error('fail'))
                        : resolve('tomato');
                });
            });
        }
    };
};

exports.logger  = {
    debug() {},
    info() {},
    error() {}
};

