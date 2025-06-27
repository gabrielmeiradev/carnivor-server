import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export default function getUserById(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "ID do usuário é obrigatório." });
    return;
  }

  prisma.user
    .findUnique({
      where: { IdUser: id },
    })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
      res.status(200).json(user);
    })
    .catch((error) => {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Erro ao buscar usuário." });
    });
}
