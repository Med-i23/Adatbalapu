const jwt = require("jsonwebtoken")
const jwtSecret = "eecd871acfc3149f25bfe0sadf2a2fdsa0faa71d61942aa9270e286b84c04";

userAuth = (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({
                    message: "Not authorized"
                })
            } else {
                if ((decodedToken.role !== "ROLE_STUDENT") && (decodedToken.role !== "ROLE_ADMIN")&& (decodedToken.role !== "ROLE_TEACHER")) {
                    return res.status(401).json({
                        message: "Not authorized"
                    })
                } else {
                    next()
                }
            }
        })
    } else {
        return res
            .status(401)
            .json({
                message: "Not authorized, token not available"
            })
    }
}
module.exports = {
    jwtSecret,
    userAuth
};