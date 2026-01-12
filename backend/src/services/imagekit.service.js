import ImageKit from 'imagekit';
import { v4 as uuidv4 } from 'uuid';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function uploadImage({ buffer }) {
    const res = await imagekit.upload({
        file: buffer,
        fileName: uuidv4(),
        folder: '/GigFlow',
    });
    return {
        url: res.url,
        thumbnail: res.thumbnailUrl || res.url,
        id: res.fileId,
    };
}

export { imagekit };
