'use client';

import { useState } from 'react';
import {
    AppShell,
    Burger,
    Text,
    Group,
    Avatar,
    Box,
    Button,
    SimpleGrid,
    Paper,
    Title,
    ThemeIcon,
    rem,
    Card,
    Stack,
    NavLink,
    Divider,
    useMantineTheme,
    ActionIcon,
    Tooltip,
    Badge
} from '@mantine/core';
import {
    IconHome2,
    IconGauge,
    IconDeviceDesktopAnalytics,
    IconUser,
    IconSettings,
    IconLogout,
    IconSun,
    IconMoonStars,
    IconBell,
    IconSearch,
    IconUsers,
    IconEye,
    IconHeart,
    IconCoin,
    IconChevronUp,
    IconChevronDown
} from '@tabler/icons-react';

// サイドバーのナビゲーションアイテム
const navItems = [
    { icon: IconHome2, label: 'ホーム', color: 'blue' },
    { icon: IconGauge, label: 'ダッシュボード', color: 'teal', active: true },
    { icon: IconDeviceDesktopAnalytics, label: '分析', color: 'violet' },
    { icon: IconUser, label: 'アカウント', color: 'orange' },
    { icon: IconSettings, label: '設定', color: 'gray' }
];

// 統計データ
const stats = [
    { title: '総訪問者数', value: '13.4K', diff: 10.1, icon: IconEye, color: 'blue' },
    { title: '新規登録', value: '4,325', diff: 18.2, icon: IconUsers, color: 'teal' },
    { title: 'エンゲージメント', value: '28.6%', diff: -2.3, icon: IconHeart, color: 'pink' },
    { title: '総収益', value: '¥120,230', diff: 12.5, icon: IconCoin, color: 'orange' }
];

// 最近のアクティビティ
const recentActivities = [
    { title: '新規ユーザー登録', time: '10分前', type: 'user' },
    { title: '投稿「AIの未来」が公開', time: '1時間前', type: 'post' },
    { title: 'システムアップデート完了', time: '3時間前', type: 'system' },
    { title: 'バックアップ作成', time: '昨日', type: 'backup' }
];

export default function Dashboard() {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

    const toggleColorScheme = () => {
        setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
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
                        <Text size="lg" fw={700}>ダッシュボード</Text>
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
                            <IconDeviceDesktopAnalytics size="1rem" />
                        </ThemeIcon>
                        <Text fw={700} size="md" c="white">Admin Panel</Text>
                    </Group>
                </Box>

                <Stack gap={5}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            leftSection={
                                <ThemeIcon color={item.color} variant="light" size={30} radius="xl">
                                    <item.icon size="1rem" />
                                </ThemeIcon>
                            }
                            label={item.label}
                            active={item.active}
                            variant="filled"
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
                    <Title order={2} mb="xl">サイト統計概要</Title>

                    <SimpleGrid
                        cols={{ base: 1, sm: 2, md: 4 }}
                        spacing="lg"
                    >
                        {stats.map((stat) => (
                            <Paper
                                key={stat.title}
                                radius="md"
                                withBorder
                                p="lg"
                                shadow="xs"
                            >
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed" fw={500}>
                                        {stat.title}
                                    </Text>
                                    <ThemeIcon
                                        color={stat.color}
                                        variant="light"
                                        radius="xl"
                                        size="xl"
                                    >
                                        <stat.icon size={rem(20)} />
                                    </ThemeIcon>
                                </Group>

                                <Group justify="space-between" align="flex-end" mt="md">
                                    <Text fw={700} size="xl">
                                        {stat.value}
                                    </Text>
                                    <Badge
                                        color={stat.diff > 0 ? 'teal' : 'red'}
                                        variant="light"
                                        leftSection={
                                            stat.diff > 0 ?
                                                <IconChevronUp size={rem(12)} style={{ marginBottom: 4 }} /> :
                                                <IconChevronDown size={rem(12)} style={{ marginBottom: 4 }} />
                                        }
                                    >
                                        {stat.diff > 0 ? '+' : ''}{stat.diff}%
                                    </Badge>
                                </Group>

                                <Text size="xs" c="dimmed" mt={7}>
                                    前回比較
                                </Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Box>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb={30}>
                    <Card withBorder shadow="xs" radius="md" padding="md">
                        <Card.Section withBorder inheritPadding py="xs">
                            <Group justify="space-between">
                                <Text fw={600}>直近の月別訪問者数</Text>
                                <Button size="xs" variant="light">詳細</Button>
                            </Group>
                        </Card.Section>

                        <Box h={250} mt="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text c="dimmed" ta="center">
                                訪問者グラフは現在準備中です
                            </Text>
                        </Box>
                    </Card>

                    <Card withBorder shadow="xs" radius="md" padding="md">
                        <Card.Section withBorder inheritPadding py="xs">
                            <Group justify="space-between">
                                <Text fw={600}>最近のアクティビティ</Text>
                                <Button size="xs" variant="light">すべて表示</Button>
                            </Group>
                        </Card.Section>

                        <Stack gap="xs" mt="md">
                            {recentActivities.map((activity, index) => (
                                <Box key={index}>
                                    <Group justify="space-between" align="flex-start">
                                        <Box>
                                            <Text size="sm" fw={500}>
                                                {activity.title}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {activity.time}
                                            </Text>
                                        </Box>
                                        <Badge
                                            size="sm"
                                            variant="dot"
                                            color={
                                                activity.type === 'user' ? 'blue' :
                                                    activity.type === 'post' ? 'green' :
                                                        activity.type === 'system' ? 'orange' : 'gray'
                                            }
                                        >
                                            {activity.type}
                                        </Badge>
                                    </Group>
                                    {index < recentActivities.length - 1 && <Divider mt="xs" />}
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </SimpleGrid>

                <Paper withBorder shadow="xs" radius="md" p="md" mb={30}>
                    <Group justify="space-between" mb="md">
                        <Title order={3}>クイックアクション</Title>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                        <Button variant="outline" leftSection={<IconDeviceDesktopAnalytics size="1rem" />}>
                            分析レポート
                        </Button>
                        <Button variant="outline" leftSection={<IconUsers size="1rem" />}>
                            ユーザー管理
                        </Button>
                        <Button variant="outline" leftSection={<IconSettings size="1rem" />}>
                            システム設定
                        </Button>
                    </SimpleGrid>
                </Paper>
            </AppShell.Main>
        </AppShell>
    );
}