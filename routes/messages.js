const express = require('express');
const ExpressError = require('../expressError')
const router = express.Router();
const Message = require('../models/message')
const { ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const {id} = req.params;
        const message = await Message.get(id);

        if (message.from_user.from_username === req.user.username || message.to_user.from_username === req.user.username) {
            return res.json({message})
        }

        throw new ExpressError("Not authorized to view message", 401)
    } catch (e) {
        return next(e);
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const {to_username, body} = req.body;
        const from_username = req.user.username;

        const message = Message.create(from_username, to_username, body);

        return res.json({message}).status(201);
    } catch (e) {
        return next(e);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async(req, res, next) => {
    try {
        const {id} = req.params;
        const message = await Message.get(id);

        if (message.to_user.from_username !== req.user.username) {
            throw new ExpressError("Unable to mark message as read if not recipient user", 401)
        }

        const read = Message.markRead(id);

        return res.json({read})
    } catch (e) {
        return next(e);
    }
})


 module.exports = router;