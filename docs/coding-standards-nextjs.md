# Next.js コーディング規約

## 1. 基本原則

### 1.1 TypeScript の活用

- できる限り TypeScript を使用してコードの型安全性を確保する
- `any` 型の使用は可能な限り避ける
- 適切なインターフェースと型定義を作成する

### 1.2 日本語対応

- コメントやドキュメンテーションは日本語で記述可
- UI テキストは国際化のためのキーを使用 (i18n)

### 1.3 コードフォーマット

- インデントには 2 つのスペースを使用
- 行の長さは 100 文字以内に収める（横スクロールを避ける）
- ESLint と Prettier を使用して一貫したコードスタイルを維持する

## 2. ディレクトリ構造

### 2.1 App Router プロジェクト構造

```
src/
  ├── app/             # Next.js アプリケーションルーター
  │   ├── api/         # API Routes
  │   ├── layout.tsx   # ルートレイアウト
  │   ├── page.tsx     # インデックスページ
  │   └── [route]/     # 動的ルート
  ├── components/      # 再利用可能なコンポーネント
  │   ├── ui/          # 基本的なUI要素
  │   └── features/    # 機能特化コンポーネント
  ├── hooks/           # カスタムフック
  ├── lib/             # ユーティリティ関数、ヘルパー
  ├── types/           # TypeScript の型定義
  ├── styles/          # グローバルスタイル
  └── theme.ts         # テーマ設定
```

### 2.2 ファイル命名規則

- コンポーネント: パスカルケース (例: `Button.tsx`, `ArticleCard.tsx`)
- ページ: `page.tsx`
- レイアウト: `layout.tsx`
- フック: キャメルケースで `use` プレフィックス (例: `useAuth.ts`)
- ユーティリティ: キャメルケース (例: `formatDate.ts`)

## 3. コンポーネント設計

### 3.1 コンポーネント構造

- コンポーネントの先頭に `'use client'` ディレクティブを明示（クライアントコンポーネントの場合）
- props の型定義はコンポーネントの直前に書く
- コンポーネントのプロパティ順序:
  1. `'use client'` ディレクティブ（必要な場合）
  2. imports
  3. 型定義
  4. カスタムフック（コンポーネント内で定義する場合）
  5. コンポーネント関数
  6. エクスポート

```tsx
"use client";

import { useState } from "react";
import { Button } from "@mantine/core";

interface ExampleProps {
  title: string;
  description?: string;
}

export function Example({ title, description }: ExampleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <Button onClick={() => setIsOpen(!isOpen)}>詳細を表示</Button>
    </div>
  );
}
```

### 3.2 Server Components と Client Components

- デフォルトでは Server Components を使用
- インタラクティブ性が必要な場合のみ `'use client'` を使用
- Client/Server コンポーネントを適切に分離し、パフォーマンスを最適化

## 4. 状態管理

### 4.1 ローカル状態

- コンポーネントのローカル状態には React の `useState` を使用
- 複雑な状態には `useReducer` を検討

### 4.2 グローバル状態

- Context API を使用して状態を共有
- 大規模アプリケーションでは React Query などの状態管理ツールの使用を検討

