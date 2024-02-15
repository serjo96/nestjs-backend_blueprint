import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
import {ConfigService} from "@nestjs/config";
import {ConfigEnum} from "~/config/main-config";
import {AuthConfig} from "~/config/auth.config";
import {Injectable} from "@nestjs/common";

@Injectable()
export class EncryptionService {
  // The key must be 32 bytes long for AES-256
  private readonly encryptionKey: Buffer;
  // IV length for AES-256-CBC is 16 bytes
  private ivLength = 16;

  constructor(
    private configService: ConfigService
  ) {
    const key = configService.get<AuthConfig>(ConfigEnum.AUTH).encryptionKey
    this.encryptionKey = Buffer.from(key, 'hex');
  }

 public encrypt(text: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return IV and ciphertext in hex format, separated by colon
    return iv.toString('hex') + ':' + encrypted;
  }

  public decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public createHash(text: string) {
    return createHash('sha256').update(text).digest('hex');
  }

  public generateToken(text: string): string {
    const uniqueData = text + randomBytes(16).toString('hex');
    return createHash('sha256').update(uniqueData).digest('hex');
  }
}
