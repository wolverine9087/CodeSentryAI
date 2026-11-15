import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function protect(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({
        message: "Sign in to continue"
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "Account no longer exists"
      });
    }

    req.user = user;
    next();

  } catch {
    return res.status(401).json({
      message: "Session expired. Please sign in again."
    });
  }
}
