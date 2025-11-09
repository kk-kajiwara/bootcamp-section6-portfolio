# ポートフォリオサイト（管理画面付き）

## 1. プロジェクト概要

プロフィール・スキル・実績を管理・公開できる **ポートフォリオサイト**
です。\
管理画面では認証済みユーザーのみが編集でき、公開画面では誰でもプロフィールや実績を閲覧できます。

**目的** -
自分のプロフィール・スキル・実績を整理し、第三者に公開できる形で提供する\

- 認証・認可を実装し、安全に管理画面を運用できる仕組みを学ぶ

**技術選定の理由**

- **Next.js**: フロントエンドでの高速なページレンダリングと、App Router による最新構成の採用
- **Express.js**: 軽量かつシンプルで柔軟なバックエンド API 実装を実現
- **MySQL + Prisma**: 安定したリレーショナルデータベースと、型安全な ORM による効率的な開発
- **Docker**: 開発環境をコードで再現可能にし、チーム/本番環境との差異を最小化

---

**開発の優先順位**

1. **認証機能**: Firebase Authentication を利用し、管理画面へのアクセス制御を実現
2. **環境構築**: Docker による API + DB、Next.js フロントを統合
3. **バックエンド**: Express + Prisma による API 実装（プロフィール・スキル・実績・問い合わせ管理）
4. **フロントエンド**: 公開ページと管理画面の UI 実装

---

**スケジュール見積**

- DAY 1: 認証機能 (Firebase Auth, Cookie 管理)、環境構築 (Next.js, Express, MySQL, Docker, Prisma)
- DAY 2: バックエンド API 実装 (CRUD: プロフィール / スキル / プロジェクト / 問い合わせ)
- DAY 3: フロントエンド UI 実装 (公開画面・管理画面)、テスト導入と品質強化 (Vitest)
- DAY 4: README.md 作成（まとめ）

---

## 2. 技術スタック

- **フロントエンド**: Next.js (App Router, TypeScript, TailwindCSS)\(http://localhost:3000)
- **バックエンド**: Express.js (TypeScript)\http://localhost:4000`
- **ORM / DB**: Prisma + MySQL (Docker)\
- **認証**: Firebase Authentication (email/password, Admin SDK)\
- **インフラ**: Docker Compose\
- **その他**: Vitest

## 3. 環境構築手順

### 前提条件

- Node.js v20+\
- Docker & Docker Compose\
- Firebase プロジェクト

### セットアップ

```bash
# 依存関係インストール
npm install

# DB マイグレーション
npx prisma migrate dev

# 開発環境起動
docker compose up -d
npm run dev
```

## 4. 環境変数

`.env` に以下を定義してください：

---

変数名 説明

---

`DATABASE_URL` MySQL 接続文字列

`SHADOW_DATABASE_URL` Prisma 用シャドウ DB

`ADMIN_UID` Firebase 管理ユーザー UID

`INTERNAL_API_KEY` BFF
からバックエンドを呼ぶ内部キー

`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / Firebase Admin SDK 用
`FIREBASE_PRIVATE_KEY`

---

## 5. 起動方法

### 開発環境

```bash
npm run dev
```

### 本番ビルド

vitest（ユニットテスト）

```bash
npm run build
npm start
```

### テスト

実行方法:

```bash
npm run test
```

## 6. 機能一覧

- **公開画面**
  - プロフィール表示
  - スキル一覧
  - 実績一覧
  - 問い合わせフォーム
- **管理画面（認証必須）**
  - プロフィール CRUD
  - スキル CRUD
  - 実績 CRUD
  - 問い合わせ一覧（対応済み/未対応の切替, 削除）

## 7.ドキュメント目次

- [API 設計書](api.md)
- [DB 設計書](db.md)
- [バックエンド設計書](backend.md)
- [フロントエンド設計書](frontend.md)
- [認証設計書](auth.md)
- [テストシナリオ](test_scenarios.md)
