import { uploadFileCloudinary } from "../../FileHandler/Upload.js";
import { User } from "../../models/user.model.js";
import { sendVerificationEmail } from "../../Options/mailOptions.js";
import { transporter } from "../../Services/mailSender.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import crypto from "crypto"; // For generating verification tokens
import bcrypt from "bcrypt"; // For hashing passwords

const registerUser = asyncHandler(async (req, res, next) => {
      const {
            userName,
            fullName,
            email,
            password,
            phone,
            dateOfBirth,
            bio,
            location,
      } = req.body;

      // Validate required fields
      if (
            [userName, fullName, email, password].some(
                  (field) => !field?.trim()
            )
      ) {
            return next(
                  new apiErrorHandler(
                        400,
                        "All required fields must be provided"
                  )
            );
      }

      // Parallel query to check if the user already exists
      const [existingUserByEmail, existingUserByPhone, existingUserByUsername] =
            await Promise.all([
                  User.findOne({ email }).lean(),
                  User.findOne({ phone }).lean(),
                  User.findOne({ userName }).lean(),
            ]);

      if (existingUserByEmail)
            return next(new apiErrorHandler(400, "Email already exists"));
      if (existingUserByPhone)
            return next(
                  new apiErrorHandler(400, "Phone number already exists")
            );
      if (existingUserByUsername)
            return next(new apiErrorHandler(400, "Username already exists"));

      // Check and handle avatar upload
      const profilePicturePath = req.files?.profilePicture?.[0]?.path;
      if (!profilePicturePath) {
            return next(new apiErrorHandler(400, "Avatar is required"));
      }

      // Run avatar upload, password hash, and token generation in parallel
      const [uploadProfilePicture, hashedPassword, emailVerificationToken] =
            await Promise.all([
                  uploadFileCloudinary(profilePicturePath),
                  bcrypt.hash(password, 10), // Salt rounds directly inside hash call
                  crypto.randomBytes(32).toString("hex"),
            ]);

      if (!uploadProfilePicture) {
            return next(new apiErrorHandler(500, "Error uploading avatar"));
      }

      // Create the user
      const user = await User.create({
            userName,
            fullName,
            email,
            password: hashedPassword,
            phone,
            dateOfBirth,
            bio,
            location,
            profilePicture: uploadProfilePicture,
            profilePictureAlt:
                  uploadProfilePicture.original_filename || "Avatar",
            emailVerificationToken,
      });

      if (!user) {
            return next(new apiErrorHandler(500, "Error registering user"));
      }

      // Send the verification email asynchronously (no need to wait for it to finish)
      transporter
            .sendMail(
                  await sendVerificationEmail(
                        user.email,
                        emailVerificationToken
                  )
            )
            .catch((err) =>
                  console.error("Error sending verification email:", err)
            );

      // Fetch the user without sensitive fields
      const newUser = await User.findById(user._id).select(
            "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires"
      );

      // Return the response immediately
      res.status(201).json(
            new apiResponse(201, newUser, "User registered successfully")
      );
});

export { registerUser };