```tsx
// AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // ...実装...

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

## 5. スタイリング

### 5.1 CSS モジュール

- コンポーネント固有のスタイルには CSS Modules を使用
- グローバルスタイルは `globals.css` に定義

### 5.2 Mantine 利用規約

- Mantine コンポーネントは一貫性のある見た目のために利用する
- カスタムスタイルはテーマを通じて行い、直接のハードコーディングを避ける
- レスポンシブデザインには Mantine のブレークポイントシステムを利用する

```tsx
import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "blue",
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
```

## 6. データフェッチング

### 6.1 Server Components でのデータ取得

- Server Components ではフェッチ関数を直接記述
- React Query などの状態管理なしでサーバー上でデータを取得

```tsx
// app/articles/page.tsx
export default async function ArticlesPage() {
  const articles = await fetchArticles();

  return (
    <div>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

### 6.2 Client Components でのデータ取得

- API クライアントとしては axios を使用
- データ取得ロジックをカスタムフックに抽象化

```tsx
// hooks/useArticles.ts
"use client";

import { useState, useEffect } from "react";
import axiosClient from "../lib/axios";
import type { Article } from "../types";

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosClient.get("/api/articles");
        setArticles(response.data);
      } catch (err) {
        setError("記事の取得に失敗しました");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { articles, loading, error };
}
```

## 7. ルーティングとナビゲーション

### 7.1 App Router

- App Router を使用したルーティングを実装
- 動的ルートには適切なセグメントパラメータを使用

```
app/
  ├── page.tsx              # /
  ├── articles/
  │   ├── page.tsx          # /articles
  │   └── [slug]/
  │       └── page.tsx      # /articles/[slug]
  ├── categories/
  │   └── [id]/
  │       └── page.tsx      # /categories/[id]
  └── layout.tsx            # 共通レイアウト
```

### 7.2 ナビゲーション

- ページ間のリンクには `next/link` の `Link` コンポーネントを使用
- プログラムによるナビゲーションには `useRouter` フックを使用

```tsx
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navigation() {
  const router = useRouter();

  return (
    <nav>
      <Link href="/">ホーム</Link>
      <Link href="/articles">記事一覧</Link>
      <button onClick={() => router.push("/dashboard")}>
        ダッシュボードへ
      </button>
    </nav>
  );
}
```

## 8. フォーム処理

### 8.1 フォームバリデーション

- Mantine Form を使用してフォームのバリデーションを行う
- エラーメッセージは日本語で適切に表示

```tsx
"use client";

import { useForm } from "@mantine/form";
import { TextInput, Button, Group, Box } from "@mantine/core";

export function ContactForm() {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validate: {
      name: (value) => (value ? null : "名前は必須項目です"),
      email: (value) =>
        /^\S+@\S+$/.test(value)
          ? null
          : "有効なメールアドレスを入力してください",
      message: (value) =>
        value.length > 10 ? null : "メッセージは10文字以上で入力してください",
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    // 送信処理
    console.log(values);
  });

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={handleSubmit}>
        <TextInput
          withAsterisk
          label="名前"
          placeholder="山田太郎"
          {...form.getInputProps("name")}
        />

        <TextInput
          withAsterisk
          label="メールアドレス"
          placeholder="your@email.com"
          mt="md"
          {...form.getInputProps("email")}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit">送信</Button>
        </Group>
      </form>
    </Box>
  );
}
```

### 8.2 フォーム送信

- フォーム送信には適切なエラーハンドリングを実装
- 送信中の状態をユーザーに表示（ローディング表示）

## 9. エラー処理

### 9.1 エラーバウンダリー

- エラーバウンダリーを使用して UI の崩壊を防止
- 開発環境ではエラー詳細を表示、本番環境ではユーザーフレンドリーなメッセージを表示

### 9.2 API エラー処理

- API レスポンスは一貫した形式でエラー処理
- エラーメッセージはユーザーフレンドリーかつ具体的に

```tsx
try {
  const response = await axiosClient.post("/api/articles", articleData);
  // 成功処理
} catch (error) {
  if (axios.isAxiosError(error) && error.response) {
    // APIからのエラーレスポンスを処理
    const errorMessage =
      error.response.data.message || "記事の保存中にエラーが発生しました";
    notifications.show({
      color: "red",
      title: "エラー",
      message: errorMessage,
    });
  } else {
    // その他のエラー
    notifications.show({
      color: "red",
      title: "エラー",
      message: "予期しないエラーが発生しました",
    });
  }
}
```

## 10. テスト

### 10.1 テストの分類

- ユニットテスト: 個々の関数やコンポーネント
- インテグレーションテスト: 複数のコンポーネントの連携
- E2E テスト: ユーザーフローの全体

### 10.2 テスト命名規則

- テストファイル名はテスト対象のファイル名に `.test` や `.spec` を追加
- テスト内容は具体的な機能と期待結果を表す

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button コンポーネント", () => {
  test("クリックされたときにonClickハンドラーが呼ばれる", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);

    fireEvent.click(screen.getByText("クリック"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 11. パフォーマンス最適化

### 11.1 メモ化

- 不要な再レンダリングを避けるために `React.memo`、`useMemo`、`useCallback` を使用
- メモ化は必要な場合にのみ使用し、過度な使用は避ける

```tsx
"use client";

import { memo } from "react";

interface ExpensiveComponentProps {
  data: string;
}

// 親コンポーネントが再レンダリングされても、
// props が変更されない限り、このコンポーネントは再レンダリングされない
export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
}: ExpensiveComponentProps) {
  return <div>{data}</div>;
});
```

### 11.2 画像最適化

- 画像には必ず Next.js の `Image` コンポーネントを使用
- 適切なサイズと形式で画像を提供

```tsx
import Image from "next/image";

export function ProfileImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={300}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/png;base64,..."
    />
  );
}
```

## 12. セキュリティ対策

### 12.1 XSS 対策

- ユーザー入力データを表示する際は適切にエスケープ
- 動的な HTML 生成には `dangerouslySetInnerHTML` の使用を最小限にする

### 12.2 認証・認可

- 認証状態は適切に管理
- 保護されたルートには認証チェックを実装

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : null;
}
```

## 13. アクセシビリティ

### 13.1 セマンティック HTML

- 適切な HTML 要素を使用（見出しレベルや `button` と `a` の区別など）
- WAI-ARIA 属性を適切に使用

### 13.2 キーボードナビゲーション

- すべてのインタラクティブ要素がキーボードでアクセス可能であることを確認
- フォーカス状態のスタイルを適切に設定

```tsx
"use client";

import { useState } from "react";

export function AccessibleDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        メニューを開く
      </button>

      {isOpen && (
        <ul id="dropdown-menu" role="menu">
          <li role="menuitem">
            <a href="/page1">ページ1</a>
          </li>
          <li role="menuitem">
            <a href="/page2">ページ2</a>
          </li>
        </ul>
      )}
    </div>
  );
}
```

## 14. 国際化 (i18n)

### 14.1 テキストの国際化

- すべての UI テキストは国際化キーを使用
- 翻訳データは言語ファイルに集約

### 14.2 日付と数値の国際化

- 日付や数値の表示には `Intl` API を使用

```tsx
// 日付のフォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// 通貨のフォーマット
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
};
```

---

この規約は現在のプロジェクトの状態を基にしていますが、チームの合意によって継続的に改善していくべきです。規約は開発効率と品質向上のためのものであり、融通の利かない制約ではなく、ガイドラインとして捉えるのがよいでしょう。
