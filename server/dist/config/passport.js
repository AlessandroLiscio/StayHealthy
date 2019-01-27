"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// load all the things we need
const models_1 = require("../models/models");
const userCtrl_1 = require("../controllers/userCtrl");
var userCtrl = new userCtrl_1.UserCtrl();
var LocalStrategy = require('passport-local').Strategy;
module.exports = function (passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session at login
    passport.serializeUser(function (user, done) {
        // remove hashed password from user's session information
        let serializedUser = new models_1.SerializedUser();
        serializedUser.username = user.username;
        serializedUser.role = user.role;
        done(null, serializedUser);
    });
    // used to deserialize the user at logout
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }, function (req, username, password, done) {
        return __awaiter(this, void 0, void 0, function* () {
            var result;
            try {
                // find user in the database by username field
                result = yield userCtrl.getUser(req);
            }
            catch (err) {
                return done(err);
            }
            // check result has been correctly retrieved and elaborated from database
            if (!result || !(result instanceof models_1.User)) {
                return done(result, false);
            }
            // match input and user passwords
            let match = userCtrl.comparePassword(req.body.password, result.password);
            // if they don't match, return error
            if (!match) {
                return done(null, false);
            }
            // return user correctly logged in
            return done(null, result);
        });
    }));
};
//# sourceMappingURL=passport.js.map