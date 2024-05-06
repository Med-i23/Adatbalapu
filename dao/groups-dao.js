const {timeSince} = require("./common");
const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.getGroups = async () => {
    return await query('SELECT * FROM CSOPORT');
};

exports.getGroupsById = async (userId) => {
   //console.log("a userid: " + userId);
    return await query('SELECT * FROM CSOPORT WHERE LETREHOZO = :userId', [userId]);
};

exports.getCurrentGroupById = async (currentGroupId) => {
    return await query('SELECT * FROM CSOPORT WHERE CSOPORT.ID = :currentGroupId', [currentGroupId]);
}

exports.joinToGroup = async (currentGroupId, felhId) => {
    let role = "USER"
    return await query('INSERT INTO TAG(CSOPORT_ID, FELH_ID, CSOPORT_ROLE) VALUES(:currentGroupId,:felhId,:role)', [currentGroupId, felhId, role]);
}

exports.isUserInGroup = async (felhId, groupId) => {
    const groupGot = await query('SELECT * FROM TAG WHERE FELH_ID = :felhId AND CSOPORT_ID = :groupId', [felhId, groupId])
    return groupGot.rows.length < 1;
}
exports.groupCreate = async (nev, felh_id) => {
    await query('INSERT INTO CSOPORT (NEV, LETREHOZO) VALUES (:nev, :felh_id)', [nev, felh_id]);
}

exports.groupDelete = async (groupId) => {
    await query('DELETE FROM CSOPORT WHERE ID = :groupId', [groupId]);
}

exports.getGroupsPosts = async (groupId) => {
    let q = await query('SELECT * FROM POSZT WHERE CSOPORT_ID = :groupId ORDER BY POSZT.TIME DESC', [groupId]);
    for (let i = 0; i < q.rows.length; i++) {
        q.rows[i][5] = timeSince(q.rows[i][5])
    }
    return q
};

exports.getMemberNumberOfGroup = async (groupId) => {
    let q = await query('SELECT COUNT(ID) FROM TAG INNER JOIN CSOPORT on Csoport.ID = TAG.CSOPORT_ID where CSOPORT_ID = :groupId', [groupId]);
    return q.rows[0][0]
};

exports.getMembersOfGroup = async (groupId) => {
   let q = await query('SELECT FELHASZNALO.NEV,ROLE,FELH_ID,CSOPORT_ID FROM TAG INNER JOIN CSOPORT on Csoport.ID = TAG.CSOPORT_ID INNER JOIN FELHASZNALO ON FELHASZNALO.ID = TAG.FELH_ID WHERE CSOPORT_ID = :groupId', [groupId]);
    return q.rows
};

exports.isUserOwnerInGroup = async (groupId,userId) => {
    let q = await query('SELECT CSOPORT_ROLE FROM TAG INNER JOIN CSOPORT on Csoport.ID = TAG.CSOPORT_ID INNER JOIN FELHASZNALO ON FELHASZNALO.ID = TAG.FELH_ID WHERE CSOPORT_ID = :groupId AND TAG.FELH_ID = :userId', [groupId,userId]);
    if (typeof q.rows[0] !== 'undefined'){
        return q.rows[0][0] === "owner";
    }else {
        return false
    }
};

exports.removeMemberFromGroup = async (groupId, userId) => {
    let q = await query('SELECT * FROM TAG WHERE CSOPORT_ID = :groupId AND FELH_ID = :userId', [groupId, userId]);
    console.log(q.rows)
    await query('DELETE FROM TAG WHERE CSOPORT_ID = :groupId AND FELH_ID = :userId', [groupId, userId]);
};

exports.friendSuggestion = async (userId) => {
    let q = await query('SELECT * FROM TAG INNER JOIN CSOPORT ON CSOPORT.ID = tag.CSOPORT_ID WHERE TAG.FELH_ID = :userId', [userId]);
    console.log(q.rows)
    return ''
}
