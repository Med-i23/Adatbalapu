const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.createUser = async (name, email, birthday, password, status, role) => {
    await query('INSERT INTO FELHASZNALO (NEV, EMAIL, SZULDATUM, JELSZO, ALLAPOT, ROLE) VALUES (:name, :email, TO_DATE(:birthday,:format), :password, :status, :role)', [name, email,birthday, format, password, status, role]);
}

exports.deleteUser = async (id) => {
    await query('DELETE FROM user WHERE id= :id', [id])
}
exports.getUsers = async () => {
   return await query('SELECT * FROM user');
}

exports.getUsersById = async (id) => {
    const res = await query('SELECT * FROM user WHERE id= :id', [id]);
    return res[0][0];
};

exports.modifyUserRole = async (id, role) => {
    await query('UPDATE user SET role=:role WHERE id = :id', [role, id]);
};


exports.changeUserLoggedin = async (username) => {
    await query('UPDATE user SET loggedin=!loggedin WHERE username=:username', [username]);
    //! ?

};
