import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new Schema(
      {
            userName: {
                  type: String,
                  required: [true, "User Name is required"],
                  minlength: [3, "User Name must be at least 3 characters"],
                  maxlength: [50, "User Name must be less than 50 characters"],
                  trim: true,
                  unique: true,
            },
            fullName: {
                  type: String,
                  required: [true, "Full Name is required"],
                  minlength: [3, "Full Name must be at least 3 characters"],
                  maxlength: [50, "Full Name must be less than 50 characters"],
                  trim: true,
            },
            email: {
                  type: String,
                  required: [true, "Email is required"],
                  unique: true,
                  lowercase: true,
                  validate: {
                        validator: validator.isEmail,
                        message: (props) =>
                              `${props.value} is not a valid email address!`,
                  },
            },
            password: {
                  type: String,
                  required: [true, "Password is required"],
                  minlength: [6, "Password must be at least 6 characters"],
                  // select: false,
            },
            role: {
                  type: String,
                  enum: ["user", "admin", "editor", "moderator"],
                  default: "user",
            },
            profilePicture: { type: Object, default: null },
            profilePictureAlt: {
                  type: String,
                  default: "User Profile Picture",
            },
            bio: { type: String, maxlength: 500, default: "" },
            location: { type: String, maxlength: 100, default: "" },
            phone: {
                  type: String,
                  validate: {
                        validator: (v) => validator.isMobilePhone(v, "any"),
                        message: (props) =>
                              `${props.value} is not a valid phone number!`,
                  },
                  unique: true,
                  sparse: true, // Allows null values without unique constraint errors
            },
            dateOfBirth: { type: Date, default: null },
            isVerified: { type: Boolean, default: false },
            emailVerificationToken: { type: String, select: false },
            resetPasswordToken: { type: String, select: false },
            resetPasswordExpires: { type: Date, select: false },
            lastLogin: { type: Date, default: null },
            status: {
                  type: String,
                  enum: ["active", "inactive", "banned"],
                  default: "active",
            },
            preferences: {
                  darkMode: { type: Boolean, default: false },
                  language: { type: String, default: "en" },
            },
            blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
            likedBlogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
            bookmarks: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
            followingChannels: [
                  { type: Schema.Types.ObjectId, ref: "Channel" },
            ],
            followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
            following: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
      {
            timestamps: true,
            toJSON: {
                  transform(doc, ret) {
                        delete ret.password;
                        delete ret.__v;
                        delete ret.emailVerificationToken;
                        delete ret.resetPasswordToken;
                        return ret;
                  },
            },
      }
);

// Indexes for faster lookups
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userName: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Hash the password before saving
userSchema.pre("save", async function (next) {
      if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            console.log("Hashed Password:", hashedPassword); // Debugging
            this.password = hashedPassword;
      }
      next();
});

// Compare passwords for login
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
      console.log("Comparing:", candidatePassword, this.password); // Debugging
      if (!this.password) throw new Error("Password is not set");
      return await bcrypt.compare(candidatePassword, this.password);
};

// Generate a token for password reset
userSchema.methods.generatePasswordResetToken = function () {
      const token = crypto.randomBytes(32).toString("hex");
      this.resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
      this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
      return token;
};

// Custom error handling for unique fields
userSchema.post("save", function (error, doc, next) {
      if (error.name === "MongoServerError" && error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            next(new Error(`${field} already exists.`));
      } else {
            next(error);
      }
});

export const User = mongoose.model("User", userSchema);
