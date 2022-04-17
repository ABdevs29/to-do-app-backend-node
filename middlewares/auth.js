const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        const token = req.header("x-auth-token");
        jwt.verify(token, process.env.SECRET_KEY);
        next();
    } catch (err) {
        res.status(403).send({message: err.message});
    }
}