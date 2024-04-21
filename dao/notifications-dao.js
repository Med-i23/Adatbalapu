const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.getNotifacationsOfUser = async (id) => {
    return await query('SELECT * FROM ERTESITES WHERE FELH_ID = :id ORDER BY TIME DESC', [id]);
};

exports.deleteNotification = async (id) => {
    await query('DELETE FROM ERTESITES WHERE id= :id', [id])
}