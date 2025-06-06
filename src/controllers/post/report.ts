import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userModelFromToken } from "../../utils/token";

const prisma = new PrismaClient();

export const reportPost = async (req: Request, res: Response) => {
  const { post_id } = req.body;

  const user_id = userModelFromToken(req.headers.authorization || "").IdUser;

  if (!post_id) {
    res.status(400).json({ message: "Post ID e motivo são obrigatórios" });
    return;
  }

  try {
    const report = await prisma.postReport.create({
      data: {
        post_id,
        user_id,
      },
    });

    res.status(201).json({ message: "Post reportado com sucesso", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao reportar o post" });
  }
};
