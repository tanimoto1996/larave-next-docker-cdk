'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    Image,
} from '@mantine/core';
import { IconArrowLeft, IconUpload, IconInfoCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getArticle, getArticleFormData, updateArticle } from '../../../../../../lib/adminApi';

// 記事データの型定義
interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category_id: number;
    author_id: number;
    is_published: boolean;
    published_at: string;
    image?: string;
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

export default function EditArticle() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;

    const [opened, setOpened] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // フォームの状態
    const [formData, setFormData] = useState<Article>({
        id: parseInt(articleId),
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category_id: 0,
        author_id: 0,
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

    // カテゴリーと著者のオプション
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);

    // 記事データとマスタデータのロード
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. 記事データの取得
                const articleResponse = await getArticle(parseInt(articleId));

                // 2. フォーム用データ（カテゴリーと著者）の取得
                const formDataResponse = await getArticleFormData();

                // データをセット
                if (articleResponse.data) {
                    setFormData(articleResponse.data);
                }

                if (formDataResponse.data) {
                    setCategories(formDataResponse.data.categories || []);
                    setAuthors(formDataResponse.data.authors || []);
                }
            } catch (error) {
                console.error('データの取得に失敗しました:', error);
                notifications.show({
                    title: 'エラー',
                    message: '記事データの取得に失敗しました',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [articleId]);

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
                // 画像URLフィールドはサーバーに送信しない（既存の画像パスは別途処理）
                if (key === 'image_url') {
                    return;
                }

                if (key === 'is_published') {
                    // booleanを1または0に変換（LaravelのBoolean型バリデーション用）
                    formDataToSend.append(key, value === true ? '1' : '0');
                } else {
                    // その他のフィールドは通常通り送信
                    formDataToSend.append(key, value === null ? '' : value.toString());
                }
            });

            // 画像がある場合は追加、ない場合は画像変更なしフラグを設定
            if (image) {
                formDataToSend.append('image', image);
            } else if (formData.image) {
                // 既存の画像がある場合は画像変更なしフラグを設定
                formDataToSend.append('image_not_changed', '1');
            }

            // デバッグ: FormDataの内容を確認
            console.log('送信データ:');
            for (const pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // APIを呼び出して記事を更新
            await updateArticle(parseInt(articleId), formDataToSend);

            // 成功通知
            notifications.show({
                title: '記事が更新されました',
                message: `"${formData.title}" の変更を保存しました`,
                color: 'green',
                icon: <IconCheck size="1.1rem" />,
            });

            // ダッシュボードに戻る
            router.push('/dashboard');
        } catch (error: any) {
            console.error('記事の更新に失敗しました:', error);

            // エラーレスポンスの詳細を取得して表示
            const errorMessage = error.response?.data?.message || '記事の更新中にエラーが発生しました';
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
        { title: '記事編集', href: '#' },
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
                        <Title order={2}>記事編集: {formData.title}</Title>
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

                                        <Textarea
                                            label="内容"
                                            placeholder="記事の本文"
                                            required
                                            autosize
                                            minRows={10}
                                            value={formData.content}
                                            onChange={(e) => handleInputChange('content', e.target.value)}
                                        />
                                    </Stack>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Stack gap="md">
                                        <Select
                                            label="カテゴリー"
                                            placeholder="カテゴリーを選択"
                                            required
                                            data={categories.map((cat) => ({
                                                value: cat.id.toString(),
                                                label: cat.name
                                            }))}
                                            value={formData.category_id?.toString()}
                                            onChange={(value) => handleInputChange('category_id', value ? parseInt(value) : null)}
                                        />

                                        <Select
                                            label="著者"
                                            placeholder="著者を選択"
                                            required
                                            data={authors.map((author) => ({
                                                value: author.id.toString(),
                                                label: author.name
                                            }))}
                                            value={formData.author_id?.toString()}
                                            onChange={(value) => handleInputChange('author_id', value ? parseInt(value) : null)}
                                        />

                                        {formData.image && (
                                            <Box>
                                                <Text size="sm" fw={500} mb={5}>現在の画像:</Text>
                                                <Image
                                                    src={getImageUrl(formData.image)}
                                                    height={120}
                                                    radius="md"
                                                    mb={10}
                                                    alt={`${formData.title}のアイキャッチ画像`}
                                                />
                                            </Box>
                                        )}

                                        <FileInput
                                            label="アイキャッチ画像を変更"
                                            placeholder="画像を選択"
                                            accept="image/png,image/jpeg"
                                            value={image}
                                            onChange={setImage}
                                            rightSection={<IconUpload size="1.1rem" stroke={1.5} />}
                                            description={formData.image ? `現在の画像: ${formData.image}` : ''}
                                        />

                                        <Switch
                                            label="公開する"
                                            checked={formData.is_published}
                                            onChange={(e) => handleInputChange('is_published', e.currentTarget.checked)}
                                        />

                                        <Alert variant="light" color="blue" title="編集のヒント" icon={<IconInfoCircle />}>
                                            記事の内容はHTMLタグを使用して書式を設定できます。例: &lt;h2&gt;見出し&lt;/h2&gt;、&lt;p&gt;段落&lt;/p&gt;、&lt;strong&gt;強調&lt;/strong&gt;など。
                                        </Alert>
                                    </Stack>
                                </Grid.Col>
                            </Grid>

                            <Group justify="flex-end" mt="xl">
                                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                    キャンセル
                                </Button>
                                <Button type="submit" loading={submitting}>
                                    変更を保存
                                </Button>
                            </Group>
                        </form>
                    </Paper>
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}