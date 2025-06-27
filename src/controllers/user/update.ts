import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { name, username } = req.body;
  const file = req.file as Express.Multer.File;

  if (!name || !username) {
    res.status(400).json({ message: "Todos os campos são obrigatórios." });
    return;
  }

  const userExistsWithUsername = await prisma.user.findFirst({
    where: {
      Login: username,
    },
  });

  if (userExistsWithUsername) {
    res.status(400).json({ message: "Esse usuário já foi registrado" });
    return;
  }

  const userUpdatedData: any = {
    Nome: name.trim(),
    Login: username.trim().toLowerCase(),
  };

  if (file) {
    userUpdatedData.ProfileImage = file?.path ?? "";
  }

  prisma.user
    .update({
      where: { IdUser: id },
      data: userUpdatedData,
    })
    .then((updatedUser) => {
      res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        user: updatedUser,
      });
    })
    .catch((error) => {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Erro ao atualizar usuário." });
    });
}
