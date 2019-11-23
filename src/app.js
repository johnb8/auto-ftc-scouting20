const express = require('express');
const app = express();

app.set('view engine', 'pug');

const addView = (path, view, dataFunction) => {
    app.get(path, async (req, res) => {
        var data = await dataFunction(req);
        res.render(view, data);
    });
};

addView('/', 'index', async (req) => {
    return {test: 'test message 1'}
});

app.listen(4334);