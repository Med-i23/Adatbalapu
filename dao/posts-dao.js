const {timeSince} = require("./common");
const query = require("./common.js").query;
let format = "yyyy-mm-dd"


exports.getPosts = async () => {
    let q = await query('SELECT POSZT.*, FELHASZNALO.NEV FROM POSZT INNER JOIN FELHASZNALO ON FELHASZNALO.ID = POSZT.LETREHOZO WHERE CSOPORT_ID IS NULL ORDER BY POSZT.TIME DESC');
    for (let i = 0; i < q.rows.length; i++) {
        q.rows[i][5] = timeSince(q.rows[i][5])
    }
    return q
};

exports.postCreate = async (csoport_id, szoveg, felh_id) => {
    await query('INSERT INTO POSZT (CSOPORT_ID, SZOVEG, LIKES, TIME, LETREHOZO) VALUES (:csoport_id, :szoveg, 0, SYSTIMESTAMP, :felh_id)', [csoport_id, szoveg, felh_id]);
}

exports.postAddLike = async (postId) => {
    await query("UPDATE POSZT SET LIKES = LIKES + 1 WHERE ID = :postId", [postId]);
}

exports.postDelete = async (postId) => {
    await query('DELETE FROM POSZT WHERE ID = :postId', [postId]);
}

exports.postModify = async (szoveg, postId) => {
    await query("UPDATE POSZT SET SZOVEG = :szoveg WHERE ID = :postId", [szoveg, postId]);
}