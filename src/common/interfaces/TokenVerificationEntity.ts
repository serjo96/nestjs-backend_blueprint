export interface TokenVerificationEntity {
  token: string;
  expirationDate: Date;
  attempts: number;
  lastAttemptDate: Date | null;
}
