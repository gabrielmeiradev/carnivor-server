import { $Enums, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userModelFromToken } from "../../utils/token";
const prisma = new PrismaClient();

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const {
      text,
      hashtags,
      page = 1,
      itemsPerPage = 10,
      categories,
      profileId,
    } = req.query;
    const user = userModelFromToken(req.headers.authorization!);

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Usuário não autenticado.",
      });

      return;
    }

    let filterOnlyAds = false;

    if (user.TipoUser == $Enums.UserType.Anunciante) {
      filterOnlyAds = true;
    }

    console.log(categories);

    const hashtagsArray = hashtags ? (hashtags as string).split(",") : [];
    const categoriesArray = categories ? (categories as string).split(",") : [];
    const pageNumber = parseInt(page as string, 10);
    const itemsCount = parseInt(itemsPerPage as string, 10);

    if (pageNumber < 1) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "O número da página deve ser maior que 0.",
      });
      return;
    }

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: {
          text_content: {
            contains: text as string,
            mode: "insensitive",
          },
          parent_id: null,
          author: {
            IdUser: {
              equals: filterOnlyAds
                ? user.IdUser
                : profileId
                ? (profileId as string)
                : undefined,
            },
            UserAtivo: true,
            TipoUser: {
              equals: filterOnlyAds ? $Enums.UserType.Anunciante : undefined,
            },
          },
          AND: [
            hashtagsArray.length > 0
              ? {
                  hashtags: {
                    some: {
                      title: {
                        in: hashtagsArray,
                      },
                    },
                  },
                }
              : {},
            categoriesArray.length > 0
              ? {
                  categories: {
                    some: {
                      category_id: {
                        in: categoriesArray,
                      },
                    },
                  },
                }
              : {},
          ],
        },
        include: {
          hashtags: {
            select: {
              title: true,
            },
          },
          categories: true,
          author: {
            select: {
              Senha: false,
              Login: true,
              Nome: true,
              TipoUser: true,
              ProfileImage: true,
              IdUser: true,
            },
          },
          likes: {
            select: {
              user_id: true,
            },
          },
        },
        skip: (pageNumber - 1) * itemsCount,
        take: itemsCount,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.post.count({
        where: {
          text_content: {
            contains: text as string,
            mode: "insensitive",
          },
          AND: [
            hashtagsArray.length > 0
              ? {
                  hashtags: {
                    some: {
                      title: {
                        in: hashtagsArray,
                      },
                    },
                  },
                }
              : {},
            categoriesArray.length > 0
              ? {
                  categories: {
                    some: {
                      category_id: {
                        in: categoriesArray,
                      },
                    },
                  },
                }
              : {},
          ],
        },
      }),
    ]);

    let userToSend;

    if (profileId) {
      userToSend = await prisma.user.findUnique({
        where: {
          IdUser: profileId as string,
        },
        select: {
          Senha: false,
          Login: true,
          Nome: true,
          TipoUser: true,
          ProfileImage: true,
          IdUser: true,
        },
      });
    } else {
      const { Senha, ...userWithoutPassword } = user;
      userToSend = userWithoutPassword;
    }

    res.status(StatusCodes.OK).json({
      posts,
      pagination: {
        totalItems: posts.length,
        currentPage: pageNumber,
        itemsPerPage: itemsCount,
        totalPages: Math.ceil(posts.length / itemsCount),
      },
      user: userToSend,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ocorreu um erro ao buscar as postagens.",
    });
  }
};
