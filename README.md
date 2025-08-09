# Spring Boot Test GUI

GherkinフォーマットでテストケースをGUIで作成・管理し、Spring Bootのテストコードを自動生成・実行するデスクトップアプリケーション

## 概要

Spring Boot Test GUIは、BDD（振る舞い駆動開発）アプローチをSpring Bootプロジェクトに簡単に導入できるElectronベースのデスクトップアプリケーションです。Gherkin形式でテスト仕様を記述し、自動的にJavaテストコードを生成して実行できます。

### 主な機能

- 📝 **Gherkin仕様の作成・編集**: 直感的なGUIでGherkin形式のテスト仕様を作成
- 🚀 **テストコード自動生成**: JUnit 5/4、TestNG、Cucumberに対応したテストコード生成
- ▶️ **テスト実行**: 生成したテストコードをGUIから直接実行
- 📊 **レポート表示**: テスト結果をHTML/JSONフォーマットで確認
- 🔄 **リアルタイム同期**: ファイル変更を自動検知してUIに反映

## 技術スタック

- **フロントエンド**: React 19, TypeScript, Material-UI
- **バックエンド**: Electron 35, Node.js
- **ビルドツール**: Webpack 5, npm
- **テスト**: Jest, React Testing Library

## システム要件

- Node.js 18.0以上
- npm 8.0以上
- Java 11以上（テスト実行時）
- 対応OS: Windows 10+, macOS 10.15+, Ubuntu 20.04+

## インストール

### リポジトリのクローンと依存関係のインストール

```bash
git clone https://github.com/yourusername/gherkin-gui.git
cd gherkin-gui
npm install
```

### DLLビルド（初回のみ必要）

```bash
npm run build:dll
```

## 使い方

### 開発環境での起動

```bash
npm start
```

### 本番用ビルド

```bash
npm run build
npm run package
```

### テストの実行

```bash
# ユニットテスト
npm test

# テストカバレッジ
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

### リント

```bash
# リント実行
npm run lint

# リント自動修正
npm run lint:fix
```

## プロジェクト構造

```
gherkin-gui/
├── src/
│   ├── main/                 # Electronメインプロセス
│   │   ├── services/         # ビジネスロジック
│   │   │   ├── FileService.ts        # ファイル操作
│   │   │   ├── CodeGenerationService.ts  # コード生成
│   │   │   └── ExecutionService.ts   # テスト実行
│   │   ├── types/           # TypeScript型定義
│   │   └── preload.ts       # プリロードスクリプト
│   │
│   ├── renderer/            # Reactアプリケーション
│   │   ├── components/      # UIコンポーネント
│   │   │   ├── SpecificationEditor/  # Gherkinエディタ
│   │   │   ├── TestRunner/          # テスト実行UI
│   │   │   └── ReportViewer/        # レポート表示
│   │   ├── hooks/          # カスタムフック
│   │   └── services/       # フロントエンドサービス
│   │
│   └── __tests__/          # テストファイル
│
├── .gherkin/               # アプリケーションデータ
│   ├── specs/             # Gherkin仕様ファイル
│   └── reports/           # テストレポート
│
└── .erb/                  # Electron React Boilerplate設定
```

## 基本的な使用フロー

1. **仕様作成**: GUIでGherkin形式のテスト仕様を作成
2. **コード生成**: テンプレートを選択してJavaテストコードを自動生成
3. **テスト実行**: 生成されたテストコードを実行
4. **結果確認**: HTMLレポートでテスト結果を確認

## テンプレート設定

### 対応テンプレート

- JUnit 5 + Spring Boot
- JUnit 4 + Spring Boot
- TestNG + Spring Boot
- Cucumber + Spring Boot

### カスタム設定例

```typescript
{
  template: 'junit5-spring-boot',
  packageName: 'com.example.test',
  springBootVersion: '3.2.0',
  annotations: ['@SpringBootTest', '@Transactional']
}
```

## トラブルシューティング

### ポートエラー

開発サーバーのポート（1212）が使用中の場合：

```bash
# macOS/Linux
lsof -ti:1212 | xargs kill -9

# Windows
netstat -ano | findstr :1212
taskkill /PID <PID> /F
```

### ビルドエラー

```bash
# クリーンインストール
rm -rf node_modules package-lock.json
npm install
npm run build:dll
```

### Java実行エラー

Javaがインストールされていることを確認：

```bash
java -version
```

## 開発ガイドライン

### コミットメッセージ規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

### ブランチ戦略

- `main`: 本番リリース
- `develop`: 開発ブランチ
- `feature/*`: 機能開発
- `fix/*`: バグ修正
- `docs/*`: ドキュメント

## 貢献

プルリクエストを歓迎します！貢献する前に以下を確認してください：

1. Issueを作成して変更内容を説明
2. フォークしてfeatureブランチを作成
3. テストを追加して全てのテストが通ることを確認
4. プルリクエストを作成

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## サポート

- 🐛 [Issues](https://github.com/yourusername/gherkin-gui/issues): バグ報告・機能要望
- 📖 [Wiki](https://github.com/yourusername/gherkin-gui/wiki): ドキュメント
- 💬 [Discussions](https://github.com/yourusername/gherkin-gui/discussions): 質問・議論

## ロードマップ

- [ ] Kotlin/Scalaテストコード生成サポート
- [ ] CI/CD統合（Jenkins, GitLab CI）
- [ ] プラグインシステム
- [ ] クラウド同期機能
- [ ] AIアシスタント統合

---

**バージョン**: 1.0.0  
**最終更新**: 2025-08-09  
**開発者**: Spring Boot Test GUI Team