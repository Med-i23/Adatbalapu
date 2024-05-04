const {timeSince} = require("./common");
const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.getNotifacationsOfUser = async (id) => {
    let q =  await query('SELECT * FROM ERTESITES WHERE FELH_ID = :id ORDER BY TIME DESC', [id]);
    for (let i = 0; i < q.rows.length; i++) {
        q.rows[i][3] = timeSince(q.rows[i][3])
    }
    return q
};

exports.deleteNotification = async (id) => {
    await query('DELETE FROM ERTESITES WHERE id= :id', [id])
}