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

    const post = await prisma.post.findUnique({
      where: {
        post_id: id,
      },
      include: {
        comments: true,
      },
    });

    if (!post || post.author_id !== IdUser) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "Não autorizado" });
      return;
    }

    for (const comment of post.comments) {
      await prisma.like.deleteMany({ where: { post_id: comment.post_id } });
      await prisma.postReport.deleteMany({
        where: { post_id: comment.post_id },
      });
    }

    await prisma.post.deleteMany({
      where: {
        parent_id: id,
      },
    });

    await prisma.like.deleteMany({ where: { post_id: id } });
    await prisma.postReport.deleteMany({ where: { post_id: id } });

    if (post.parent_id) {
      await prisma.post.update({
        where: { post_id: post.parent_id },
        data: {
          comments_count: {
            decrement: 1,
          },
        },
      });
    }

    await prisma.post.delete({
      where: {
        post_id: id,
      },
    });

    for (const image of post.medias) {
      const filePath = path.join(__dirname, "../../..", image);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error(`Falha ao deletar imagem: ${filePath}`, err);
      }
    }

    res.status(StatusCodes.OK).json({ message: "Post deletado com sucesso" });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Falha ao deletar post" });
    return;
  }
};
