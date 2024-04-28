const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.getGroups = async () => {
    return await query('SELECT * FROM CSOPORT');
};

exports.getGroupsById = async (userId) => {
    return await query('SELECT * FROM CSOPORT WHERE LETREHOZO = :userId', [userId]);
};

exports.getCurrentGroupById= async (currentGroupId)=>{
    return await query('SELECT * FROM CSOPORT WHERE CSOPORT.ID = :currentGroupId', [currentGroupId]);
}

exports.joinToGroup= async (currentGroupId,felhId)=>{
    let role = "USER"
    return await query('INSERT INTO TAG(CSOPORT_ID, FELH_ID, CSOPORT_ROLE) VALUES(:currentGroupId,:felhId,:role)', [currentGroupId,felhId,role]);
}

exports.isUserInGroup= async (felhId, groupId)=>{
    const groupGot = await query('SELECT * FROM TAG WHERE FELH_ID = :felhId AND CSOPORT_ID = :groupId',[felhId, groupId])
    return groupGot.rows.length < 1;
}
exports.groupCreate = async (nev, felh_id) => {
    await query('INSERT INTO CSOPORT (NEV, LETREHOZO) VALUES (:nev, :felh_id)', [nev, felh_id]);
}

exports.groupDelete = async (groupId) => {
    await query('DELETE FROM CSOPORT WHERE ID = :groupId', [groupId]);
}
exports.getGroupsPosts = async (groupId) => {
    return await query('SELECT * FROM POSZT WHERE CSOPORT_ID = :groupId ORDER BY POSZT.TIME DESC', [groupId]);
};