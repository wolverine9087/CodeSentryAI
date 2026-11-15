import jwt from "jsonwebtoken";
import User from "../models/User.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
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

  if (await User.exists({ email: String(email).toLowerCase() })) {
    return res.status(409).json({
      message: "An account with that email already exists"
    });
  }

  const user = await User.create({ name, email, password });

  res.cookie("token", token(user), cookieOptions());

  res.status(201).json({
    user: safe(user)
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  const user = await User.findOne({
    email: String(email || "").toLowerCase()
  }).select("+password");

  if (!user || !await user.comparePassword(String(password || ""))) {
    return res.status(401).json({
      message: "Email or password is incorrect"
    });
  }

  res.cookie("token", token(user), cookieOptions());

  res.json({
    user: safe(user)
  });
}

export async function logout(_req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  res.json({
    message: "Signed out"
  });
}

export function me(req, res) {
  res.json({
    user: safe(req.user)
  });
}
