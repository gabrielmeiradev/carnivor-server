import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const secret = "MMMM";

function accessTokenFromUser(user: object) {
  return jwt.sign(user, secret, { expiresIn: "72h" });
}

function checkAccessToken(token: string) {
  return jwt.verify(token, secret);
}

function userModelFromToken(token: string): User {
  try {
    token = token.replace("Bearer ", "");
    const user = jwt.decode(token) as User;
    return user;
  } catch (error) {
    throw new Error("Token inválido");
  }
}

export { accessTokenFromUser, checkAccessToken, userModelFromToken };
