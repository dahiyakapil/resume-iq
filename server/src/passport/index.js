// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as GitHubStrategy } from "passport-github2";
// import User from "../models/user.model.js";

// passport.serializeUser((user, done) => {
//   done(null, user.id); // Store user ID in session
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// console.log(process.env.GOOGLE_CLIENT_ID)
// console.log(process.env.GOOGLE_CLIENT_SECRET)

// // Google Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/oauth/google/callback",
//     },
//     async (_, __, profile, done) => {
//       try {
//         let user = await User.findOne({ oauthId: profile.id });
//         if (!user) {
//           user = await User.create({
//             firstName: profile.name.givenName,
//             lastName: profile.name.familyName,
//             email: profile.emails[0].value,
//             oauthId: profile.id,
//             provider: "google",
//           });
//         }
//         done(null, user);
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );

// // GitHub Strategy
// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: "/api/oauth/github/callback",
//     },
//     async (_, __, profile, done) => {
//       try {
//         let user = await User.findOne({ oauthId: profile.id });
//         if (!user) {
//           user = await User.create({
//             firstName: profile.username,
//             lastName: "",
//             email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
//             oauthId: profile.id,
//             provider: "github",
//           });
//         }
//         done(null, user);
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );

// export default passport;
