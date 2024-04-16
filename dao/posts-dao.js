const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.getPosts = async () => {
    return await query('SELECT * FROM POSZT ORDER BY POSZT.TIME DESC');
};

exports.postCreateNoGroup = async (szoveg, felh_id) => {
    await query('INSERT INTO POSZT (SZOVEG, LIKES, TIME, LETREHOZO) VALUES (:szoveg, 0, SYSTIMESTAMP, :felh_id)', [szoveg, felh_id]);
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
