import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'パスキー認証デモ',
  description: 'WebAuthn APIを使用したパスキー認証の最小構成デモ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
