# Laravel コーディング規約

## 1. 基本原則

### 1.1 PSR 準拠
- [PSR-1](https://www.php-fig.org/psr/psr-1/)、[PSR-2](https://www.php-fig.org/psr/psr-2/)、[PSR-12](https://www.php-fig.org/psr/psr-12/) に準拠するコードを書く
- 名前空間は `App\` で始める

### 1.2 日本語対応
- コメントやドキュメンテーションは日本語で記述可
- エラーメッセージなどのユーザー向けメッセージも日本語で統一

### 1.3 コードフォーマット
- インデントにはタブではなく4つのスペースを使用
- 80-120文字以内に収める（横スクロールを避ける）

## 2. ファイル構造

### 2.1 名前空間
- コントローラー: `App\Http\Controllers`
- モデル: `App\Models`
- リクエスト: `App\Http\Requests`
- レスポンス: `App\Http\Responses`
- 管理者向けコントローラー: `App\Http\Controllers\Admin`

### 2.2 ファイル命名規則
- コントローラー: 単数形 + `Controller` (例: `ArticleController`)
- モデル: 単数形 (例: `Article`)
- マイグレーション: スネークケースで日付を含む (例: `2025_04_01_000003_create_articles_table`)
- シーダー: 単数形 + `Seeder` (例: `CategorySeeder`)
- ファクトリー: 単数形 + `Factory` (例: `ArticleFactory`) 

## 3. クラス構造

### 3.1 モデル
- プロパティの順序:
  1. `use` ステートメント (trait)
  2. プロパティドキュメンテーション (`@property` PHPDoc)
  3. テーブル名定義 (`$table`)
  4. `$fillable` または `$guarded`
  5. `$casts`
  6. `$hidden` または `$visible`
  7. リレーション定義 (アルファベット順)
  8. スコープメソッド
  9. アクセサとミューテータ
  10. カスタムメソッド

```php
/**
 * クラス名と簡単な説明
 * 
 * 詳細な説明（複数行可）
 * 
 * @property int $id
 * @property string $name フィールド説明
 */
class Example extends Model
{
    use HasFactory;

    protected $fillable = [ /* ... */ ];
    
    protected $casts = [ /* ... */ ];
    
    // リレーション
    public function relation(): BelongsTo
    {
        // ...
    }
    
    // スコープメソッド
    public function scopeActive($query)
    {
        // ...
    }
    
    // アクセサ
    public function getSomeAttributeAttribute()
    {
        // ...
    }
}
```

### 3.2 コントローラー
- メソッド順序：
  1. 標準的なRESTful操作（index, create, store, show, edit, update, destroy）
  2. カスタムアクション

```php
/**
 * コントローラーの目的と提供する機能の簡単な説明
 */
class ExampleController extends Controller
{
    /**
     * メソッドの説明
     *
     * @param RequestType $request
     * @return ResponseType
     */
    public function method(Request $request)
    {
        // ...
    }
}
```

## 4. 命名規則

### 4.1 変数
- キャメルケースを使用 (例: `$articleCount`)
- 意味のある名前を使用（`$a`、`$b` ではなく `$article`、`$category`）
- ブール値はプレフィックス `is_`、`has_`、`can_` などを使用 (例: `$isPublished`)

### 4.2 関数・メソッド
- キャメルケースを使用 (例: `getArticles()`)
- 動詞または動詞句で始める (例: `saveArticle()`, `getCategories()`)

### 4.3 クラス
- パスカルケース（アッパーキャメルケース）を使用 (例: `ArticleController`)

### 4.4 データベース
- テーブル名: スネークケースで複数形 (例: `articles`)
- カラム名: スネークケース (例: `published_at`)
- 主キー: 常に `id`
- 外部キー: 単数形のテーブル名 + `_id` (例: `category_id`)
- ピボットテーブル: 単数形の関連テーブル名をアルファベット順に連結 (例: `article_likes`)

## 5. PHPDoc とコメント

### 5.1 クラスドキュメント
```php
/**
 * クラス名（日本語）
 * 
 * クラスの詳細な説明（日本語）
 * 
 * @property int $id
 * @property string $name プロパティ説明（日本語）
 */
```

### 5.2 メソッドドキュメント
```php
/**
 * メソッドの説明（日本語）
 *
 * @param Type $paramName パラメータの説明
 * @return ReturnType 戻り値の説明
 */
```

### 5.3 インラインコメント
- 複雑なロジックや意図が分かりにくい部分には日本語のコメントを付ける
- コメントは「何をしているか」ではなく「なぜそうしているか」を説明する

```php
// クエリビルダーを開始
$query = Article::with(['category', 'author'])
    ->published()
    ->orderBy('published_at', 'desc');
```

## 6. コントローラー設計

### 6.1 リクエストバリデーション
- 専用のリクエストクラスを使用してバリデーションを行う
- リクエストクラスには日本語のエラーメッセージを設定する

```php
// ArticleStoreRequest.php
public function rules()
{
    return [
        'title' => 'required|string|max:255',
        // ...
    ];
}

public function messages()
{
    return [
        'title.required' => 'タイトルは必須項目です。',
        // ...
    ];
}
```

### 6.2 レスポンス形式
- APIレスポンスは一貫した形式を保つ
- レスポンスヘルパークラスの使用を推奨 (例: `ApiResponse`)

```php
return ApiResponse::success($data, 'メッセージ', $statusCode);
return ApiResponse::error('エラーメッセージ', $statusCode);
```

## 7. モデルの利用

### 7.1 クエリスコープ
- 複雑なクエリ条件は読みやすいスコープメソッドとして定義する
- ビジネスロジックに関連する条件はコントローラーではなくモデルに記述する

```php
// Article.php
public function scopePublished($query)
{
    return $query->where('is_published', true)
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now());
}

