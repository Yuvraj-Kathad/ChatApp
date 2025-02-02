import { model, Schema } from "mongoose";

// Currently not doing the input validation at Database Level. Only upto server level.
const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Search index for users
userSchema.index({ fullname: "text", username: "text" });

const User = model("User", userSchema);

export default User;
