const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.createUser = async (name, email, birthday, password, status, role) => {
    await query('INSERT INTO FELHASZNALO (NEV, EMAIL, SZULDATUM, JELSZO, ALLAPOT, ROLE) VALUES (:name, :email, TO_DATE(:birthday,:format), :password, :status, :role)', [name, email,birthday, format, password, status, role]);
}

exports.deleteUser = async (id) => {
    await query('DELETE FROM user WHERE id= :id', [id])
}
exports.getUsers = async () => {
   const res = await query('SELECT * FROM FELHASZNALO');
   return res;
}

exports.getUsersById = async (id) => {
    const res = await query('SELECT * FROM user WHERE id= :id', [id]);
    return res[0][0];
};

exports.modifyUserRole = async (id, role) => {
    await query('UPDATE user SET role=:role WHERE id = :id', [role, id]);
};


exports.getUserByEmail = async (email) => {
    const res = await query('SELECT * FROM FELHASZNALO WHERE EMAIL= :email', [email]);
    console.log(res.rows[0][4]);
    return res;
};

exports.getUserEmail = async (email) => {
    return await query('SELECT EMAIL FROM FELHASZNALOK WHERE EMAIL= :email', [email]);
};
