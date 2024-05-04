const query = require("./common.js").query;

exports.createPicture = async (felh_id, poszt_id, fajl_nev) => {
    await query('INSERT INTO FENYKEP (FELH_ID, POSZT_ID, FAJL_NEV) VALUES (:felh_id, :poszt_id, :fajl_nev)', [felh_id, poszt_id, fajl_nev]);
}

exports.getOwnPictures = async (felh_id) => {
    let qury = await query('SELECT * FROM FENYKEP INNER JOIN FELHASZNALO on FELH_ID = FELHASZNALO.ID where FELH_ID = :felh_id', [felh_id]);
    return qury.rows
}

exports.createAlbum = async (felh_id,album_name) => {
    await query('INSERT INTO ALBUM(FELH_ID, NEV) VALUES (:felh_id,:album_name)', [felh_id,album_name]);
}

exports.addPicToAlbum = async (fenykep_id,album_id) => {
    await query('INSERT INTO ALBUMKEP(FENYKEP_ID, ALBUM_ID) VALUES (:fenykep_id,:album_id)', [fenykep_id,album_id]);
}

exports.getAlbumPicsById = async (album_id) => {
    return await query('SELECT FAJL_NEV FROM ALBUMKEP INNER JOIN FENYKEP ON ALBUMKEP.FENYKEP_ID = FENYKEP.ID WHERE ALBUMKEP.ALBUM_ID = :album_id', [album_id]);
}

exports.getOwnAlbums = async (felh_id) => {
    let quearyese = await query('SELECT * FROM ALBUM WHERE FELH_ID = :felh_id', [felh_id]);
    return quearyese.rows
}

exports.getLatestAlbumGenerate = async () => {
    return await query('SELECT * FROM ALBUM ORDER BY ID DESC');
}
