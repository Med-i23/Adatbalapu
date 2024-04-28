const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.createUser = async (name, email, birthday, password, status, role) => {
    await query('INSERT INTO FELHASZNALO (NEV, EMAIL, SZULDATUM, JELSZO, ALLAPOT, ROLE) VALUES (:name, :email, TO_DATE(:birthday,:format), :password, :status, :role)', [name, email, birthday, format, password, status, role]);
}

exports.updateUser = async (name, email, birthday, password, current_email) => {
    await query('UPDATE FELHASZNALO SET NEV = :name, EMAIL = :email, SZULDATUM = TO_DATE(:birthday,:format), JELSZO = :password where EMAIL = :current_email', [name, email, birthday, format, password, current_email]);
}

exports.deleteUser = async (id) => {
    await query('DELETE FROM FELHASZNALO WHERE id= :id', [id])
}


exports.adminCheck = async (id) => {
    const res = await query('SELECT check_admin_role(:id) FROM dual', [id]);
    return res.rows[0];
}

exports.getUsers = async () => {
    return await query('SELECT * FROM FELHASZNALO');
}
exports.getActualUsers = async (current_id) => {
    let users = await query('SELECT * FROM FELHASZNALO')
    users.rows = users.rows.filter((filter) => (filter[0] !== 1 && filter[0] !== current_id))
    return users.rows;
}
exports.getUsersById = async (id) => {
    return await query('SELECT * FROM FELHASZNALO WHERE id= :id', [id]);
};

exports.modifyUserRole = async (id, role) => {
    await query('UPDATE FELHASZNALO SET role=:role WHERE id = :id', [role, id]);
};

exports.getUserByEmail = async (email) => {
    return await query('SELECT * FROM FELHASZNALO WHERE EMAIL= :email', [email]);
};

exports.getUserEmail = async (email) => {
    return await query('SELECT EMAIL FROM FELHASZNALO WHERE EMAIL= :email', [email]);
};

exports.getUsersBirthday = async (id) => {
    return await query('SELECT NEV, SZULDATUM, ID FROM ISMEROS INNER JOIN FELHASZNALO ON FELH1_ID = FELHASZNALO.ID where ISMEROS.FELH1_ID != :id GROUP BY ID, SZULDATUM, NEV', [id]);
};



