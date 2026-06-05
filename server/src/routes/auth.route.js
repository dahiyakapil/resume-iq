import express from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import { sendOtp } from "../controllers/sendOTP.controller.js";
import { signUp, login, logout, getCurrentUser, updateProfile, updatePassword, updateAvatar, forgotPassword, resetPassword, deleteUser } from "../controllers/auth.controller.js";
import { verifyOtp } from "../controllers/verifyOtpController.js";
import { requestLogger, responseTimeLogger } from "../middlewares/logger.js";

const authRouter = express.Router();

// Apply logging middleware to auth routes (helps with debugging)
if (process.env.NODE_ENV === 'development') {
  authRouter.use(requestLogger);
  authRouter.use(responseTimeLogger);
}

// Step 1 — Send OTP
authRouter.post("/send-otp", sendOtp);      
authRouter.post("/verify-otp", verifyOtp);


// authRouter.post("/signup", signUp);

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", userAuth, getCurrentUser);
authRouter.put("/update-profile", userAuth, updateProfile);
authRouter.put("/update-password", userAuth, updatePassword);
authRouter.put("/update-avatar", userAuth, updateAvatar);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);


authRouter.delete("/:id", deleteUser);

export default authRouter;
