const db = require("../config/db_conf")

class UsersDAO {
    async createUser(name, email, birthday, password, status, role){
        await db.executeQuery('INSERT INTO FELHASZNALO (NEV, EMAIL, SZULDATUM, JELSZO, ALLAPOT, ROLE) VALUES (?, ?, ?, ?, ?, ?)', [name, email, birthday, password, status, role])
    }

    async deleteUser(id){
        await db.executeQuery('DELETE FROM user WHERE id=?', [id])
    }
    async getUsers(){const [result, query]= await db.executeQuery('SELECT * FROM user');
        return result;
    }
    async getUsersById(id) {
        const query= await db.executeQuery('SELECT * FROM user WHERE id=? ', [id]);
        return query[0][0];
    };

    async modifyUserRole(id, role) {
        await db.executeQuery('UPDATE user SET role=? WHERE id = ?', [role, id]);
        return;
    };


    async changeUserLoggedin(username) {
        await db.executeQuery('UPDATE user SET loggedin=!loggedin WHERE username=?', [username]);
        return;
    };

}

module.exports = UsersDAO;