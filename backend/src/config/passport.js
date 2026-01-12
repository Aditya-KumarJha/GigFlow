import dotenv from 'dotenv';
dotenv.config();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import userModel from "../models/user.model.js";

const BACKEND_URL = process.env.BACKEND_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const mode = req.query.state || "login";

        let user = await userModel.findOne({ googleId: profile.id });
        let isNewUser = false;

        if (mode === "login" && !user) {
          return done(null, false, { 
            message: "No account found. Please sign up first." 
          });
        }

        if (mode === "signup" && !user) {
          user = await userModel.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || null,
            fullName: {
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
            },
            provider: "google",
            isVerified: true,
            profilePic: profile.photos?.[0]?.value || "",
          });
          isNewUser = true;
        }

        return done(null, user, { isNewUser });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const mode = req.query.state || "login";

        let user = await userModel.findOne({ githubId: profile.id });
        let isNewUser = false;

        if (mode === "login" && !user) {
          return done(null, false, { 
            message: "No account found. Please sign up first." 
          });
        }

        if (mode === "signup" && !user) {
          user = await userModel.create({
            githubId: profile.id,
            email: profile.emails?.[0]?.value || null,
            fullName: {
              firstName: profile.displayName?.split(" ")[0] || "",
              lastName:
                profile.displayName?.split(" ").slice(1).join(" ") || "",
            },
            provider: "github",
            isVerified: true,
            profilePic: profile.photos?.[0]?.value || "",
          });
          isNewUser = true;
        }

        return done(null, user, { isNewUser });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
