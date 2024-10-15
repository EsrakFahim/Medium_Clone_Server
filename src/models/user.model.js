import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new Schema(
      {
            userName: {
                  type: String,
                  required: [true, "User Name is required"],
                  minlength: [3, "User Name must be at least 3 characters"],
                  maxlength: [50, "User Name must be less than 50 characters"],
                  trim: true,
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
                        validator: (v) => validator.isEmail(v),
                        message: (props) =>
                              `${props.value} is not a valid email address!`,
                  },
            },
            password: {
                  type: String,
                  required: [true, "Password is required"],
                  minlength: [6, "Password must be at least 6 characters"],
                  select: false,
            },
            role: {
                  type: String,
                  enum: ["user", "admin", "editor", "moderator"],
                  default: "user",
            },
            profilePicture: {
                  type: String,
                  default: null,
            },
            bio: {
                  type: String,
                  maxlength: 500,
                  default: "",
            },
            location: {
                  type: String,
                  maxlength: 100,
                  default: "",
            },
            phone: {
                  type: String,
                  validate: {
                        validator: (v) => validator.isMobilePhone(v, "any"),
                        message: (props) =>
                              `${props.value} is not a valid phone number!`,
                  },
                  default: null,
            },
            dateOfBirth: {
                  type: Date,
                  default: null,
            },
            isVerified: {
                  type: Boolean,
                  default: false, // Indicates if the user has verified their email
            },
            emailVerificationToken: {
                  type: String,
                  select: false, // This token is used for verification processes
            },
            resetPasswordToken: {
                  type: String,
                  select: false,
            },
            resetPasswordExpires: {
                  type: Date,
                  select: false,
            },
            lastLogin: {
                  type: Date, // Tracks the last login time
                  default: null,
            },
            status: {
                  type: String,
                  enum: ["active", "inactive", "banned"],
                  default: "active", // Indicates the account status
            },
            preferences: {
                  darkMode: { type: Boolean, default: false },
                  language: { type: String, default: "en" },
            },
            blogs: [
                  {
                        type: Schema.Types.ObjectId,
                        ref: "Blog",
                  },
            ],
            likedBlogs: [
                  {
                        type: Schema.Types.ObjectId,
                        ref: "Blog",
                  },
            ],
            bookmarks: [
                  {
                        type: Schema.Types.ObjectId,
                        ref: "Blog",
                  },
            ],
            followingChannels: [
                  {
                        type: Schema.Types.ObjectId,
                        ref: "Channel",
                  },
            ],
            followers: [
                  {
                        type: Schema.Types.ObjectId,
                        ref: "User",
                  },
            ],
            following: [
                  {
                        type: Schema.Types.ObjectId,
                        ref: "User",
                  },
            ],
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

// Index for faster email lookups
userSchema.index({ email: 1 });

// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
      if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
      }
      next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
};

// Generate a token for password reset
userSchema.methods.generatePasswordResetToken = function () {
      const token = crypto.randomBytes(32).toString("hex");
      this.resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
      this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      return token;
};

// Mongoose plugin to handle unique constraints
userSchema.plugin(uniqueValidator, { message: "{PATH} already exists." });

export const User = mongoose.model("User", userSchema);
