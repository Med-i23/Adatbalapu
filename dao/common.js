const oracledb = require("oracledb");
const db_config = require("../config/db_conf.js");

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