const {oracle} = require("node-oracledb");

(async function() {
    let connection;
    try {
        connection = await oracle.initDB({
            username: 'C##D3FUQL',
            password: '2024Adatb',
            connectString: "//orania2:1521/orania2"
        });

        console.log("Successfully connected");
    } catch(err) {
        console.log(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Connection closed");
            } catch (err) {
                console.log("Error closing connection", err);
            }
        }
    }
})();

module.exports = oracle;
