import crypto from 'crypto'

const ENC_KEY = process.env.ENC_KEY;

if(!ENC_KEY){
    console.error("🔴 FATAL ERROR: ENC_KEY is not defined in the .env file.");
    process.exit(1);
}
const IV = Buffer.alloc(16,0)

const encryption =(token: string)=>{
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENC_KEY), IV);
    let encrypted = cipher.update(token,'utf8','hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
const decryption =(token:string) =>{
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENC_KEY), IV);
    let decrypted = decipher.update(token,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export { encryption, decryption}

