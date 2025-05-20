import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PostCreationInput } from "./create";
import fs from "fs";
import path from "path";
import { userModelFromToken } from "../../utils/token";
const prisma = new PrismaClient();

export const editPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { deletePreviousMedia } = req.query;

  const { text_content, hashtags, categories } = req.body as PostCreationInput;
  let hashtagsArray = hashtags?.split(",") ?? [];
  let categoriesArray = categories?.split(",") ?? [];

  hashtagsArray = [...new Set([...hashtagsArray])];
  categoriesArray = [...new Set([...categoriesArray])];
  console.log(categoriesArray);

  const newImages = req.files as Express.Multer.File[];
  try {
    const author_id = userModelFromToken(req.headers.authorization!).IdUser;
    const existingPost = await prisma.post.findUnique({
      where: { post_id: id, author_id: author_id as string },
    });
    if (!existingPost) {
      res.status(404).json({ message: "Post não encontrado ou autorizado" });
      return;
    }

    let mediasPaths = existingPost.medias;
    if (newImages.length > 0 || deletePreviousMedia) {
      existingPost.medias.forEach((media) => {
        const filePath = path.join(__dirname, "../../../", media);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Erro ao deletar arquivo: ${filePath}`, err);
          }
        });
      });

      if (newImages.length > 0) {
        mediasPaths = newImages.map((image) => image.path);
      } else if (deletePreviousMedia == "1") {
        mediasPaths = [];
      }
    }

    await prisma.post.update({
      where: { post_id: id },
      data: {
        hashtags: {
          set: [],
        },
      },
    });

    await Promise.all(
      hashtagsArray.map(async (hashtag) => {
        await prisma.hashtag.upsert({
          where: { title: hashtag.toLowerCase().replaceAll("#", "") },
          update: {},
          create: { title: hashtag.toLowerCase().replaceAll("#", "") },
        });
      })
    );

    // First, disconnect all existing categories
    await prisma.post.update({
      where: { post_id: id },
      data: {
        categories: {
          set: [],
        },
      },
    });

    // Then, update the post with new data and connect new categories
    const post = await prisma.post.update({
      where: { post_id: id },
      data: {
        text_content,
        medias: mediasPaths,
        last_updated_at: new Date(),
        hashtags: {
          connect: hashtagsArray.map((hashtag) => ({
            title: hashtag.toLowerCase().replaceAll("#", ""),
          })),
        },
        categories: {
          connect: categoriesArray.map((category: string) => ({
            category_id: category,
          })),
        },
      },
      include: { hashtags: true, author: true, categories: true },
    });
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Falha ao editar post" });
  }
};
