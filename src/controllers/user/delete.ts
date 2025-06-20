import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userModelFromToken } from "../../utils/token";
const prisma = new PrismaClient();

export const deleteUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }
  const userId = userModelFromToken(token).IdUser;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { IdUser: userId },
    });
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    await prisma.user.update({
      where: { IdUser: userId },
      data: {
        UserAtivo: false,
      },
    });

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ message: "Erro ao deletar usuário" });
  }
};
