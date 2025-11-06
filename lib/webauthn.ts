import type { User } from '@/types/webauthn';

// RPの情報（Relying Party = あなたのサービス）
export const rpName = 'Passkey Demo';
export const rpID = 'localhost';
export const origin = `http://${rpID}:3000`;

// ユーザーとクレデンシャルを保存する簡易データベース（本番環境では実際のDBを使用）
export const users = new Map<string, User>();
export const challenges = new Map<string, string>();
