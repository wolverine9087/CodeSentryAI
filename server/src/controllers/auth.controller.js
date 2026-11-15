import jwt from "jsonwebtoken";
import User from "../models/User.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
});

function token(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function safe(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email
  };
}

export async function register(req, res) {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required"
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({
      message: "An account with that email already exists"
    });
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password
  });

  res.cookie("token", token(user), cookieOptions());

  return res.status(201).json({
    user: safe(user)
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  const normalizedEmail = String(email || "").trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail
  }).select("+password");

  if (!user || !await user.comparePassword(String(password || ""))) {
    return res.status(401).json({
      message: "Email or password is incorrect"
    });
  }

  res.cookie("token", token(user), cookieOptions());

  return res.status(200).json({
    user: safe(user)
  });
}

export async function logout(_req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/"
  });

  return res.json({
    message: "Signed out"
  });
}

export function me(req, res) {
  return res.json({
    user: safe(req.user)
  });
}
