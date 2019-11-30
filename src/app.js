const express = require('express');
const app = express();

const scouty = require('./scouty');

app.set('view engine', 'pug');

const addView = (path, view, dataFunction) => {
    app.get(path, async (req, res) => {
        var data = await dataFunction(req);
        res.render(view, data);
    });
};

addView('/', 'index', async (req) => {
    return{databases: await scouty.getDatabases()};
});

addView('/event/:db', 'event', async (req) => {
    return{data: await scouty.getData(req.params.db)};
});

app.listen(4334);