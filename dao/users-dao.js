const db = require("../config/db_conf")

class UsersDAO {
    async createUsers(name, username, password){
        await db.executeQuery('INSERT INTO user (name, username, password) VALUES (?, ?, ?)', [name, username, password])
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

    async getUsersByUserName(username) {
        const query= await db.executeQuery('SELECT * FROM user WHERE username = ? ', [username]);
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