import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePassword } from "../../utils/password";
import { accessTokenFromUser } from "../../utils/token";

interface LoginInput {
  email: string;
  password: string;
  deviceId?: string;
}

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body as LoginInput;

    email = email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            Email: {
              equals: email,
              mode: "insensitive",
            },
          },
          {
            Login: {
              equals: email,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    if (!user.UserAtivo) {
      res.status(403).json({ message: "Conta em processo de exclusão" });
      return;
    }

    const isPasswordCorrect = await comparePassword(
      password,
      user?.Senha ?? ""
    );

    if (!isPasswordCorrect) {
      console.log("Senha incorreta:", password);
      res.status(401).json({ message: "Senha incorreta" });
      return;
    }

    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    const token = accessTokenFromUser(user);

    const { Senha, ...userWithoutPassword } = user;
    console.log("Usuário logado:", userWithoutPassword);
    res
      .status(200)
      .json({ message: "Usuário logado", token, user: userWithoutPassword });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar usuário" });
    return;
  }
};
