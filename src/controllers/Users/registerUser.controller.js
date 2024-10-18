import { uploadFileCloudinary } from "../../FileHandler/Upload.js";
import { User } from "../../models/user.model.js";
import { sendVerificationEmail } from "../../Options/mailOptions.js";
import { transporter } from "../../Services/mailSender.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

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

      // Use a single query to check for existing users
      const existingUser = await User.findOne({
            $or: [{ email }, { phone }, { userName }],
      }).lean();

      if (existingUser) {
            if (existingUser.email === email) {
                  return next(new apiErrorHandler(400, "Email already exists"));
            }
            if (existingUser.phone === phone) {
                  return next(
                        new apiErrorHandler(400, "Phone number already exists")
                  );
            }
            if (existingUser.userName === userName) {
                  return next(
                        new apiErrorHandler(400, "Username already exists")
                  );
            }
      }

      // Validate and handle avatar upload
      const profilePicturePath = req.files?.profilePicture?.[0]?.path;
      if (!profilePicturePath) {
            return next(new apiErrorHandler(400, "Avatar is required"));
      }

      // Run avatar upload, password hashing, and token generation in parallel
      const [uploadProfilePicture, hashedPassword, emailVerificationToken] =
            await Promise.all([
                  uploadFileCloudinary(profilePicturePath),
                  bcrypt.hash(password, 10),
                  crypto.randomBytes(32).toString("hex"),
            ]);

      if (!uploadProfilePicture) {
            return next(new apiErrorHandler(500, "Error uploading avatar"));
      }

      // Create the user record
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

      // Send the verification email asynchronously
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

      // Fetch the new user without sensitive fields
      const newUser = await User.findById(user._id)
            .select(
                  "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires"
            )
            .lean();

      // Send the response immediately
      res.status(201).json(
            new apiResponse(201, newUser, "User registered successfully")
      );
});

export { registerUser };
