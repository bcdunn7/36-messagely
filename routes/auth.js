const express = require('express');
const ExpressError = require('../expressError')
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/user')
const { SECRET_KEY } = require('../config');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (await User.authenticate(username, password)){
            User.updateLoginTimestamp(username);
            let token = jwt.sign({username}, SECRET_KEY);
            return res.json({
                message: "Logged in!",
                token: token})
        }

        throw new ExpressError("Invalid Credentials", 400);
    } catch (e) {
        return next(e);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
        const {username, password, first_name, last_name, phone} = req.body;

        if (!username || !password || !first_name || !last_name || !phone) {
            throw new ExpressError("Must include all fields: esername, password, first_name, last_name, phone", 400)
        }

        let user = await User.register(username, password, first_name, last_name, phone);

        if (!user) {
            throw new ExpressError("Registration failed", 500)
        }

        User.updateLoginTimestamp(username);

        let token = jwt.sign({username}, SECRET_KEY);

        return res.json({
            message: "Registered!",
            token: token})

    } catch (e) {
        if (e.code === '23505') {
            return next(new ExpressError("Username already taken", 400))
        }
        return next(e);
    }
})

module.exports = router;