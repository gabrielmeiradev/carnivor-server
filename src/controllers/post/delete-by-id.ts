import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userModelFromToken } from "../../utils/token";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const deletePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { IdUser } = userModelFromToken(req.headers.authorization!);
    await prisma.like.deleteMany({
      where: {
        post_id: id,
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        post_id: id,
      },
    });

    if (!post || post.author_id !== IdUser) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "Não autorizado" });
      return;
    }

    if (post.parent_id) {
      await prisma.post.update({
        where: {
          post_id: post.parent_id,
        },
        data: {
          comments_count: {
            decrement: 1,
          },
        },
      });
    }

    await prisma.postReport.deleteMany({
      where: {
        post_id: id,
      },
    });

    await prisma.post.deleteMany({
      where: {
        OR: [
          {
            post_id: id,
            author_id: IdUser,
          },
          {
            parent_id: id,
          },
        ],
      },
    });

    for (const image of post.medias) {
      const filePath = path.join(__dirname, "../../..", image);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete image file: ${filePath}`, err);
      }
    }

    res.status(StatusCodes.OK).json({ message: "Post deletado" });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Falha ao deletar post" });
    return;
  }
};
