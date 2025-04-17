'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getArticleBySlug, updateArticleLikes } from '../../../../lib/api';
import { Container, Title, Text, Badge, Group, Image, Loader, Center, Box, Paper, Divider, Button, ActionIcon } from '@mantine/core';
import { IconCalendar, IconUser, IconHeart, IconMessageCircle2, IconArrowLeft } from '@tabler/icons-react';
import MarkdownRenderer from '../../../components/MarkdownRenderer';

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
    const router = useRouter();
    const slug = params.slug as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState<boolean>(false);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const response = await getArticleBySlug(slug);
                setArticle(response.data);
                setError(null);
                
                // ローカルストレージからいいね状態を確認（クライアントサイドのみ）
                if (typeof window !== 'undefined') {
                    try {
                        const storedLikes = localStorage.getItem('likedArticles');
                        if (storedLikes) {
                            const likedIds = JSON.parse(storedLikes) as number[];
                            setIsLiked(likedIds.includes(response.data.id));
                        }
                    } catch (err) {
                        console.error('ローカルストレージからのいいね状態の読み込みに失敗しました:', err);
                        setIsLiked(false);
                    }
                }
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

    // 前のページに戻る関数
    const handleGoBack = () => {
        router.back();
    };

    // いいね機能の切り替え
    const toggleLike = async () => {
        if (!article) return;
        
        try {
            // いいね状態を反転して送信
            // isLiked: false → バックエンドでは「いいねを削除」
            // isLiked: true → バックエンドでは「いいねを追加」
            const response = await updateArticleLikes(slug, !isLiked);
            
            if (response.success) {
                // いいね状態を更新
                setIsLiked(!isLiked);
                
                // 記事のいいね数を更新
                setArticle({
                    ...article,
                    likes_count: response.data.likes_count
                });
                
                // ローカルストレージも更新
                const storedLikes = localStorage.getItem('likedArticles');
                let likedIds: number[] = storedLikes ? JSON.parse(storedLikes) : [];
                
                if (isLiked) {
                    // いいねを取り消す場合
                    likedIds = likedIds.filter(id => id !== article.id);
                } else {
                    // いいねを追加する場合
                    likedIds.push(article.id);
                }
                
                localStorage.setItem('likedArticles', JSON.stringify(likedIds));
            } else {
                console.error('いいねの更新に失敗しました');
            }
        } catch (error) {
            console.error('いいね更新エラー:', error);
        }
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
                    {/* 戻るボタン */}
                    <Button
                        leftSection={<IconArrowLeft size="1rem" />}
                        variant="subtle"
                        mb="lg"
                        onClick={handleGoBack}
                    >
                        戻る
                    </Button>

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

                    {/* 本文 - マークダウンレンダラーを使用 */}
                    <Paper p="md" withBorder radius="md" mb="xl">
                        <MarkdownRenderer content={article.content} />
                    </Paper>

                    {/* エンゲージメント情報 */}
                    <Box mb="xl">
                        <Group justify="apart">
                            <Group>
                                <Group gap="xs">
                                    <ActionIcon 
                                        onClick={toggleLike} 
                                        color={isLiked ? 'red' : 'gray'}
                                        variant={isLiked ? 'filled' : 'subtle'}
                                    >
                                        <IconHeart 
                                            size="1.2rem" 
                                            style={{ 
                                                fill: isLiked ? 'currentcolor' : 'none',
                                                stroke: 'currentcolor' 
                                            }} 
                                        />
                                    </ActionIcon>
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