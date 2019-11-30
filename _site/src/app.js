const express = require('express');
const app = express();

app.set('view engine', 'pug');

const addView = (path, view, dataFunction) => {
    app.get(path, async (req, res) => {
        var data = await dataFunction(req);
        res.render(view, data);
    });
};

addView('/event/:key', 'event', async (req) => {
    var allMatches = await tba.get(`/event/${req.params.key}/matches/simple`);
    var teams = await tba.get(`/event/${req.params.key}/teams/simple`);
    var matches = [];
    var teamPointCont = await scouty.getPointCont(req.params.key.substr(4, 7) + req.params.key.substr(0, 4), teams);
    var predictedScores = {};
    if (allMatches) {
        for (i = 0; i < allMatches.length; i++) {
            if (allMatches[i].comp_level == "qm") {
                matches.push(allMatches[i]);
            }
        }
        matches.sort(function (a, b) {
            return a.match_number - b.match_number
        });
        for (var i = 0; i < matches.length; i++) {
            predictedScores[matches[i].key] = { 
                red: +(teamPointCont[matches[i].alliances.red.team_keys[0]] + teamPointCont[matches[i].alliances.red.team_keys[1]] + teamPointCont[matches[i].alliances.red.team_keys[2]]).toFixed(1),
                blue: +(teamPointCont[matches[i].alliances.blue.team_keys[0]] + teamPointCont[matches[i].alliances.blue.team_keys[1]] + teamPointCont[matches[i].alliances.blue.team_keys[2]]).toFixed(1)
            }
        }
    }
    if (teams) {
        teams.sort(function (a, b) {
            return a.team_number - b.team_number
        });
    }
    return {
        event: await tba.get(`/event/${req.params.key}/simple`),
        teams: teams,
        matches: matches,
        predictions: await tba.get(`/event/${req.params.key}/predictions`),
        predictedScores: predictedScores
    };
});


app.listen(4334);