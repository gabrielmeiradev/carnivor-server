import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        post_id: id,
        author: {
          UserAtivo: true,
        },
      },
      include: {
        hashtags: true,
        author: true,
        categories: true,
        likes: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!post) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Post não encontrado" });
      return;
    }

    res.status(StatusCodes.OK).json(post);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Ocorreu um erro ao buscar o post" });
  }
};
