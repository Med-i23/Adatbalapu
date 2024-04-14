const oracledb = require("oracledb");
const db_config = require("../config/db_conf.js");

exports.isDateValid = (dateStr) => {
    let newDate = dateStr.split("-")[0]
    return !(1800 > parseInt(newDate) || parseInt(newDate) > 2025);
}
async function query (query, list = []) {
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