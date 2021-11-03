require("dotenv").config();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const crud = require("./crud");

/**
 * Module that sets up Passport serialization and all Passport strategies
 * @module ./auth
 *
 */
module.exports = () => {
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialization
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    crud.getUser(id).then((user) => done(null, user));
  });

  /**
   *
   * @param {String} accessToken    Represents the token used to access an API
   * @param {String} refreshToken   Represents the token used to create a new access token
   * @param {*} profile             Represents the profile of the user
   * @param {Function} cb           Represents the callback function that stores the result
   * @returns                       Returns the result using a callback function
   */
  const getUser = async (accessToken, refreshToken, profile, cb) => {
    console.log(profile);
    try {
      const user = await crud.getUser({
        $and: [{ username: profile.username }, { name: profile.displayName }],
      });

      return user ? cb(user) : cb(false);
    } catch (err) {
      return cb(err);
    }
  };

  // Local Strategy
  const LocalStrategy = require("passport-local");
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("User " + username + " attempted to log in.");
        const user = await crud.getUser({ username: username });
        return !user || !bcrypt.compareSync(password, user.password)
          ? done(null, false)
          : done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // GitHub Strategy
  const GitHubStrategy = require("passport-github").Strategy;
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: proccess.env.GITHUB_CALLBACK_URL,
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
        callbackURL: proccess.env.FACEBOOK_CALLBACK_URL,
      },
      getUser
    )
  );

  // Twitter Strategy
  const TwitterStrategy = require("passport-twitter").Strategy;
  passport.use(
    new TwitterStrategy(
      {
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: proccess.env.TWITTER_CALLBACK_URL,
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
        callbackURL: proccess.env.GOOGLE_CALLBACK_URL,
      },
      getUser
    )
  );

  // Microsoft Strategy
  const MicrosoftStrategy = require("passport-microsoft").Strategy;
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: proccess.env.MICROSOFT_CALLBACK_URL,
      },
      getUser
    )
  );
};
