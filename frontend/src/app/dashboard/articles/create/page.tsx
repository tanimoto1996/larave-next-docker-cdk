'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AppShell,
    Burger,
    Text,
    Group,
    Box,
    Button,
    Paper,
    Title,
    TextInput,
    Textarea,
    Select,
    Switch,
    LoadingOverlay,
    Stack,
    Grid,
    FileInput,
    ActionIcon,
    Breadcrumbs,
    Anchor,
    Alert,
} from '@mantine/core';
import { IconArrowLeft, IconUpload, IconInfoCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getArticleFormData, createArticle } from '../../../../../lib/adminApi';
import MarkdownEditor from '../../../../components/MarkdownEditor';

// 記事データの型定義
interface Article {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category_id: number | null;
    author_id: number | null;
    is_published: boolean;
    published_at: string;
}

// カテゴリーデータの型定義
interface Category {
    id: number;
    name: string;
    slug: string;
}

// 著者データの型定義
interface Author {
    id: number;
    name: string;
}

export default function CreateArticle() {
    const router = useRouter();

    const [opened, setOpened] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // フォームの状態
    const [formData, setFormData] = useState<Article>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category_id: null,
        author_id: null,
        is_published: false,
        published_at: new Date().toISOString().slice(0, 10),
    });

    // アップロードファイル
    const [image, setImage] = useState<File | null>(null);

    // 画像URLを生成するヘルパー関数
    const getImageUrl = (imagePath?: string): string => {
      if (!imagePath) return '';
      // バックエンドのURL（環境変数などから取得するのが理想）
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      return `${backendUrl}/storage/${imagePath}`;
    };
    
    // 画像プレビューURL
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 画像が選択されたときにプレビューを生成
    useEffect(() => {
        if (image) {
            const objectUrl = URL.createObjectURL(image);
            setPreviewUrl(objectUrl);
            
            // クリーンアップ関数
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [image]);

    // カテゴリーと著者のオプション
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);

    // カテゴリーと著者のデータロード
    useEffect(() => {
        // APIからフォームデータ（カテゴリーと著者）を取得
        const fetchFormData = async () => {
            setLoading(true);
            try {
                const response = await getArticleFormData();
                console.log('API response:', response); // デバッグ用にレスポンスを出力

                // APIレスポンスの構造に合わせて正しくデータを取得
                const { data } = response;
                if (data) {
                    setCategories(data.categories || []);
                    setAuthors(data.authors || []);
                    console.log('Categories loaded:', data.categories); // カテゴリーデータを確認
                    console.log('Authors loaded:', data.authors); // 著者データを確認
                }
            } catch (error) {
                console.error('データの取得に失敗しました:', error);
                notifications.show({
                    title: 'エラー',
                    message: 'マスタデータの取得に失敗しました',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, []);

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // FormDataオブジェクトを作成して記事データを設定
            const formDataToSend = new FormData();

            // フィールドごとに適切な型で送信
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'is_published') {
                    // booleanを1または0に変換（LaravelのBoolean型バリデーション用）
                    formDataToSend.append(key, value === true ? '1' : '0');
                } else {
                    // その他のフィールドは通常通り送信
                    formDataToSend.append(key, value === null ? '' : value.toString());
                }
            });

            // 画像がある場合は追加
            if (image) formDataToSend.append('image', image);

            // デバッグ: FormDataの内容を確認
            console.log('送信データ:');
            for (const pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // APIを呼び出して記事を作成
            await createArticle(formDataToSend);

            // 成功通知
            notifications.show({
                title: '記事が作成されました',
                message: `"${formData.title}" を登録しました`,
                color: 'green',
                icon: <IconCheck size="1.1rem" />,
            });

            // ダッシュボードに戻る
            router.push('/dashboard');
        } catch (error: any) {
            console.error('記事の作成に失敗しました:', error);

            // エラーレスポンスの詳細を取得して表示
            const errorMessage = error.response?.data?.message || '記事の作成中にエラーが発生しました';
            const validationErrors = error.response?.data?.errors;

            // バリデーションエラーがある場合は詳細なエラーメッセージを表示
            if (validationErrors) {
                const errorDetails = Object.values(validationErrors).flat().join('\n');
                notifications.show({
                    title: 'バリデーションエラー',
                    message: errorDetails,
                    color: 'red',
                });
            } else {
                notifications.show({
                    title: 'エラー',
                    message: errorMessage,
                    color: 'red',
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const breadcrumbItems = [
        { title: 'ダッシュボード', href: '/dashboard' },
        { title: '記事管理', href: '/dashboard' },
        { title: '記事作成', href: '#' },
    ];

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger
                            opened={opened}
                            onClick={() => setOpened(!opened)}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <Text size="lg" fw={700}>管理画面</Text>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main py="md">
                <Box mb={30}>
                    <Group mb="md">
                        <ActionIcon variant="subtle" onClick={() => router.push('/dashboard')}>
                            <IconArrowLeft />
                        </ActionIcon>
                        <Breadcrumbs>
                            {breadcrumbItems.map((item, index) => (
                                <Anchor key={index} href={item.href} size="sm" fw={index === breadcrumbItems.length - 1 ? 500 : 400}>
                                    {item.title}
                                </Anchor>
                            ))}
                        </Breadcrumbs>
                    </Group>

                    <Group justify="space-between" mb="xl">
                        <Title order={2}>新規記事作成</Title>
                    </Group>

                    <Paper withBorder shadow="xs" radius="md" p={30} pos="relative">
                        <LoadingOverlay visible={loading || submitting} overlayProps={{ radius: "sm", blur: 2 }} />

                        <form onSubmit={handleSubmit}>
                            <Grid gutter="md">
                                <Grid.Col span={{ base: 12, md: 8 }}>
                                    <Stack gap="md">
                                        <TextInput
                                            label="タイトル"
                                            placeholder="記事のタイトルを入力"
                                            required
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                        />

                                        <TextInput
                                            label="スラグ"
                                            description="URLで使用される識別子"
                                            placeholder="article-slug"
                                            value={formData.slug}
                                            onChange={(e) => handleInputChange('slug', e.target.value)}
                                        />

                                        <Textarea
                                            label="抜粋"
                                            placeholder="記事の短い説明（検索結果やサムネイルに表示されます）"
                                            autosize
                                            minRows={2}
                                            value={formData.excerpt}
                                            onChange={(e) => handleInputChange('excerpt', e.target.value)}
                                        />

                                        <Box>
                                            <Text size="sm" fw={500} mb={5}>内容</Text>
                                            <MarkdownEditor
                                                value={formData.content}
                                                onChange={(value) => handleInputChange('content', value)}
                                                minRows={10}
                                                placeholder="マークダウンで記事を書いてください..."
                                            />
                                        </Box>
                                    </Stack>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Stack gap="md">
                                        <Select
                                            label="カテゴリー"
                                            placeholder="カテゴリーを選択"
                                            required
                                            data={categories.length > 0 ? categories.map((cat) => ({
                                                value: String(cat.id),
                                                label: cat.name
                                            })) : []}
                                            value={formData.category_id ? String(formData.category_id) : null}
                                            onChange={(value) => handleInputChange('category_id', value ? parseInt(value) : null)}
                                        />

                                        <Select
                                            label="著者"
                                            placeholder="著者を選択"
                                            required
                                            data={authors.length > 0 ? authors.map((author) => ({
                                                value: String(author.id),
                                                label: author.name
                                            })) : []}
                                            value={formData.author_id ? String(formData.author_id) : null}
                                            onChange={(value) => handleInputChange('author_id', value ? parseInt(value) : null)}
                                        />

                                        <FileInput
                                            label="アイキャッチ画像"
                                            placeholder="画像を選択"
                                            accept="image/png,image/jpeg"
                                            value={image}
                                            onChange={setImage}
                                            rightSection={<IconUpload size="1.1rem" stroke={1.5} />}
                                        />

                                        {previewUrl && (
                                            <Box mt="md">
                                                <Text size="sm" color="dimmed">プレビュー:</Text>
                                                <img src={previewUrl} alt="プレビュー画像" style={{ maxWidth: '100%' }} />
                                            </Box>
                                        )}

                                        <Switch
                                            label="公開する"
                                            checked={formData.is_published}
                                            onChange={(e) => handleInputChange('is_published', e.currentTarget.checked)}
                                        />

                                        <Alert variant="light" color="blue" title="入力のヒント" icon={<IconInfoCircle />}>
                                            記事の内容はマークダウン形式で書くことができます。
                                            <br />
                                            見出しは # (h1) や ## (h2) で、リストは - や * で作成できます。コードブロックは ```で囲みます。
                                        </Alert>
                                    </Stack>
                                </Grid.Col>
                            </Grid>

                            <Group justify="flex-end" mt="xl">
                                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                    キャンセル
                                </Button>
                                <Button type="submit" loading={submitting}>
                                    記事を作成
                                </Button>
                            </Group>
                        </form>
                    </Paper>
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}