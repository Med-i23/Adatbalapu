const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.getGroups = async () => {
    return await query('SELECT * FROM CSOPORT');
};

exports.getGroupsById = async (userId) => {
    return await query('SELECT * FROM CSOPORT WHERE LETREHOZO = :userId', [userId]);
};

exports.groupCreate = async (nev, felh_id) => {
    await query('INSERT INTO CSOPORT (NEV, LETREHOZO) VALUES (:nev, :felh_id)', [nev, felh_id]);
}

exports.groupDelete = async (groupId) => {
    await query('DELETE FROM CSOPORT WHERE ID = :groupId', [groupId]);
}
exports.getGroupsPosts = async (groupId) => {
    return await query('SELECT * FROM POSZT WHERE CSOPORT_ID = :groupId', [groupId]);
};