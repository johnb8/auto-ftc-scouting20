const fs = require("fs");
const DB_USERNAME = fs.readFileSync('DB_USERNAME', "utf8");
const DB_PASSWORD = fs.readFileSync('DB_PASSWORD', "utf8");
const DB_ADDRESS = fs.readFileSync('DB_ADDRESS', "utf8");
const nano = require("nano")(`http://${DB_USERNAME}:${DB_PASSWORD}@${DB_ADDRESS}:5984`);

async function getDatabases() {
    let temp = [];
    let databases = await nano.db.list();
    for (database of databases) {
        if (database.search('^_')==-1) {
            temp.push(database);
        }
    }
    return temp;
}

async function getData(databaseName) {
    let temp = [];
    let db = nano.use(databaseName);
    let data = (await db.list({include_docs: true})).rows;
    for (realData of data) {
        temp.push(realData.doc);
    }
    return temp;
}
module.exports = {
    getDatabases, getData
}