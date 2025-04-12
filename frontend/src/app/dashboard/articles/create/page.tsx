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
// import { getCategories, getAuthors, createArticle } from '../../../../lib/api';

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
    image_url?: string;
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

    // カテゴリーと著者のオプション
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);

    // カテゴリーと著者のデータロード
    useEffect(() => {
        // ダミーデータ（実際のAPIが実装されるまで）
        setCategories([
            { id: 1, name: 'バックエンド', slug: 'backend' },
            { id: 2, name: 'フロントエンド', slug: 'frontend' },
            { id: 3, name: 'AI', slug: 'ai' },
            { id: 4, name: 'AWS', slug: 'aws' }
        ]);

        setAuthors([
            { id: 1, name: '山田太郎' },
            { id: 2, name: '佐藤花子' },
            { id: 3, name: '鈴木一郎' }
        ]);

        setLoading(false);

        // 実際のAPI呼び出し（コメントアウトを解除して使用）
        // const fetchData = async () => {
        //     setLoading(true);
        //     try {
        //         const [categoriesRes, authorsRes] = await Promise.all([
        //             getCategories(),
        //             getAuthors()
        //         ]);
        //         
        //         setCategories(categoriesRes.data || []);
        //         setAuthors(authorsRes.data || []);
        //     } catch (error) {
        //         console.error('データの取得に失敗しました:', error);
        //         notifications.show({
        //             title: 'エラー',
        //             message: 'マスタデータの取得に失敗しました',
        //             color: 'red',
        //         });
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchData();
    }, []);

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // ここでAPIを呼び出して記事を作成
            // const formDataToSend = new FormData();
            // Object.entries(formData).forEach(([key, value]) => {
            //     if (value !== null) formDataToSend.append(key, value.toString());
            // });
            // if (image) formDataToSend.append('image', image);
            // await createArticle(formDataToSend);

            // 成功通知
            notifications.show({
                title: '記事が作成されました',
                message: `"${formData.title}" を登録しました`,
                color: 'green',
                icon: <IconCheck size="1.1rem" />,
            });

            // ダッシュボードに戻る
            router.push('/dashboard');
        } catch (error) {
            console.error('記事の作成に失敗しました:', error);
            notifications.show({
                title: 'エラー',
                message: '記事の作成中にエラーが発生しました',
                color: 'red',
            });
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

                                        <FileInput
                                            label="アイキャッチ画像"
                                            placeholder="画像を選択"
                                            accept="image/png,image/jpeg"
                                            value={image}
                                            onChange={setImage}
                                            rightSection={<IconUpload size="1.1rem" stroke={1.5} />}
                                        />

                                        <Switch
                                            label="公開する"
                                            checked={formData.is_published}
                                            onChange={(e) => handleInputChange('is_published', e.currentTarget.checked)}
                                        />

                                        <Alert variant="light" color="blue" title="入力のヒント" icon={<IconInfoCircle />}>
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