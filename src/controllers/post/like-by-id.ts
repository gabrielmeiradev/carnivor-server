import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userModelFromToken } from "../../utils/token";
import { OneSignalNotificationHelper } from "../../helpers/notification/oneSignalNotification";
import { notifyUser } from "../../queue/producer";

const prisma = new PrismaClient();

export const likePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const author_id = userModelFromToken(req.headers.authorization!).IdUser;

  const likeAuthor = await prisma.user.findUnique({
    where: { IdUser: author_id as string, UserAtivo: true },
  });
  if (!likeAuthor) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Usuário não encontrado" });
    return;
  }

  try {
    const like = await prisma.like.findFirst({
      where: {
        post_id: id,
        user_id: author_id as string,
      },
    });

    if (!like) {
      await prisma.like.create({
        data: {
          post_id: id,
          user_id: author_id as string,
        },
      });

      let post = await prisma.post.update({
        where: { post_id: id },
        data: {
          likes_count: {
            increment: 1,
          },
        },
      });

      let author = await prisma.user.findUnique({
        where: { IdUser: post.author_id, UserAtivo: true },
      });

      if (!author) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Autor não encontrado" });
        return;
      }

      try {
        if (!author.CurrentDeviceId) {
          console.warn(
            "Autor não possui dispositivo registrado para notificações"
          );
          return;
        }
        await notifyUser(
          author.CurrentDeviceId,
          "Novo like no seu post",
          `${likeAuthor.Nome} curtiu seu post`
        );
      } catch (error) {
        console.error("Erro ao enviar notificação de like:", error);
      }

      res.status(StatusCodes.OK).json({ message: "Post curtido" });
    } else {
      await prisma.like.delete({
        where: {
          like_id: like.like_id,
        },
      });

      await prisma.post.update({
        where: { post_id: id },
        data: {
          likes_count: {
            decrement: 1,
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Post descurtido" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Falha ao curtir o post" });
    return;
  }
};
