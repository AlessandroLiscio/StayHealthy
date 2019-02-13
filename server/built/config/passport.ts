// load all the things we need
import * as bcrypt from "bcrypt"
import { SerializedUser, User, CustomError } from '../models/models'
import { UserCtrl } from '../controllers/userCtrl'
var LocalStrategy = require('passport-local').Strategy

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session at login
    passport.serializeUser(function (user, done) {
        // remove hashed password from user's session information
        let serializedUser = new SerializedUser()
        serializedUser.username = user.username
        serializedUser.role = user.role
        done(null, serializedUser)
    })

    // used to deserialize the user at logout
    passport.deserializeUser(function (user, done) {
        done(null, user)
    })

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
        async function (req, username, password, done) {
            var user: any
            var userCtrl = new UserCtrl()
            var error = new CustomError()
            try {
                // find user in the database by username field
                user = await userCtrl.getUser(req)
            } catch (err) {
                return done(err, false)
            }
            // check result has been correctly retrieved and elaborated from database
            if (!user || !(user instanceof User)) {
                error.name = "LOGIN ERROR"
                error.details = "user not found"
                return done(error, false)
            }
            // match input and user passwords
            // if they don't match, return error
            if (!(bcrypt.compareSync(req.body.password, user.password))) {
                error.name = "LOGIN ERROR"
                error.details = "password not matching"
                return done(error, false)
            }
            // return user correctly logged in
            return done(null, user)
        }
    ))

}