'use client';

import { Container, Title, Text, SimpleGrid, Card, Image, Badge, Group, Button, Box, Overlay, rem, Paper, ActionIcon } from '@mantine/core';
import { IconBookmark, IconShare, IconHeart } from '@tabler/icons-react';
import { useState } from 'react';

// 記事データの型定義
interface Article {
  id: number;
  title: string;
  category: string;
  image: string;
  date: string;
  author: string;
  excerpt: string;
  likes: number;
  comments: number;
}

// ダミー記事データ
const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'コーヒーの世界的な生産と消費トレンド',
    category: 'ライフスタイル',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1356&q=80',
    date: '2025年4月1日',
    author: '山田太郎',
    excerpt: '世界中のコーヒー生産地から最新のトレンドまで、コーヒー愛好家必見の深掘り記事です。持続可能な農業から最新の抽出方法まで幅広くカバーします。',
    likes: 245,
    comments: 32
  },
  {
    id: 2,
    title: '2025年最新のWeb開発トレンド',
    category: 'テクノロジー',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80',
    date: '2025年3月28日',
    author: '佐藤花子',
    excerpt: 'Reactの最新機能からパフォーマンス最適化まで、最新のウェブ開発トレンドを解説します。実際のプロジェクト事例も紹介。',
    likes: 187,
    comments: 43
  },
  {
    id: 3,
    title: '日本の古都を巡る旅',
    category: '旅行',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    date: '2025年3月20日',
    author: '鈴木一郎',
    excerpt: '京都、奈良、金沢など日本の歴史ある都市を訪れるガイドです。地元の人しか知らない隠れた名所も紹介します。',
    likes: 320,
    comments: 28
  },
  {
    id: 4,
    title: '健康的な食事と運動のバランス',
    category: '健康',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1153&q=80',
    date: '2025年3月15日',
    author: '高橋裕子',
    excerpt: '忙しい現代人のための効率的な食事計画と運動方法の組み合わせ。栄養士と運動トレーナーの共同研究に基づいた実践的なアドバイスを提供します。',
    likes: 198,
    comments: 41
  },
  {
    id: 5,
    title: '最新AI技術が変える未来',
    category: 'テクノロジー',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80',
    date: '2025年3月10日',
    author: '伊藤誠',
    excerpt: 'AIの最新進化と私たちの社会への影響について。倫理的な課題から産業革命まで、多角的な視点で解説します。',
    likes: 276,
    comments: 52
  },
  {
    id: 6,
    title: '持続可能なファッションの潮流',
    category: 'ファッション',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    date: '2025年3月5日',
    author: '中村悠太',
    excerpt: '環境に優しい素材と製造プロセスを採用するブランドの紹介。サステナブルでありながらスタイリッシュなファッションの可能性を探ります。',
    likes: 154,
    comments: 23
  }
];

export default function Home() {
  // 記事のいいね状態を管理
  const [likedArticles, setLikedArticles] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    if (likedArticles.includes(id)) {
      setLikedArticles(likedArticles.filter(articleId => articleId !== id));
    } else {
      setLikedArticles([...likedArticles, id]);
    }
  };

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
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: '50px 0'
          }}
        >
          <Container size="lg">
            <Title c="white" size={rem(50)} fw={900} ta="center">
              知識の旅へようこそ
            </Title>
            <Text c="white" size="xl" ta="center" mt="md" mx="auto" maw={700}>
              最新のトレンド、興味深い物語、専門家の洞察を発見しましょう。
              あなたの好奇心を満たす記事がここにあります。
            </Text>
            <Group justify="center" mt="xl">
              <Button size="lg" radius="md" color="blue" variant="filled">
                最新記事を読む
              </Button>
              <Button size="lg" radius="md" color="gray" variant="outline" c="white">
                トピックを探す
              </Button>
            </Group>
          </Container>
        </Box>
      </Box>

      {/* トピックナビゲーション */}
      <Container size="lg" mb={50}>
        <Paper shadow="xs" p="md" withBorder>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6 }}>
            {['すべて', 'テクノロジー', '旅行', '健康', 'ライフスタイル', 'ファッション'].map((topic) => (
              <Button key={topic} variant={topic === 'すべて' ? 'filled' : 'light'} radius="xl" fullWidth>
                {topic}
              </Button>
            ))}
          </SimpleGrid>
        </Paper>
      </Container>

      {/* 記事一覧セクション */}
      <Container size="lg">
        <Group justify="space-between" mb="xl">
          <Title order={2}>最新の記事</Title>
          <Button variant="subtle">すべての記事を見る</Button>
        </Group>

        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing="lg"
          verticalSpacing="xl"
        >
          {ARTICLES.map((article) => (
            <Card key={article.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Box pos="relative">
                  <Image
                    src={article.image}
                    height={200}
                    alt={article.title}
                  />
                  <Badge
                    pos="absolute"
                    top={10}
                    left={10}
                    color="blue"
                    variant="filled"
                    radius="md"
                  >
                    {article.category}
                  </Badge>
                </Box>
              </Card.Section>

              <Box mt="md" mb="xs">
                <Text fw={700} size="lg" lineClamp={2}>
                  {article.title}
                </Text>
                <Group mt={5}>
                  <Text size="xs" c="dimmed">
                    {article.date}
                  </Text>
                  <Text size="xs" c="dimmed">
                    by {article.author}
                  </Text>
                </Group>
              </Box>

              <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                {article.excerpt}
              </Text>

              <Group justify="space-between" mt="md">
                <Group gap={8}>
                  <ActionIcon
                    color={likedArticles.includes(article.id) ? "red" : "gray"}
                    variant="subtle"
                    onClick={() => toggleLike(article.id)}
                  >
                    <IconHeart size="1.2rem" />
                  </ActionIcon>
                  <Text size="sm" c="dimmed">{likedArticles.includes(article.id) ? article.likes + 1 : article.likes}</Text>

                  <ActionIcon color="gray" variant="subtle">
                    <IconBookmark size="1.2rem" />
                  </ActionIcon>

                  <ActionIcon color="gray" variant="subtle">
                    <IconShare size="1.2rem" />
                  </ActionIcon>
                </Group>

                <Button variant="light" color="blue" radius="md" size="sm">
                  続きを読む
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Group justify="center" mt={50} mb={100}>
          <Button variant="outline" size="lg" radius="md">
            もっと記事を読む
          </Button>
        </Group>
      </Container>

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