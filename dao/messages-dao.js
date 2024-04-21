const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.addMessage = async (kitol,kinek,szoveg,time) => {
    await query('INSERT INTO UZENET (KITOL, KINEK, SZOVEG, TIME) VALUES (:kitol,:kinek,:szoveg,:time)', [kitol,kinek,szoveg,time]);
};

exports.messagesOf = async (kitol,kinek) => {
    return await query('SELECT * FROM UZENET where KITOL = :kitol and KINEK = :kinek', [kitol,kinek]);
};
