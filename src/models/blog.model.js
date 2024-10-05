import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
      {
            title: {
                  type: String,
                  required: true,
            },
            subtitle: {
                  type: String,
                  required: true,
            },
            content: {
                  type: String,
                  required: true,
            },
            tags: {
                  type: [String],
                  required: true,
            },
      },
      { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
