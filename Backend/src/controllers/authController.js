import User from "../models/userModel.js";
import { hashedPassword, comparePassword } from "../lib/hashPassword.js";
import { generateToken } from "../lib/JWT.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { email, password, fullName, profilePic } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ message: "invalid credentials" });
  }

  const hashed = await hashedPassword(password);

  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    const newUser = new User({
      email,
      password: hashed,
      fullName,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // email check
    const userExist = await User.findOne({ email });
    if (!userExist) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    // password verification
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExist.password
    );
    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    // token generating
    // token generating
    generateToken(userExist._id, res);
    res.status(201).json({
      _id: userExist._id,
      email: userExist.email,
      fullName: userExist.fullName,
      profilePic: userExist.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "user has sucessfully loged out" });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
