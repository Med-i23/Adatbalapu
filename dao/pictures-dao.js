const query = require("./common.js").query;

exports.createPicture = async (felh_id, poszt_id, fajl_nev) => {
    await query('INSERT INTO FENYKEP (FELH_ID, POSZT_ID, FAJL_NEV) VALUES (:felh_id, :poszt_id, :fajl_nev)', [felh_id, poszt_id, fajl_nev]);
}

exports.getOwnPictures = async (felh_id) => {
    let qury = await query('SELECT * FROM FENYKEP INNER JOIN FELHASZNALO on FELH_ID = FELHASZNALO.ID where FELH_ID = :felh_id', [felh_id]);
    return qury.rows
}