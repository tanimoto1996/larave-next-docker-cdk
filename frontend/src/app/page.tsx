'use client';

import { Container, Title, Text, SimpleGrid, Card, Image, Badge, Group, Button, Box, Overlay, rem, Paper, ActionIcon, Loader, Center } from '@mantine/core';
import { IconBookmark, IconShare, IconHeart } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getArticles, getCategories, updateArticleLikes } from '../../lib/api';

// 記事データの型定義
interface Article {
  id: number;
  title: string;
  category?: { name: string };
  category_id?: number;
  slug: string;
  image?: string;
  published_at: string;
  author: { name: string };
  excerpt: string;
  likes_count: number;
  comments_count: number;
}

// カテゴリーの型定義
interface Category {
  id: number;
  name: string;
  slug: string;
}

// 画像URLを生成するヘルパー関数
const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return 'https://placehold.co/600x400?text=No+Image';
  // バックエンドのURL（環境変数などから取得するのが理想）
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  return `${backendUrl}/storage/${imagePath}`;
};

export default function Home() {
  // 記事データとローディング状態
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 表示する記事の数を管理
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // 記事のいいね状態を管理
  const [likedArticles, setLikedArticles] = useState<number[]>([]);

  // localStorageからいいね状態を読み込む
  useEffect(() => {
    const storedLikes = localStorage.getItem('likedArticles');
    if (storedLikes) {
      setLikedArticles(JSON.parse(storedLikes));
    }
  }, []);

  // いいね状態が変わったらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
  }, [likedArticles]);

  const toggleLike = async (id: number, slug: string) => {
    try {
      const isLiked = likedArticles.includes(id);
      
      // APIを呼び出していいね状態を更新
      const response = await updateArticleLikes(slug, !isLiked);
      
      if (response.success) {
        if (isLiked) {
          setLikedArticles(likedArticles.filter(articleId => articleId !== id));
        } else {
          setLikedArticles([...likedArticles, id]);
        }
        
        // 記事一覧を最新の状態に更新
        const updatedArticles = articles.map(article => {
          if (article.id === id) {
            return {
              ...article,
              likes_count: response.data.likes_count
            };
          }
          return article;
        });
        
        setArticles(updatedArticles);
      } else {
        console.error('いいねの更新に失敗しました');
      }
    } catch (error) {
      console.error('いいね更新エラー:', error);
    }
  };

  // APIからデータを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 記事とカテゴリーを並行して取得
        const [articlesData, categoriesData] = await Promise.all([
          getArticles(),
          getCategories()
        ]);

        console.log('Fetched articles:', articlesData);
        console.log('Fetched categories:', categoriesData);

        setArticles(articlesData.data || []);
        setCategories(categoriesData.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // カテゴリー変更時にvisibleCountをリセット
  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory]);

  // カテゴリーでフィルタリングされた記事
  const filteredArticles = selectedCategory
    ? articles.filter(article => article.category?.name === selectedCategory)
    : articles;

  // 現在表示する記事
  const visibleArticles = filteredArticles.slice(0, visibleCount);

  // もっと記事を読み込む関数
  const loadMoreArticles = () => {
    setIsLoadingMore(true);

    // 実際のAPIページネーションがある場合はここで追加のデータをフェッチする
    // この例では既存データから追加で表示するだけ

    setTimeout(() => {
      setVisibleCount(prevCount => prevCount + 6);
      setIsLoadingMore(false);
    }, 300); // ローディングの動作を見せるための遅延
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 追加で表示できる記事があるかどうか
  const hasMoreArticles = visibleArticles.length < filteredArticles.length;

  return (
    <>
      {/* ヒーローセクション */}
      <Box pos="relative" h={500} mb={50}>
        <Image
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
          h={500}
          alt="知識の旅"
          style={{ objectFit: 'cover' }}
        />
        <Overlay
          gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 90%)"
          opacity={0.7}
          zIndex={1}
        />
        <Box
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Container size="lg">
            <Title
              c="white"
              fw={900}
              ta="center"
              size="h1"
              style={{
                '@media (maxWidth: 576px)': {
                  fontSize: rem(28)
                },
                '@media (minWidth: 577px) and (maxWidth: 768px)': {
                  fontSize: rem(36)
                },
                '@media (minWidth: 769px)': {
                  fontSize: rem(50)
                }
              }}
            >
              知識の旅へようこそ
            </Title>
            <Text c="white" ta="center" mt="md" mx="auto" maw={700}
              style={{
                '@media (maxWidth: 576px)': {
                  fontSize: 'var(--mantine-font-size-md)'
                },
                '@media (minWidth: 577px) and (maxWidth: 768px)': {
                  fontSize: 'var(--mantine-font-size-lg)'
                },
                '@media (minWidth: 769px)': {
                  fontSize: 'var(--mantine-font-size-xl)'
                }
              }}
            >
              最新のトレンド、興味深い物語、専門家の洞察を発見しましょう。<br />
              あなたの好奇心を満たす記事がここにあります。
            </Text>
          </Container>
        </Box>
      </Box>

      {/* トピックナビゲーション */}
      <Container size="lg" mb={50}>
        <Paper shadow="xs" p="md" withBorder>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5 }}>
            <Button
              variant={selectedCategory === null ? 'filled' : 'light'}
              radius="xl"
              fullWidth
              onClick={() => setSelectedCategory(null)}
            >
              すべて
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'filled' : 'light'}
                radius="xl"
                fullWidth
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </SimpleGrid>
        </Paper>
      </Container>

      {/* 記事一覧セクション */}
      <Container size="lg">
        <Group justify="space-between" mb="xl">
          <Title order={2}>最新の記事</Title>
        </Group>

        {/* ローディング中の表示 */}
        {loading && (
          <Center mt={50} mb={50}>
            <Loader size="xl" />
          </Center>
        )}

        {/* エラー表示 */}
        {error && (
          <Center mt={50} mb={50}>
            <Text c="red" ta="center">{error}</Text>
          </Center>
        )}

        {/* 記事がない場合の表示 */}
        {!loading && !error && filteredArticles.length === 0 && (
          <Center mt={50} mb={50}>
            <Text ta="center">記事が見つかりませんでした。</Text>
          </Center>
        )}

        {/* 記事一覧 */}
        {!loading && !error && visibleArticles.length > 0 && (
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            verticalSpacing="xl"
          >
            {visibleArticles.map((article) => (
              <Card key={article.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Box pos="relative">
                    <Image
                      src={getImageUrl(article.image)}
                      height={200}
                      alt={article.title}
                    />
                    {article.category && (
                      <Badge
                        pos="absolute"
                        top={10}
                        left={10}
                        color="blue"
                        variant="filled"
                        radius="md"
                      >
                        {article.category.name}
                      </Badge>
                    )}
                  </Box>
                </Card.Section>

                <Box mt="md" mb="xs">
                  <Text fw={700} size="lg" lineClamp={2}>
                    {article.title}
                  </Text>
                  <Group mt={5}>
                    <Text size="xs" c="dimmed">
                      {formatDate(article.published_at)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      by {article.author?.name || '不明'}
                    </Text>
                  </Group>
                </Box>

                <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                  {article.excerpt}
                </Text>

                <Group justify="space-between" mt="md">
                  <Group gap={8}>
                    <ActionIcon 
                      onClick={() => toggleLike(article.id, article.slug)}
                      color={likedArticles.includes(article.id) ? 'red' : 'gray'}
                      variant={likedArticles.includes(article.id) ? 'filled' : 'subtle'}
                    >
                      <IconHeart 
                        size="1.2rem" 
                        style={{ 
                          fill: likedArticles.includes(article.id) ? 'currentcolor' : 'none',
                          stroke: 'currentcolor' 
                        }} 
                      />
                    </ActionIcon>
                    <Text size="sm" c="dimmed">{article.likes_count}</Text>

                    <ActionIcon color="gray" variant="subtle">
                      <IconBookmark size="1.2rem" />
                    </ActionIcon>

                    <ActionIcon color="gray" variant="subtle">
                      <IconShare size="1.2rem" />
                    </ActionIcon>
                  </Group>

                  <Button
                    variant="light"
                    color="blue"
                    radius="md"
                    size="sm"
                    component="a"
                    href={`/articles/${article.slug}`}
                  >
                    続きを読む
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* もっと記事を読むボタン */}
        {hasMoreArticles && (
          <Group justify="center" mt={50} mb={50}>
            <Button
              variant="outline"
              size="lg"
              radius="md"
              onClick={loadMoreArticles}
              loading={isLoadingMore}
              disabled={isLoadingMore}
            >
              もっと記事を読む（{visibleArticles.length}/{filteredArticles.length}）
            </Button>
          </Group>
        )}
      </Container>

      {/* スペーサー - 最新情報セクションとの間に適切なスペースを設ける */}
      <Box h={50} />

      {/* ニュースレター登録セクション */}
      <Box bg="gray.1" py={60}>
        <Container size="md" ta="center">
          <Title order={2} mb="md">最新情報をお届けします</Title>
          <Text c="dimmed" mb={30} maw={600} mx="auto">
            新しい記事や特集コンテンツなど、興味深い情報を定期的にお届けします。
            ニュースレターにご登録ください。
          </Text>
          <Group justify="center">
            <Button size="md" radius="md" color="blue">
              ニュースレターに登録する
            </Button>
          </Group>
        </Container>
      </Box>
    </>
  );
}