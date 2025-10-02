import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { config } from '../config/config.js';
import type { UploadDTO } from '../dtos/uploadDtos.js';


cloudinary.config({
    cloud_name: config.cloudinary.cloudName!,
    api_key: config.cloudinary.apiKey!,
    api_secret: config.cloudinary.secret!,
    secure: true,
});

export const uploadFile = async (path: string) => {
    const res = await cloudinary.uploader.upload(path, {
        folder: "imagevault",
    });
    fs.unlinkSync(path);
    return res;
}

export const uploadMultipleFile = async (titles: string[], files: Express.Multer.File[], userId: string, position: number): Promise<UploadDTO[]> => {
    const uploadResults: UploadDTO[] = await Promise.all(
        files.map(async (file, index) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "imagevault",
            });
            
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            return {
                userId: userId,
                title: titles[index] as string,
                url: result.secure_url,
                publicId: result.public_id,
                position: position++
            };
        })
    );

    return uploadResults;
}

export const destroyFile = async (imageId: string) => {
    return await cloudinary.uploader.destroy(imageId, { type: "authenticated" });
}

export default cloudinary;