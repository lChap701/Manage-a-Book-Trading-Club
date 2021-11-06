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
  // Serialization
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    crud.getUser(id).then((user) => done(null, user));
  });

  /**
   * Checks if the user exists (for accounts created using OAuth)
   * @param {*} req                 Represents the request
   * @param {String} accessToken    Represents the token used to access an API
   * @param {String} refreshToken   Represents the token used to create a new access token
   * @param {*} profile             Represents the profile of the user
   * @param {Function} cb           Represents the callback function that stores the result
   * @returns                       Returns the result using a callback function
   */
  const getUser = async (req, accessToken, refreshToken, profile, cb) => {
    console.log(profile);
    try {
      let user = await crud.getUser({
        $and: [
          { "accounts.id": profile.id },
          { "accounts.url": profile.profileUrl },
          { "accounts.provider": profile.provider },
        ],
      });

      console.log(req.baseUrl);

      // Checks for duplicate accounts to determine if the user should be able to create an account
      if (req.baseUrl == "/signup") {
        if (user) {
          req.session.duplicateAccount = true;
          return cb(false);
        } else {
          req.session.duplicateAccount = false;
          user = await createUser(profile);
        }
      }

      return user ? cb(user) : cb(false);
    } catch (err) {
      return cb(err);
    }
  };

  /**
   * Creates new accounts using OAuth
   * @param {*} profile   Represents the profile of the user
   * @returns             Returns the newly created account
   */
  const createUser = async (profile) => {
    const account = {
      id: profile.id,
      username: profile.username,
      name: profile.displayName,
      url: profile.profileUrl,
      photos: profile.photos,
      provider: profile.provider,
    };

    return await crud.addUser({
      username: profile.username,
      name: profile.displayName,
      /* address: profile._json.location.split(ADDRESS_REGEX)[0],
      city: profile._json.location.split(CITY_REGEX)[0],
      state: profile._json.location.split(STATE_REGEX)[0],
      country: profile._json.location.split(COUNTRY_REGEX)[0],
      zipPostal: profile._json.location.split(ZIP_POSTAL_CODE_REGEX)[0], */
      oauth: true,
      accounts: [account],
    });
  };

  // Local Strategies
  const LocalStrategy = require("passport-local");
  passport.use(
    "local-login",
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
  passport.use(
    "local-signup",
    new LocalStrategy(
      { passReqToCallback: true },
      async (req, username, password, done) => {
        try {
          console.log("User " + username + " attempted to sign up.");
          const user = await crud.addUser({
            username: username,
            password: bcrypt.hashSync(
              password,
              parseInt(process.env.SALT_ROUNDS)
            ),
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zipPostal: req.body.zipPostal,
          });
          return done(null, user);
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

  // Microsoft Strategy
  const MicrosoftStrategy = require("passport-microsoft").Strategy;
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL,
        passReqToCallback: true,
      },
      getUser
    )
  );
};
