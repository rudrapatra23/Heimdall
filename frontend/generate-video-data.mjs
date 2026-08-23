import fs from 'fs';
import path from 'path';

const mp4Path = path.join(process.cwd(), 'src/assets/heimdall-phone.mp4');
const webmPath = path.join(process.cwd(), 'src/assets/heimdall-phone.webm');

const mp4Base64 = fs.readFileSync(mp4Path).toString('base64');
const webmBase64 = fs.readFileSync(webmPath).toString('base64');

const content = `// Auto-generated self-contained base64 video data for 100% instant autoplay
export const phoneVideoMp4 = "data:video/mp4;base64,${mp4Base64}";
export const phoneVideoWebm = "data:video/webm;base64,${webmBase64}";
`;

fs.writeFileSync(path.join(process.cwd(), 'src/assets/videoData.ts'), content);
console.log('Successfully generated videoData.ts');
