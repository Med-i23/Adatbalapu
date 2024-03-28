const {oracle} = require("node-oracledb");

(async function() {
    let connection;
    try {
        connection = await oracle.initDB({
            username: 'C##C78DGC',
            password: 'BDBc26cC',
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