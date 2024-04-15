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

exports.getUserPosts = async () => {
    const res = await query('SELECT * FROM POSZT ORDER BY POSZT.TIME DESC');
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

exports.createPostNoGroup = async (szoveg, felh_id) => {
    await query('INSERT INTO POSZT (SZOVEG, LIKES, TIME, FELH_ID) VALUES (:szoveg, 0, SYSTIMESTAMP, :felh_id)', [szoveg, felh_id]);
}
exports.postAddLike = async (postId) => {
    // let res = await query("SELECT * FROM POSZT WHERE ID = :postId", [postId]);
    // console.log(res);
    await query("UPDATE POSZT SET LIKES = LIKES + 1 WHERE ID = :postId", [postId]);
}

/*exports.postIsMadeByUser = async (postId) => {
    // let res = await query("SELECT * FROM POSZT WHERE ID = :postId", [postId]);
    // console.log(res);
    await query("UPDATE POSZT SET LIKES = LIKES + 1 WHERE ID = :postId", [postId]);
}*/

exports.postDelete = async (postId) => {
    await query('DELETE FROM POSZT WHERE ID = :postId', [postId]);
}