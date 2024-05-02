const query = require("./common.js").query;

exports.createPicture = async (felh_id, poszt_id, fajl_nev) => {
    await query('INSERT INTO FENYKEP (FELH_ID, POSZT_ID, FAJL_NEV) VALUES (:felh_id, :poszt_id, :fajl_nev)', [felh_id, poszt_id, fajl_nev]);
}