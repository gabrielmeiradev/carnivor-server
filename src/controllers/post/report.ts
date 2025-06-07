import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userModelFromToken } from "../../utils/token";

const prisma = new PrismaClient();

export const reportPost = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user_id = userModelFromToken(req.headers.authorization || "").IdUser;

  if (!id) {
    res.status(400).json({ message: "Post ID é obrigatório" });
    return;
  }

  try {
    const report = await prisma.postReport.create({
      data: {
        post_id: id as string,
        user_id,
      },
    });

    res.status(201).json({ message: "Post reportado com sucesso", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao reportar o post" });
  }
};
