import { validateSignupData } from "../utils/validation.js";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !otp) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check OTP in DB
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ error: "No OTP found for this email" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ error: "OTP expired" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    // Create user
    const user = new User({ firstName, lastName, email, password });
    const savedUser = await user.save();

    // Send welcome email
    try {
      await sendEmail({
        to: savedUser.email,
        subject: "Welcome to MyApp 🎉",
        html: `<h2>Hello ${savedUser.firstName},</h2>
               <p>Welcome to MyApp! We're glad to have you onboard.</p>`,
      });
    } catch (emailErr) {
      await User.findByIdAndDelete(savedUser._id);
      console.error("❌ Email sending failed:", emailErr.message);
      return res.status(500).json({
        error: "User creation failed due to email error. Please try again.",
      });
    }

    // Remove OTP after success
    await OTP.deleteOne({ email });

    const token = savedUser.getJWT();

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        avatar: savedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!validator.isEmail(email)) {
//       return res.status(400).json({ error: "Email is not valid" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid Credentials" });
//     }

//     const isPasswordValid = await user.validatePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid Credentials" });
//     }

//     const token = user.getJWT();

//     res.json({
//       message: "Logged in Successfully",
//       token,
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


export const login = async (req, res) => {
  const normalizeEmail = (raw) => String(raw || "").trim().toLowerCase();
  try {
    let { email: rawEmail, password } = req.body;
    const email = normalizeEmail(rawEmail);

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email is not valid" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Login failed: user not found for email", email);
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      console.log("Login failed: invalid password for user", email);
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const token = user.getJWT();

    res.json({
      message: "Logged in Successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,

      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};



export const logout = (req, res) => {
  // For pure JWT, logout is handled on client by deleting token
  res.json({ message: "Logged Out Successfully (client should remove token)" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword; // gets hashed in pre-save
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = req.body.style || "micah";
    await user.save();

    res.json({
      message: "Avatar updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};










// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email is not valid" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request 🔑",
      text: `Hello ${user.firstName}, reset your password at ${resetUrl}`,
      html: `<h2>Hello ${user.firstName},</h2>
         <p>You requested a password reset.</p>
         <p>Click here to reset: <a href="${resetUrl}">${resetUrl}</a></p>
         <p>This link will expire in 15 minutes.</p>`
    });


    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





export const user = {
  signup: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { firstName, lastName, email, password, otp } = req.body;

      // 1. Input validation
      if (!firstName || !lastName || !email || !password || !otp) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // 2. OTP validation
      const otpRecord = await OTP.findOne({ email }).session(session);
      if (!otpRecord) {
        return res.status(400).json({ error: "No OTP found for this email" });
      }

      if (otpRecord.expiresAt < Date.now()) {
        await OTP.deleteOne({ email }).session(session);
        return res.status(400).json({ error: "OTP expired" });
      }

      const isOtpValid = await bcrypt.compare(otp, otpRecord.otp); // assuming otp was hashed before saving
      if (!isOtpValid) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      // 3. Check for existing user
      const existingUser = await User.findOne({ email }).session(session);
      if (existingUser) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      // 4. Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 5. Create user
      const newUser = new User({
        firstName: validator.escape(firstName),
        lastName: validator.escape(lastName),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "user", // default role
        status: "active", // default status
      });

      const savedUser = await newUser.save({ session });

      // 6. Delete OTP after successful signup
      await OTP.deleteOne({ email }).session(session);

      // 7. Commit DB changes
      await session.commitTransaction();
      session.endSession();

      // 8. Send welcome email (async queue style)
      try {
        await sendEmail({
          to: savedUser.email,
          subject: "Welcome to MyApp 🎉",
          html: `<h2>Hello ${savedUser.firstName},</h2>
                 <p>Welcome to MyApp! We're glad to have you onboard.</p>`,
        });
      } catch (emailErr) {
        console.error("❌ Email sending failed:", emailErr.message);
        // Don’t delete user — just log & maybe push to retry queue
      }

      // 9. Generate JWT
      const token = jwt.sign(
        { id: savedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 10. Set HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // 11. Respond success
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          avatar: savedUser.avatar,
        },
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Signup error:", error.message);
      res.status(500).json({ error: "Signup failed. Please try again." });
    }
  },
};