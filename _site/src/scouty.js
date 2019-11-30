const fs = require("fs");
const DB_USERNAME = fs.readFileSync('DB_USERNAME', "utf8");
const DB_PASSWORD = fs.readFileSync('DB_PASSWORD', "utf8");
const DB_ADDRESS = fs.readFileSync('DB_ADDRESS', "utf8");
const nano = require("nano")(`http://${DB_USERNAME}:${DB_PASSWORD}@${DB_ADDRESS}:5984`);

async function getTeamMatch (dbName, teamNumber, matchType, matchNumber) {
    try {
        const db = await nano.db.use(dbName);
        let teamMatch = await db.get(`${matchType}${matchNumber}_${teamNumber}`);
        return addData(teamMatch);
    } catch (err) {
        return err;
    }
}

async function getAllTeamMatches (dbName, teamNumber, matchType) {
    try {
        const db = await nano.db.use(dbName);
        if (!matchType) {
            var calculated = [];
            let data = await db.find({"selector": {"_id": {"$regex": `^[q,p][0-9]*_${teamNumber}*$`}}, limit: 10000});
            for (var i = 0; i < data.docs.length; i++) {
                calculated.push(addData(data.docs[i]));
            }
            return calculated;
        } else if (matchType == "p") {
            var calculated = [];
            let data = await db.find({"selector": {"_id": {"$regex": `^p[0-9]*_${teamNumber}*$`}}, limit: 10000});
            for (var i = 0; i < data.docs.length; i++) {
                calculated.push(addData(data.docs[i]));
            }
            return calculated;
        } else if (matchType == "q") {
            var calculated = [];
            let data = await db.find({"selector": {"_id": {"$regex": `^q[0-9]*_${teamNumber}*$`}}, limit: 10000});
            for (var i = 0; i < data.docs.length; i++) {
                calculated.push(addData(data.docs[i]));
            }
            return calculated;
        } else {
            return "Invalid match type"
        }
    } catch (err) {
        return err;
    }
}

async function getAll (dbName) {
    try {
        const db = await nano.db.use(dbName);
        var all = await db.find({"selector": {"_id": {"$regex": `^[q,p][0-9]*_[0-9]*$`}}, limit: 10000});
        var list = [];
        for (var i = 0; i < all.docs.length; i++) {
            list.push(addData(all.docs[i]))
        }
        return list
    } catch (err) {
        return err;
    }
}

async function getTeamAverage (dbName, teamNumber, matchType) {
    try {
        let matches = await getAllTeamMatches(dbName, teamNumber, matchType);
        var autoBlocks = 0;
        var autoSkystones = 0;
        var autoPlace = 0;
        var teleopBlocks = 0;
        var teleopPlaced = 0;
        var movedFoundation = 0;
        var parkedOnLine = 0;
        var hasSkyscraper = 0;
        var capped = 0;
        var movedFoundationOut = 0;
        var parked = 0;
        for (i = 0; i < matches.length; i++) {
            autoBlocks += matches[i].autoBlocks;
            autoSkystones += matches[i].autoSkystones;
            autoPlace += matches[i].autoPlace;
            teleopBlocks += matches[i].teleopBlocks;
            teleopPlaced += matches[i].teleopPlaced;
            movedFoundation += matches[i].movedFoundation;
            parkedOnLine += matches[i].parkedOnLine;
            hasSkyscraper += matches[i].hasSkyscraper;
            capped += matches[i].capped;
            movedFoundationOut += matches[i].movedFoundationOut;
            parked += matches[i].parked;
        }
        return {
            teamNumber: teamNumber,
            autoBlocks: +(autoBlocks / matches.length).toFixed(1) || 0,
            autoSkystones: +(autoBlocks / matches.length).toFixed(1) || 0,
            autoPlace: +(autoPlace / matches.length).toFixed(1) || 0,
            teleopBlocks: +(teleopBlocks / matches.length).toFixed(1) || 0,
            teleopPlaced: +(teleopPlaced / matches.length).toFixed(1) || 0,
            movedFoundation: mode(movedFoundation) || 0,
            parkedOnLine: mode(parkedOnLine) || 0,
            hasSkyscraper: mode(hasSkyscraper) || 0,
            capped: mode(capped) || 0,
            movedFoundationOut: mode(movedFoundationOut) || 0,
            parked: mode(parked) || 0
        }
    } catch (err) {
        return err;
    }
}

function getPointsEarned(full) {
    var totalPoints = 0;
    totalPoints += (full.autoPlace) * 4;
    totalPoints += (full.teleopBlocks + full.teleopPlaced);
    totalPoints += (full.autoSkystones) * 10;
    totalPoints += (full.autoBlocks) * 2;
    totalPoints += (full.movedFoundation) * 10;
    totalPoints += (full.parkedOnLine) * 5;
    totalPoints += (full.capped) *5;
    totalPoints += (full.movedFoundationOut) * 15;
    totalPoints += (full.parked) * 5;
    return totalPoints;
}

async function getPointCont (dbName, teams, matchType) {
    try {
        var teamPointCont = {};
        const db = await nano.db.use(dbName);
        for (var i = 0; i < teams.length; i++) {
            if (!matchType) {
                var teamPoints = 0;
                let data = await db.find({"selector": {"_id": {"$regex": `^[q,p][0-9]*_${teams[i].team_number}*$`}}, limit: 10000});
                for (var b = 0; b < data.docs.length; b++) {
                    teamPoints += getPointsEarned(data.docs[b]);
                }
                teamPointCont[teams[i].key] = +(teamPoints / data.docs.length).toFixed(1)
            } else if (matchType == "p") {
                var teamPoints = 0;
                let data = await db.find({"selector": {"_id": {"$regex": `^p[0-9]*_${teams[i].team_number}*$`}}, limit: 10000});
                for (var p = 0; p < data.docs.length; p++) {
                    teamPoints += getPointsEarned(data.docs[p]);
                }
                teamPointCont[teams[i].key] = +(teamPoints / data.docs.length).toFixed(1)
            } else if (matchType == "q") {
                var teamPoints = 0;
                let data = await db.find({"selector": {"_id": {"$regex": `^q[0-9]*_${teams[i].team_number}*$`}}, limit: 10000});
                for (var q = 0; q < data.docs.length; q++) {
                    teamPoints += getPointsEarned(data.docs[q]);
                }
                teamPointCont[teams[i].key] = +(teamPoints / data.docs.length).toFixed(1)
            } else {
                return "Invalid match type"
            }
        }
        return teamPointCont;
    } catch (err) {
        return err;
    }
}

// Copied, to be fixed.
async function getAlliancePrediction (dbName, red, blue) {
    var redScore = 0;
    var blueScore = 0;
    for (var i = 0; i < red.length; i++) {
        try {
            var points = await getTeamAverage(dbName, red[i]);
            redScore += points.pointsEarned;
        } catch {
            redScore = null;
            break;
        }
    }
    if (blue) {
        for (var i = 0; i < blue.length; i++) {
            try {
                var points = await getTeamAverage(dbName, blue[i]);
                blueScore += points.pointsEarned;
            } catch {
                blueScore = null;
                break;
            }
        }
    }
    return {
        red: +redScore.toFixed(1),
        blue: +blueScore.toFixed(1)
    }
}