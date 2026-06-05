import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    minLength: 3,
    maxLength: 50,
    trim: true,
  },
  lastName: { type: String, trim: true },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, "Email is required"],
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email address: " + value);
      }
    },
  },
  oauthId: { type: String },
  provider: { type: String }, // 'google' | 'github'
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    validate: {
      validator: function (value) {
        return (
          value.length >= 8 &&
          /[A-Z]/.test(value) &&
          /[a-z]/.test(value) &&
          /[0-9]/.test(value) &&
          /[!@#$%^&*]/.test(value)
        );
      },
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    },
  },

  avatar: {
    type: String,
    default: "micah",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },


  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { timestamps: true });

userSchema.index({ firstName: 1, lastName: 1 });

// Hash password before save if modified — skip if already bcrypt hash
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  // bcrypt hashes look like: $2b$10$... (total length ~60)
  const bcryptHashRegex = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/;
  if (bcryptHashRegex.test(user.password)) {
    // password already hashed — skip re-hashing
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// JWT method
userSchema.methods.getJWT = function () {
  const user = this;
  const payload = { id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  return bcrypt.compare(passwordInputByUser, user.password);
};

export default mongoose.model("User", userSchema);
