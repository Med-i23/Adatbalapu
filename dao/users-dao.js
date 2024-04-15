const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.createUser = async (name, email, birthday, password, status, role) => {
    await query('INSERT INTO FELHASZNALO (NEV, EMAIL, SZULDATUM, JELSZO, ALLAPOT, ROLE) VALUES (:name, :email, TO_DATE(:birthday,:format), :password, :status, :role)', [name, email, birthday, format, password, status, role]);
}

exports.updateUser = async (name, email, birthday, password, current_email) => {
    await query('UPDATE FELHASZNALO SET NEV = :name, EMAIL = :email, SZULDATUM = TO_DATE(:birthday,:format), JELSZO = :password where EMAIL = :current_email', [name, email, birthday, format, password, current_email]);
}

exports.deleteUser = async (id) => {
    await query('DELETE FROM user WHERE id= :id', [id])
}
exports.getUsers = async () => {
    return await query('SELECT * FROM FELHASZNALO');
}

exports.getUsersById = async (id) => {
    return await query('SELECT * FROM user WHERE id= :id', [id]);
};

exports.modifyUserRole = async (id, role) => {
    await query('UPDATE user SET role=:role WHERE id = :id', [role, id]);
};

exports.getUserByEmail = async (email) => {
    return await query('SELECT * FROM FELHASZNALO WHERE EMAIL= :email', [email]);
};

exports.getUserEmail = async (email) => {
    return await query('SELECT EMAIL FROM FELHASZNALO WHERE EMAIL= :email', [email]);
};

exports.getUsersBirthday = async () => {
    const res = await query('SELECT NEV, SZULDATUM FROM FELHASZNALO');
    return res;
}

exports.getUsersFriendsById = async (id) => {
    const res = await query('SELECT FELH2_ID FROM ISMEROS WHERE FELH1_ID= :id', [id]);
    return res;
};

exports.getUsersFriendsNameById = async (usersID) => {
    const res = await query('SELECT NEV FROM FELHASZNALO WHERE id = :usersID', usersID);
    return res;
};