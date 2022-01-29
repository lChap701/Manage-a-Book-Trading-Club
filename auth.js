require("dotenv").config();
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const passport = require("passport");
const secretKeys = require("./secretKeys");
const crud = require("./crud");
const notificationHandler = require("./notificationHandler");

/**
 * Module that sets up Passport serialization and all Passport strategies
 * @module ./auth
 *
 */
module.exports = () => {
  // Serialization
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    crud.getUser({ _id: id }).then((user) => done(null, user));
  });

  /**
   * Checks if the user exists (for accounts to be created using OAuth)
   * @param {*} req                 Represents the request
   * @param {String} accessToken    Represents the token used to access an API
   * @param {String} refreshToken   Represents the token used to create a new access token
   * @param {*} profile             Represents the profile of the user
   * @param {Function} cb           Represents the callback function that stores the result
   * @returns                       Returns the result using a callback function
   */
  const getUser = async (req, accessToken, refreshToken, profile, cb) => {
    try {
      // Gets authenticated account (if one exists)
      const auth = await crud.getAuth({
        $and: [{ id: profile.id }, { provider: profile.provider }],
      });

      // Gets user name based on the results of what was found and if the user is logged in
      let user = req.isAuthenticated()
        ? !auth
          ? req.user
          : null
        : auth
        ? await crud.getUser({ _id: auth.user })
        : null;

      // Checks for duplicate accounts (when creating an account) and other errors
      if (req.session.newUser) {
        req.session.authError = Boolean(user);
        delete req.session.newUser;
        if (user) return cb(null, false);
        user = await createUser(req, profile);
      } else {
        req.session.authError = !user;
      }

      return req.isAuthenticated()
        ? cb(null, await linkAccount(user, req, profile))
        : user
        ? req.session.authError
          ? cb(null, false)
          : cb(null, user)
        : cb(null, false);
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  };

  /**
   * Creates a new account using OAuth
   * @param {*} req       Represents the request
   * @param {*} profile   Represents the profile of the user
   * @returns             Returns the newly created account
   */
  const createUser = async (req, profile) => {
    // Saves authenticated account
    const auth = await crud.addAuth({
      id: profile.id,
      provider: profile.provider,
    });

    // Get a secret key for AES encrypting
    const KEY = secretKeys.genKey();

    // Saves the user
    const user = await crud.addUser({
      username: profile.username || profile.displayName,
      name: profile.displayName,
      email: Array.isArray(profile.emails) ? profile.emails[0].value : "",
      address:
        profile._json.location && profile._json.location.length > 0
          ? CryptoJS.AES.encrypt(profile._json.location, KEY).toString()
          : profile._json.location,
      oauth: true,
      accounts: [auth],
    });

    // Checks if the secret key was saved in keys.xml (if the key was used)
    if (profile._json.location && profile._json.location.length > 0) {
      req.session.authError = !secretKeys.saveKey(KEY, user._id.toString());
    }

    // Links authenticated account to the user
    auth.user = user._id;
    auth.save();

    return user;
  };

  /**
   * Links an authenticated accounts to the user's account
   * @param {*} user      Represents the current user
   * @param {*} req       Represents the request
   * @param {*} profile   Represents the profile of the user
   * @returns             Returns the newly created account
   */
  const linkAccount = async (user, req, profile) => {
    // Saves authenticated account
    const auth = await crud.addAuth({
      id: profile.id,
      provider: profile.provider,
      user: user._id,
    });

    // Links authenticated account to the user
    user.oauth = true;
    user.accounts.push(auth);
    user.save();

    // Sends notification
    notificationHandler.addToUsers({
      message: "Linked account to your profile",
      user: req.user._id,
    });

    req.session.success = true;

    return user;
  };

  // Local Strategies
  const LocalStrategy = require("passport-local");
  passport.use(
    "local-login",
    new LocalStrategy(
      { passReqToCallback: true },
      async (req, username, password, done) => {
        try {
          console.log("User " + username + " attempted to log in.");
          const user = await crud.getUser({ username: username });
          req.session.error =
            !user || !bcrypt.compareSync(password, user.password);
          return req.session.error ? done(null, false) : done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.use(
    "local-signup",
    new LocalStrategy(
      { passReqToCallback: true },
      async (req, username, password, done) => {
        try {
          console.log("User " + username + " attempted to sign up.");

          // Get a secret key for AES encrypting
          const KEY = secretKeys.genKey();

          // Saves the user
          const user = await crud.addUser({
            username: username,
            password: bcrypt.hashSync(
              password,
              parseInt(process.env.SALT_ROUNDS)
            ),
            email: req.body.email,
            name: req.body.name,
            address:
              req.body.address && req.body.address.length > 0
                ? CryptoJS.AES.encrypt(req.body.address, KEY).toString()
                : req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zipPostal:
              req.body.zipPostal && req.body.zipPostal.length > 0
                ? CryptoJS.AES.encrypt(req.body.zipPostal, KEY).toString()
                : req.body.zipPostal,
          });

          // Checks if the secret key was saved in keys.xml (if the key was used)
          if (
            (req.body.zipPostal && req.body.zipPostal.length > 0) ||
            (req.body.address && req.body.address.length > 0)
          ) {
            req.session.error = !secretKeys.saveKey(KEY, user._id.toString());
            return req.session.error ? done(null, false) : done(null, user);
          } else {
            return done(null, user);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // GitHub Strategy
  const GitHubStrategy = require("passport-github").Strategy;
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        passReqToCallback: true,
      },
      getUser
    )
  );

  // Facebook Strategy
  const FacebookStrategy = require("passport-facebook").Strategy;
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        passReqToCallback: true,
      },
      getUser
    )
  );

  // Twitter Strategy
  const TwitterStrategy = require("passport-twitter").Strategy;
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CLIENT_ID,
        consumerSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: process.env.TWITTER_CALLBACK_URL,
        passReqToCallback: true,
      },
      getUser
    )
  );

  // Google Strategy
  const GoogleStrategy = require("passport-google-oauth20").Strategy;
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      getUser
    )
  );
};
