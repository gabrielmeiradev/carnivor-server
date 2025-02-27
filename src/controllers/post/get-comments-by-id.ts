import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getCommentsById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await prisma.post.findMany({
      where: {
        parent_id: id,
      },
      include: {
        author: true,
        hashtags: true,
        likes: {
          select: {
            user_id: true,
          },
        },
      },
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
};