// 使用例（コントローラー）
Article::published()->get();
```

### 7.2 Eager Loading
- N+1問題を避けるため、常に必要なリレーションを `with()` でEager Loadingする

```php
Article::with(['category', 'author'])->get();
```

## 8. マイグレーションとシード

### 8.1 マイグレーションファイル
- マイグレーションファイルには詳細なPHPDocコメントを含める
- `up()` と `down()` メソッドの両方を実装する
- 外部キー制約には `onDelete()` や `onUpdate()` を必ず指定する

```php
/**
 * テーブルの目的の説明
 */
public function up(): void
{
    Schema::create('examples', function (Blueprint $table) {
        $table->id();
        $table->foreignId('parent_id')->constrained()->onDelete('cascade');
        // ...
        $table->timestamps();
    });
}
```

### 8.2 シーダー
- データ整合性を考慮したシーダーを作成する
- ランダムデータ生成にはFakerを使用する
- テスト用データとプロダクション用データを区別する

## 9. セキュリティ

### 9.1 SQL インジェクション対策
- 生のクエリではなく常にクエリビルダーやEloquentを使用する
- ワイルドカード検索時は以下のパターンを使用する

```php
$search = $request->search;
$query->where(function($q) use ($search) {
    $q->where('title', 'like', "%{$search}%")
      ->orWhere('content', 'like', "%{$search}%");
});
```

### 9.2 認可（Authorization）
- リソースへのアクセス制御にはポリシークラスを使用する
- 認可処理はコントローラーのアクションの先頭で行う

```php
public function update(Request $request, Article $article)
{
    $this->authorize('update', $article);
    // ...
}
```

## 10. テスト

### 10.1 テストの分類
- Unit: `tests/Unit` - モデル、サービス等の個別のユニットのテスト
- Feature: `tests/Feature` - HTTPリクエスト、コントローラー、統合テスト

### 10.2 テスト命名規則
- テストメソッド名は具体的な機能と期待結果を表す
- Attributesを使用してテストを分類する

```php
/**
 * 記事一覧の取得をテスト
 * 公開済みの記事のみが取得できることを確認する
 */
#[Test]
public function index_returns_only_published_articles(): void
{
    // ...
}
```

### 10.3 テストデータ準備
- ファクトリーを使用してテストデータを作成する
- テストケース間の依存を避ける（各テストはデータを自分で用意する）
- `RefreshDatabase` トレイトを使用してテスト間でデータベースをリセットする

## 11. 例外処理

### 11.1 例外の記録
- 例外は適切にログに残す
- 例外の詳細情報は開発環境でのみ表示し、本番環境ではユーザーフレンドリーなメッセージを返す

### 11.2 カスタム例外
- 特定のケース用にカスタム例外クラスを作成する
- 例外クラスは `App\Exceptions` 名前空間に配置する

## 12. コードスタイルの自動修正

### 12.1 コードスタイル
- PHP-CS-Fixer または Laravel Pint を使用してコードスタイルを統一する
- プロジェクトルートに設定ファイルを配置する

### 12.2 プロジェクト設定
- `.editorconfig` ファイルを使用して基本的なコードスタイルを定義する
- IDEの設定を標準化し、チーム内で共有する

## 13. パフォーマンス考慮事項

### 13.1 クエリの最適化
- 必要なカラムのみを選択（`select('id', 'title', 'content')`）
- クエリのキャッシュを適切に使用する
- 大量のデータを扱う場合はページネーションまたはカーソルペジネーションを使用する

### 13.2 N+1問題の回避
- always load relationships with `with()`
- クエリデバッグツールを開発中に使用する

```php
Article::with(['category', 'author'])
    ->published()
    ->paginate(10);
```

## 14. コード品質

### 14.1 リファクタリング
- 常に技術的負債を減らす方向でコーディングする
- DRY (Don't Repeat Yourself) 原則を守る
- 複雑な部分はサービスクラスに分離する

### 14.2 プルリクエストレビュー
- すべてのコードは少なくとも1人のレビューを受ける
- レビューポイント：機能性、パフォーマンス、セキュリティ、可読性、テストカバレッジ

---

この規約は現在のコーディングパターンを基にしていますが、チームの合意によって継続的に改善していくべきです。規約は開発効率と品質向上のためのものであり、融通の利かない制約ではなく、ガイドラインとして捉えるのがよいでしょう。