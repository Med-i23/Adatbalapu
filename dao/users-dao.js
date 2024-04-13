const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.createUser = async (name, email, birthday, password, status, role) => {
    await query('INSERT INTO FELHASZNALO (NEV, EMAIL, SZULDATUM, JELSZO, ALLAPOT, ROLE) VALUES (:name, :email, TO_DATE(:birthday,:format), :password, :status, :role)', [name, email, birthday, format, password, status, role]);
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
    return res;
};

exports.modifyUserRole = async (id, role) => {
    await query('UPDATE user SET role=:role WHERE id = :id', [role, id]);
};

exports.getUserByEmail = async (email) => {
    const res = await query('SELECT * FROM FELHASZNALO WHERE EMAIL= :email', [email]);
    return res;
};

exports.getUserEmail = async (email) => {
    const res = await query('SELECT EMAIL FROM FELHASZNALO WHERE EMAIL= :email', [email]);
    return res;
};

exports.getUserPosts = async () => {
    const res = await query('SELECT * FROM POSZT');
    return res;
};

exports.getUsersBirthday = async () => {
    const res = await query('SELECT NEV, SZULDATUM FROM FELHASZNALO');
    return res;
}


exports.getUsersFriendsById = async (id) => {
    const res = await query('SELECT * FROM ISMEROS WHERE FELH1_ID= :id', [id]);
    //console.log("the id: " +id);
    return res;
};