import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import {ConfigService} from "@nestjs/config";
import {ConfigEnum} from "~/config/main-config";
import {AuthConfig} from "~/config/auth.config";

export class EncryptionService {
  private encryptionKey: Buffer; // Ключ должен быть длиной 32 байта для AES-256
  private ivLength = 16; // Длина IV для AES-256-CBC составляет 16 байт

  constructor(
    private configService: ConfigService
  ) {
    const key = configService.get<AuthConfig>(ConfigEnum.AUTH).encryptionKey
    this.encryptionKey = Buffer.from(key, 'hex'); // Пример получения ключа из переменных окружения
  }

 public encrypt(text: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Возвращаем IV и зашифрованный текст в формате hex, разделенные двоеточием
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
}
