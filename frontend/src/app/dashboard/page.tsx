'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AppShell,
    Burger,
    Text,
    Group,
    Avatar,
    Box,
    Button,
    Paper,
    Title,
    ThemeIcon,
    Stack,
    NavLink,
    Divider,
    useMantineTheme,
    ActionIcon,
    Tooltip,
    Table,
    Menu,
    Modal,
    LoadingOverlay,
} from '@mantine/core';
import {
    IconHome2,
    IconArticle,
    IconCategory,
    IconUser,
    IconSettings,
    IconLogout,
    IconSun,
    IconMoonStars,
    IconBell,
    IconSearch,
    IconPlus,
    IconEdit,
    IconTrash,
    IconDotsVertical,
    IconMessage,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { getArticles } from '../../../lib/api';

// 記事データの型定義
interface Article {
    id: number;
    title: string;
    is_published: boolean;
    published_at: string;
    slug: string;
    category?: { name: string };
    author?: { name: string };
    likes_count: number;
    comments_count: number;
}

// サイドバーのナビゲーションアイテム
const navItems = [
    { icon: IconHome2, label: 'ホーム', href: '/' },
    { icon: IconArticle, label: '記事管理', href: '/dashboard', active: true },
    { icon: IconCategory, label: 'カテゴリー', href: '/dashboard/categories' },
    { icon: IconMessage, label: 'コメント', href: '/dashboard/comments' },
    { icon: IconUser, label: 'ユーザー', href: '/dashboard/users' },
    { icon: IconSettings, label: '設定', href: '/dashboard/settings' }
];

export default function Dashboard() {
    const theme = useMantineTheme();
    const router = useRouter();
    const [opened, setOpened] = useState(false);
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [opened1, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

    const toggleColorScheme = () => {
        setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await getArticles();
            setArticles(response.data || []);
        } catch (error) {
            console.error('記事の取得に失敗しました:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        openDeleteModal();
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                // 実際の API 呼び出しはまだ実装されていませんが、ここで削除 API を呼び出します
                // await deleteArticle(deleteId);
                console.log(`記事 ID: ${deleteId} を削除しました`);

                // 記事一覧を更新
                setArticles(articles.filter(article => article.id !== deleteId));
                closeDeleteModal();
            } catch (error) {
                console.error('記事の削除に失敗しました:', error);
            }
        }
    };

    // 日付をフォーマットする関数
    const formatDate = (dateString: string) => {
        if (!dateString) return '未公開';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const navigateToCreate = () => {
        router.push('/dashboard/articles/create');
    };

    const navigateToEdit = (id: number) => {
        router.push(`/dashboard/articles/edit/${id}`);
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened }
            }}
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
                    <Group>
                        <Tooltip label="検索">
                            <ActionIcon variant="subtle" size="lg" radius="xl">
                                <IconSearch size="1.2rem" stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="通知">
                            <ActionIcon variant="subtle" size="lg" radius="xl">
                                <IconBell size="1.2rem" stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={colorScheme === 'dark' ? 'ライトモード' : 'ダークモード'}>
                            <ActionIcon
                                variant="subtle"
                                size="lg"
                                radius="xl"
                                onClick={toggleColorScheme}
                            >
                                {colorScheme === 'dark' ? <IconSun size="1.2rem" stroke={1.5} /> : <IconMoonStars size="1.2rem" stroke={1.5} />}
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Box
                    py="md"
                    px="xs"
                    style={{
                        borderRadius: theme.radius.sm,
                        background: `linear-gradient(45deg, ${theme.colors.blue[6]}, ${theme.colors.cyan[6]})`,
                        marginBottom: theme.spacing.lg
                    }}
                >
                    <Group justify="center">
                        <ThemeIcon radius="xl" size="md" variant="filled" color="blue">
                            <IconArticle size="1rem" />
                        </ThemeIcon>
                        <Text fw={700} size="md" c="white">Admin Panel</Text>
                    </Group>
                </Box>

                <Stack gap={5}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            leftSection={
                                <ThemeIcon color={item.active ? 'blue' : 'gray'} variant="light" size={30} radius="xl">
                                    <item.icon size="1rem" />
                                </ThemeIcon>
                            }
                            label={item.label}
                            active={item.active}
                            variant={item.active ? 'filled' : 'light'}
                            onClick={() => item.href && router.push(item.href)}
                        />
                    ))}
                </Stack>

                <Box style={{ marginTop: 'auto', paddingTop: theme.spacing.sm }}>
                    <Divider my="sm" />
                    <Group justify="space-between">
                        <Group>
                            <Avatar radius="xl" size="md" color="blue">YN</Avatar>
                            <Box>
                                <Text size="sm" fw={500}>山田直樹</Text>
                                <Text size="xs" c="dimmed">admin@example.com</Text>
                            </Box>
                        </Group>
                        <ActionIcon variant="subtle" color="gray">
                            <IconLogout size="1.2rem" stroke={1.5} />
                        </ActionIcon>
                    </Group>
                </Box>
            </AppShell.Navbar>

            <AppShell.Main>
                <Box mb={30} mt={10}>
                    <Group justify="space-between" mb="xl">
                        <Title order={2}>記事管理</Title>
                        <Button
                            leftSection={<IconPlus size="1rem" />}
                            onClick={navigateToCreate}
                        >
                            新規記事作成
                        </Button>
                    </Group>

                    <Paper withBorder shadow="xs" radius="md" p="md">
                        <Box pos="relative" style={{ minHeight: '300px' }}>
                            <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

                            <Table striped highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>タイトル</Table.Th>
                                        <Table.Th>カテゴリー</Table.Th>
                                        <Table.Th>著者</Table.Th>
                                        <Table.Th>公開日</Table.Th>
                                        <Table.Th style={{ width: '100px' }}>いいね</Table.Th>
                                        <Table.Th style={{ width: '100px' }}>コメント</Table.Th>
                                        <Table.Th style={{ width: '100px' }}>操作</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {articles.length === 0 && !loading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={7}>
                                                <Text ta="center" py="md">記事がありません</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        articles.map((article) => (
                                            <Table.Tr key={article.id}>
                                                <Table.Td>{article.title}</Table.Td>
                                                <Table.Td>{article.category?.name || '-'}</Table.Td>
                                                <Table.Td>{article.author?.name || '-'}</Table.Td>
                                                <Table.Td>{formatDate(article.published_at)}</Table.Td>
                                                <Table.Td ta="center">{article.likes_count}</Table.Td>
                                                <Table.Td ta="center">{article.comments_count}</Table.Td>
                                                <Table.Td>
                                                    <Menu shadow="md" width={200}>
                                                        <Menu.Target>
                                                            <ActionIcon>
                                                                <IconDotsVertical size="1rem" />
                                                            </ActionIcon>
                                                        </Menu.Target>

                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                leftSection={<IconEdit size={14} />}
                                                                onClick={() => navigateToEdit(article.id)}
                                                            >
                                                                編集
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                leftSection={<IconTrash size={14} />}
                                                                color="red"
                                                                onClick={() => handleDeleteClick(article.id)}
                                                            >
                                                                削除
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </Paper>
                </Box>
            </AppShell.Main>

            {/* 削除確認モーダル */}
            <Modal opened={opened1} onClose={closeDeleteModal} title="記事の削除" centered>
                <Text mb="md">この記事を削除してもよろしいですか？この操作は元に戻せません。</Text>
                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={closeDeleteModal}>キャンセル</Button>
                    <Button color="red" onClick={confirmDelete}>削除する</Button>
                </Group>
            </Modal>
        </AppShell>
    );
}