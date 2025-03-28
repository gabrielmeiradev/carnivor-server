import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { encryptPassword } from "../../utils/password";

interface CreateUserInput {
  username: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;

    const { username, fullName, phone, email, password } =
      req.body as CreateUserInput;

    if (!file) {
      res.status(400).json({ message: "Envie uma imagem de perfil" });
      return;
    }

    await prisma.user.create({
      data: {
        Nome: fullName,
        Email: email,
        Telefone: phone,
        Senha: await encryptPassword(password),
        Login: username,
        ProfileImage: file?.path ?? "",
      },
    });

    res.status(200).json({ message: "Usuário criado com sucesso" });
    return;
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Erro ao criar usuário " + error.toString() });
    return;
  }
};
