import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs"; // For password hashing
import validator from "validator"; // For email validation
import uniqueValidator from "mongoose-unique-validator"; // Handles unique field validation

const userSchema = new Schema(
      {
            userName: {
                  type: String,
                  required: [true, "User Name is required"],
                  minlength: [3, "User Name must be at least 3 characters"],
                  maxlength: [50, "User Name must be less than 50 characters"],
                  trim: true, // Removes extra spaces
            },
            email: {
                  type: String,
                  required: [true, "Email is required"],
                  unique: true, // Ensures unique emails
                  lowercase: true, // Ensures email is always in lowercase
                  validate: {
                        validator: (v) => validator.isEmail(v), // Validate email format
                        message: (props) =>
                              `${props.value} is not a valid email address!`,
                  },
            },
            password: {
                  type: String,
                  required: [true, "Password is required"],
                  minlength: [6, "Password must be at least 6 characters"],
                  select: false, // Prevents password from being sent in responses
            },
            role: {
                  type: String,
                  enum: ["user", "admin"],
                  default: "user",
            },
            profilePicture: {
                  type: String,
                  default: null,
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
      },
      {
            timestamps: true,
            toJSON: {
                  // Ensures password and internal fields are hidden in JSON responses
                  transform(doc, ret) {
                        delete ret.password;
                        delete ret.__v;
                        return ret;
                  },
            },
      }
);

// Adding an index on email to improve query performance
userSchema.index({ email: 1 });

// Pre-save middleware to hash the password before saving
userSchema.pre("save", async function (next) {
      if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
      }
      next();
});

// Custom method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
};

// Mongoose plugin to handle unique constraints more gracefully
userSchema.plugin(uniqueValidator, { message: "{PATH} already exists." });

// Virtual field for counting the number of blogs
userSchema.virtual("blogCount").get(function () {
      return this.blogs ? this.blogs.length : 0;
});

export const User = mongoose.model("User", userSchema);
