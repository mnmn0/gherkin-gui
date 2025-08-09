# Spring Boot Test GUI - Claude Development Guide

## プロジェクト概要

Spring Boot Test GUIは、Gherkin形式でテスト仕様を記述し、Spring Bootテストコードを自動生成・実行できるElectronベースのデスクトップアプリケーションです。

## 技術スタック

- **フロントエンド**: React 19, TypeScript, Electron 35
- **バックエンド**: Node.js, Electron Main Process
- **ビルドツール**: Webpack 5, npm
- **テスト**: Jest, Testing Library
- **CI/CD**: GitHub Actions

## アーキテクチャ

### プロセス構成
- **Main Process** (`src/main/`): ファイル操作、Java実行、IPC管理
- **Renderer Process** (`src/renderer/`): React UI、ユーザーインターフェース
- **Preload Script** (`src/main/preload.ts`): セキュアなIPC通信層

### ディレクトリ構造
```
src/
├── main/
│   ├── services/           # コアビジネスロジック
│   ├── types/             # TypeScript型定義
│   └── utils/             # ユーティリティ
├── renderer/
│   ├── components/        # Reactコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── services/         # フロントエンドサービス
│   └── types/            # レンダラー型定義
└── __tests__/            # テストファイル
```

## 開発コマンド

### 基本コマンド
```bash
# 依存関係インストール
npm install

# 開発環境起動
npm start

# ビルド
npm run build

# テスト実行
npm test

# リント実行
npm run lint

# リント修正
npm run lint:fix
```

### 専用コマンド
```bash
# DLLビルド（依存関係の事前コンパイル）
npm run build:dll

# メインプロセスのみビルド
npm run build:main

# レンダラープロセスのみビルド
npm run build:renderer
```

## IPC通信

### 型安全なIPC設計
`src/main/types/ipc.ts`でチャンネルとイベントの型を定義：

```typescript
interface IpcChannels {
  'file:list-specs': { request: void; response: SpecificationFile[] };
  'code:generate': { request: { specContent: string; config: GenerationConfig }; response: string };
}

interface IpcEvents {
  'execution:progress': ExecutionProgress;
  'file:changed': { filePath: string; changeType: 'created' | 'modified' | 'deleted' };
}
```

### 使用例
```typescript
// レンダラーサイド
const specs = await window.electron.invoke('file:list-specs', undefined);

// イベントリスナー
const unsubscribe = window.electron.on('execution:progress', (progress) => {
  console.log('Progress:', progress);
});
```

## ファイル管理

### ディレクトリ構造
```
.gherkin/
├── specs/                 # Gherkin仕様ファイル (.feature)
└── reports/              # テストレポート (.json, .html)
```

### ファイル操作サービス
- `FileService`: 仕様ファイルのCRUD操作
- `ReportService`: レポートファイルの管理
- `FileWatcher`: ファイル変更の監視

## コード生成

### テンプレートシステム
- JUnit 5/4, TestNG, Cucumber対応
- カスタムテンプレート作成可能
- Spring Boot アノテーション自動生成

### 設定例
```typescript
const config: GenerationConfig = {
  template: 'junit5-spring-boot',
  testClass: 'UserServiceTest',
  packageName: 'com.example.test',
  springBootVersion: '3.2.0',
  annotations: ['@SpringBootTest', '@Transactional']
};
```

## 既知の問題と解決方法

### Webpack DLL ビルドエラー
**問題**: `@types/*` パッケージの解決エラー
```
ERROR in dll renderer renderer[1]
Module not found: Error: Can't resolve '@types/react-router-dom'
```

**解決方法**: `.erb/configs/webpack.config.renderer.dev.dll.ts`で@types/*パッケージを除外
```typescript
entry: {
  renderer: Object.keys(dependencies || {}).filter(
    (dependency) => !dependency.startsWith('@types/')
  ),
}
```

### IPC初期化エラー
**問題**: `Cannot read properties of undefined (reading 'once')`
**解決方法**: 
1. 古いIPCサンプルコードを削除
2. `src/renderer/types/global.d.ts`で型定義を追加

## テスト戦略

### ユニットテスト
- サービス層の完全テストカバレッジ
- コンポーネント単体テスト
- IPC通信のモックテスト

### インテグレーションテスト
- ファイル操作の統合テスト
- コード生成パイプラインテスト

### E2Eテスト
- 完全ワークフローテスト（仕様作成→コード生成→テスト実行→レポート確認）

## CI/CD

### GitHub Actions設定
- 複数OS対応（Windows, macOS, Ubuntu）
- 自動テスト実行
- ビルド成果物の生成

### ビルド時の注意点
- `npm run build:dll`の実行が必要
- TypeScriptの型チェックを有効化
- セキュリティ設定（CSP、contextIsolation）

## パフォーマンス最適化

### DLL事前コンパイル
依存関係を事前コンパイルして開発時のビルド速度を向上

### コード分割
Electronの特性を活かしたプロセス分離とリソース最適化

## セキュリティ

### Electron セキュリティ
- `contextIsolation: true`
- `nodeIntegration: false` 
- preloadスクリプトによる安全なAPI公開

### ファイルアクセス制御
- 指定ディレクトリ以外へのアクセス制限
- 実行可能ファイルの検証

## トラブルシューティング

### 開発環境でのポートエラー
```bash
# ポート1212が使用中の場合
lsof -ti:1212 | xargs -r kill -9
npm start
```

### ビルドエラー時の対処
```bash
# node_modules再インストール
rm -rf node_modules package-lock.json
npm install

# DLL再ビルド
npm run build:dll
```

## 今後の拡張予定

1. **追加言語サポート**: Kotlin, Scala テスト生成
2. **CI/CD統合**: Jenkins, GitLab CI との連携
3. **レポート機能強化**: カスタムレポート形式
4. **プラグインシステム**: サードパーティ統合

## 開発ガイドライン

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正  
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加・修正
chore: ツール・設定変更
```

### PRの作成
1. 機能ブランチから作成
2. CIが全て通過していることを確認
3. 詳細な説明とテスト手順を記載

---

**最終更新**: 2025-08-09  
**バージョン**: 1.0.0  
**開発者**: Claude AI Assistant