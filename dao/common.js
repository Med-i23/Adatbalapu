const oracledb = require("oracledb");
const db_config = require("../config/db_conf.js");

exports.isDateValid = (dateStr) => {
    let newDate = dateStr.split("-")[0]
    return !(1800 > parseInt(newDate) || parseInt(newDate) > 2025);
}
exports.timeSince = (dateString) => {
    let date = new Date(dateString);
    let now = new Date();
    let diff = now - date; // difference in milliseconds

    let seconds = Math.floor(diff / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    let months = Math.floor(days / 30);
    let years = Math.floor(days / 365);

    if (years > 0) return years + ' éve';
    if (months > 0) return months + ' hónapja';
    if (days > 0) return days + ' napja';
    if (hours > 0) return hours + ' órája';
    if (minutes > 0) return minutes + ' perce';
    return seconds + ' másodperce';
}

async function query(query, list = []) {
    let result;
    let conn;

    try {
        conn = await oracledb.getConnection(db_config);
        result = await conn.execute(query, list);
        await conn.commit();
    } catch (err) {
        console.log(err);
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err.message);
            }
        }
    }

    return result;
}

exports.query = query;