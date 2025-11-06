# パスキー認証を試す (Next.js + TypeScript)

WebAuthn APIを使用したパスキー認証のデモアプリ

## 必要な環境

- Node.js 18以上
- pnpm 8以上
- 対応ブラウザ（Chrome、Safari、Edge、Firefoxの最新版）
- HTTPS環境（ただしlocalhostではhttpでも可）

## セットアップ

1. 依存パッケージをインストール:
```bash
pnpm install
```

2. 開発サーバーを起動:
```bash
pnpm dev
```

3. ブラウザで開く:
```
http://localhost:3000
```

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **パッケージマネージャー**: pnpm
- **WebAuthn**: @simplewebauthn/server, @simplewebauthn/browser
- **スタイリング**: CSS Modules
- **認証方式**: FIDO2/WebAuthn (パスキー)
