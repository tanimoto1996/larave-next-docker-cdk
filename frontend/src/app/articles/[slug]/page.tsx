'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getArticleBySlug } from '../../../../lib/api';
import { Container, Title, Text, Badge, Group, Image, Loader, Center, Box, Paper, Divider } from '@mantine/core';
import { IconCalendar, IconUser, IconEye, IconHeart, IconMessageCircle2 } from '@tabler/icons-react';

// 記事データの型定義
interface Article {
    id: number;
    title: string;
    content: string;
    category?: { name: string };
    slug: string;
    image_url?: string;
    published_at: string;
    author: { name: string };
    likes_count: number;
    comments_count: number;
}

export default function ArticleDetail() {
    const params = useParams();
    const slug = params.slug as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const response = await getArticleBySlug(slug);
                setArticle(response.data);
                setError(null);
            } catch (err) {
                console.error('記事の取得に失敗しました:', err);
                setError('記事の取得中にエラーが発生しました。');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticle();
        }
    }, [slug]);

    // 日付をフォーマットする関数
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // HTMLコンテンツを安全に表示する
    const renderContent = (content: string) => {
        return { __html: content };
    };

    return (
        <Container size="md" py={50}>
            {loading ? (
                <Center h={400}>
                    <Loader size="lg" />
                </Center>
            ) : error ? (
                <Center h={400}>
                    <Text c="red" size="lg">{error}</Text>
                </Center>
            ) : article ? (
                <>
                    {/* 記事ヘッダー */}
                    <Title order={1} mb="md">{article.title}</Title>

                    {/* メタデータ */}
                    <Group mb="xl">
                        {article.category && (
                            <Badge color="blue" size="lg">
                                {article.category.name}
                            </Badge>
                        )}
                        <Group gap="xs">
                            <IconCalendar size="1rem" />
                            <Text size="sm" c="dimmed">
                                {formatDate(article.published_at)}
                            </Text>
                        </Group>
                        <Group gap="xs">
                            <IconUser size="1rem" />
                            <Text size="sm" c="dimmed">
                                {article.author.name}
                            </Text>
                        </Group>
                        <Group gap="xs">
                            <IconEye size="1rem" />
                            <Text size="sm" c="dimmed">閲覧数 1,234</Text>
                        </Group>
                    </Group>

                    {/* アイキャッチ画像 */}
                    {article.image_url && (
                        <Image
                            src={article.image_url}
                            alt={article.title}
                            height={400}
                            radius="md"
                            mb="xl"
                            style={{ objectFit: 'cover' }}
                        />
                    )}

                    {/* 本文 */}
                    <Paper p="md" withBorder radius="md" mb="xl">
                        <div
                            className="article-content"
                            dangerouslySetInnerHTML={renderContent(article.content)}
                        />
                    </Paper>

                    {/* エンゲージメント情報 */}
                    <Box mb="xl">
                        <Group justify="apart">
                            <Group>
                                <Group gap="xs">
                                    <IconHeart size="1.2rem" color="red" />
                                    <Text>{article.likes_count} いいね</Text>
                                </Group>
                                <Group gap="xs">
                                    <IconMessageCircle2 size="1.2rem" />
                                    <Text>{article.comments_count} コメント</Text>
                                </Group>
                            </Group>
                        </Group>
                    </Box>

                    <Divider my="lg" />

                    {/* コメントセクション（将来的に実装） */}
                    <Box>
                        <Title order={3} mb="md">コメント</Title>
                        <Text c="dimmed">この記事にはまだコメントがありません。</Text>
                    </Box>
                </>
            ) : (
                <Center h={400}>
                    <Text>記事が見つかりませんでした。</Text>
                </Center>
            )}
        </Container>
    );
}