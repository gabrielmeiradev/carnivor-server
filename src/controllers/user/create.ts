import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { encryptPassword } from "../../utils/password";
import { getUserTypeFromString } from "../../utils/user";

interface CreateUserInput {
  username: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  userType: "Anunciante" | "Membro";
}

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;

    const { username, fullName, phone, email, password, userType } =
      req.body as CreateUserInput;

    if (!file) {
      res.status(400).json({ message: "Envie uma imagem de perfil" });
      return;
    }

    const userExistsWithEmail = await prisma.user.findFirst({
      where: {
        Email: email,
      },
    });

    if (userExistsWithEmail) {
      res.status(400).json({ message: "Usuário com este email já existe" });
      return;
    }

    const userExistsWithUsername = await prisma.user.findFirst({
      where: {
        Login: username,
      },
    });

    if (userExistsWithUsername) {
      res
        .status(400)
        .json({ message: "Usuário com este nome de usuário já existe" });
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
        TipoUser: getUserTypeFromString(userType),
      },
    });

    res.status(200).json({ message: "Usuário criado com sucesso" });
    return;
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: "Erro ao criar usuário" });
    return;
  }
};
