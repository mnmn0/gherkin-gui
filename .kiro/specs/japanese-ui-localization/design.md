# Design Document

## Overview

このアプリケーションの全てのUI要素を日本語に翻訳する機能の設計です。Electron + React + TypeScriptで構築されたアプリケーションにおいて、i18n（国際化）システムを導入せず、全てのテキストを日本語に固定します。

## Architecture

### 翻訳対象の特定

アプリケーション構造の分析により、以下の箇所で日本語化が必要です：

1. **メインプロセス（Electron）**
   - `src/main/menu.ts` - アプリケーションメニュー

2. **レンダラープロセス（React）**
   - ナビゲーション（`src/renderer/components/Layout/NavigationSidebar.tsx`）
   - ページコンポーネント（`src/renderer/components/Pages/`）
   - 共通コンポーネント（`src/renderer/components/Common/`）
   - 機能別コンポーネント（CodeGeneration, TestExecution, Specifications, Reports, Settings）

### 翻訳アプローチ

i18nライブラリを使用せず、直接的な文字列置換を行います：

- ハードコードされた英語文字列を日本語に置換
- インターフェース定義の更新
- エラーメッセージとステータステキストの日本語化
- ツールチップとヘルプテキストの日本語化

## Components and Interfaces

### 1. メニューシステム（Electron）

**ファイル**: `src/main/menu.ts`

**変更内容**:
- macOS用メニュー（Darwin）の日本語化
- Windows/Linux用メニュー（Default）の日本語化
- ショートカットキーは維持

### 2. ナビゲーションサイドバー

**ファイル**: `src/renderer/components/Layout/NavigationSidebar.tsx`

**変更内容**:
- ナビゲーション項目のラベルと説明を日本語化
- アプリケーションタイトルの日本語化
- プロジェクト情報の日本語化

**翻訳マッピング**:
```typescript
const navigationItems = [
  { label: '仕様書', description: 'Gherkinテスト仕様書の管理' },
  { label: 'コード生成', description: 'JUnitテストコードの生成' },
  { label: 'テスト実行', description: 'テストの実行と監視' },
  { label: 'レポート', description: 'テストレポートと分析の表示' },
  { label: '設定', description: 'プロジェクト設定と構成' }
];
```

### 3. ページコンポーネント

#### 3.1 コード生成ページ
**ファイル**: `src/renderer/components/Pages/CodeGenerationPage.tsx`

**変更内容**:
- ページタイトル: "Code Generation" → "コード生成"
- 説明文: "Generate JUnit test code from Gherkin specifications" → "Gherkin仕様書からJUnitテストコードを生成"
- エラーメッセージの日本語化

#### 3.2 テスト実行ページ
**ファイル**: `src/renderer/components/Pages/TestExecutionPage.tsx`

**変更内容**:
- ページタイトル: "Test Execution" → "テスト実行"
- 説明文: "Run and monitor test executions" → "テストの実行と監視"
- タブラベル: "Test Runner" → "テスト実行", "Monitor" → "監視"

#### 3.3 仕様書ページ
**ファイル**: `src/renderer/components/Pages/SpecificationsPage.tsx`

**変更内容**:
- ページタイトル: "Test Specifications" → "テスト仕様書"
- 説明文: "Manage your Gherkin test specifications" → "Gherkinテスト仕様書の管理"

### 4. 共通コンポーネント

#### 4.1 確認ダイアログ
**ファイル**: `src/renderer/components/Common/ConfirmDialog.tsx`

**変更内容**:
- デフォルトボタンテキスト: "Confirm" → "確認", "Cancel" → "キャンセル"

#### 4.2 ローディングスピナー
**ファイル**: `src/renderer/components/Common/LoadingSpinner.tsx`

**変更内容**:
- ローディングテキストの日本語化対応

### 5. 機能別コンポーネント

各機能別コンポーネント内の以下の要素を日本語化：

- ボタンテキスト
- フォームラベル
- プレースホルダーテキスト
- ステータスメッセージ
- エラーメッセージ
- 成功メッセージ

## Data Models

### 翻訳対象テキストの分類

```typescript
interface UITexts {
  // ナビゲーション
  navigation: {
    specifications: string;
    codeGeneration: string;
    testExecution: string;
    reports: string;
    settings: string;
  };
  
  // 共通アクション
  actions: {
    save: string;
    cancel: string;
    delete: string;
    create: string;
    edit: string;
    confirm: string;
    back: string;
  };
  
  // ステータス
  status: {
    loading: string;
    success: string;
    error: string;
    completed: string;
    running: string;
    cancelled: string;
  };
  
  // エラーメッセージ
  errors: {
    failedToLoad: string;
    failedToSave: string;
    failedToDelete: string;
    failedToExecute: string;
  };
}
```

## Error Handling

### エラーメッセージの日本語化

**パターン**:
- "Failed to load X" → "Xの読み込みに失敗しました"
- "Failed to save X" → "Xの保存に失敗しました"
- "Failed to delete X" → "Xの削除に失敗しました"
- "Failed to execute X" → "Xの実行に失敗しました"

### エラー表示の改善

- エラーメッセージの表示形式を日本語に適した形に調整
- 技術的なエラー詳細は英語のまま保持（デバッグ用）

## Testing Strategy

### テスト対象

1. **表示テスト**
   - 全ページで日本語テキストが正しく表示される
   - レイアウトが崩れない
   - 長い日本語テキストが適切に処理される

2. **機能テスト**
   - 日本語化後も全ての機能が正常に動作する
   - エラーメッセージが適切に表示される
   - ダイアログとトーストが正しく動作する

3. **レスポンシブテスト**
   - 日本語テキストが異なる画面サイズで適切に表示される
   - テキストの折り返しが正しく動作する

### テスト手法

- 各コンポーネントの単体テスト更新
- 統合テストでの日本語表示確認
- 手動テストによるUI/UX確認

## Implementation Considerations

### フォント対応

- 日本語フォントの適切な表示確保
- フォールバックフォントの設定

### レイアウト調整

- 日本語テキストの長さに応じたレイアウト調整
- ボタンサイズの自動調整
- テキスト折り返しの最適化

### パフォーマンス

- 文字列の直接置換のため、パフォーマンスへの影響は最小限
- バンドルサイズの増加も軽微

### 保守性

- 将来的にi18n対応が必要になった場合の移行パスを考慮
- 翻訳テキストの一元管理は行わず、各コンポーネントで直接管理
