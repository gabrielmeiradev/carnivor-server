import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const compressImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files || !Array.isArray(req.files)) return next();

  const files = req.files as Express.Multer.File[];

  try {
    const compressedFiles: Express.Multer.File[] = [];

    const compressedFolder = path.join("uploads", "compressed");

    if (!fs.existsSync(compressedFolder)) {
      fs.mkdirSync(compressedFolder, { recursive: true });
    }

    for (const file of files) {
      const outputPath = path.join(compressedFolder, file.filename);

      await sharp(file.path).jpeg({ quality: 60 }).toFile(outputPath);

      fs.unlinkSync(file.path);

      const compressedFile: Express.Multer.File = {
        ...file,
        path: outputPath,
        filename: file.filename,
      };

      compressedFiles.push(compressedFile);
    }

    req.files = compressedFiles;

    next();
  } catch (err) {
    next(err);
  }
};
