'use strict';

// external dependencies
const got = require('got');

const jsonIterator = got.extend({
    responseType: 'text',
    prefixUrl: 'https://raw.githubusercontent.com/json-iterator/test-data/master'
});

async function fetchAndParseLargeJSON() {
    const response = await jsonIterator.get('large-file.json');
    // we are parsing the json ourselves to make it clear
    return JSON.parse(response.body);
}

module.exports = function largeJSONHandler(req, res, next) {
    return fetchAndParseLargeJSON()
        .then(hugeList => {
           res.json({ items: hugeList.length });
           next();
        });
}
