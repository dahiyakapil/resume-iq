import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // store hashed
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true }
}, { timestamps: true });

// auto-delete expired pending docs
pendingUserSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PendingUser", pendingUserSchema);
