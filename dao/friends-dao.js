const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.addFriend = async (felh1_id,felh2_id) => {
    let normal = "active"
    await query('INSERT INTO ISMEROS (FELH1_ID, FELH2_ID, BARATI_ALLAPOT) VALUES (:felh1_id, :felh2_id, :normal)', [felh1_id,felh2_id, normal]);
    await query('INSERT INTO ISMEROS (FELH2_ID, FELH1_ID, BARATI_ALLAPOT) VALUES (:felh2_id, :felh1_id, :normal)', [felh1_id,felh2_id, normal]);
};

exports.areTheyFriends = async (felh1_id,felh2_id) => {
    let friendz = await query('SELECT * FROM ISMEROS where FELH1_ID = :felh1_id and FELH2_ID = :felh2_id', [felh1_id,felh2_id]);
    console.log()
    return friendz.rows.length > 0;
};
