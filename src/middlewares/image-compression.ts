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

    for (const file of files) {
      const outputPath = path.resolve(
        process.cwd(),
        "uploads",
        "compressed",
        file.filename
      );

      await sharp(file.path).jpeg({ quality: 60 }).toFile(outputPath);

      // Remove original
      fs.unlinkSync(file.path);

      // Build updated file object
      const compressedFile: Express.Multer.File = {
        ...file,
        path: outputPath,
        filename: file.filename,
      };

      compressedFiles.push(compressedFile);
    }

    // Replace req.files with compressed versions
    req.files = compressedFiles;
    next();
  } catch (err) {
    next(err);
  }
};
