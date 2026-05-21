import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  async uploadToOSS(file: Express.Multer.File): Promise<string> {
    // TODO: 接入阿里云OSS
    // const OSS = require('ali-oss');
    // const client = new OSS({...});
    // const result = await client.put(filename, file.buffer);
    // return result.url;

    // MVP: 返回模拟URL
    const ext = file.originalname.split('.').pop();
    return `https://yediao-app.oss-cn-hangzhou.aliyuncs.com/mock/${Date.now()}.${ext}`;
  }
}
