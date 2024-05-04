const {timeSince} = require("./common");
const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.addMessage = async (kitol, kinek, szoveg, time) => {
    await query('INSERT INTO UZENET (KITOL, KINEK, SZOVEG, TIME) VALUES (:kitol,:kinek,:szoveg,:time)', [kitol, kinek, szoveg, time]);
};

exports.messagesOf = async (kitol, kinek) => {
    let q = await query('SELECT UZENET.ID, KITOL, KINEK, SZOVEG, TIME FROM UZENET INNER JOIN FELHASZNALO ON KITOL =FELHASZNALO.ID INNER JOIN FELHASZNALO ON KINEK = FELHASZNALO.ID where (KITOL = :kitol and KINEK = :kinek) OR (KITOL = :kinek and KINEK = :kitol) ORDER BY TIME', [kitol, kinek, kinek, kitol]);
    for (let i = 0; i < q.rows.length; i++) {
        q.rows[i][4] = timeSince(q.rows[i][4])
    }
    return q
};
