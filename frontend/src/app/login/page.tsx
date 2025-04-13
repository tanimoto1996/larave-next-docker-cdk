'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    TextInput,
    PasswordInput,
    Paper,
    Title,
    Container,
    Button,
    Text,
    Group,
    Stack,
    ThemeIcon,
    Alert,
    Center,
} from '@mantine/core';
import { IconAt, IconLock, IconAlertCircle, IconShieldLock, IconInfoCircle } from '@tabler/icons-react';
import axiosClient from '../../../lib/axios';

type LoginCredentials = {
    email: string;
    password: string;
}

export default function Login() {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    } as const);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // URLからリダイレクト理由を取得
        const redirectReason = searchParams.get('redirectReason');

        if (redirectReason === 'session_expired') {
            setInfoMessage('セッションの有効期限が切れました。再度ログインしてください。');
        } else if (redirectReason === 'auth_required') {
            setInfoMessage('この機能を利用するにはログインが必要です。');
        } else if (redirectReason === 'unauthenticated') {
            setInfoMessage('ログインが必要なページです。認証情報を入力してください。');
        }
    }, [searchParams]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // CSRF Cookieの取得
            await axiosClient.get('/sanctum/csrf-cookie');

            // シンプルなオブジェクトでログイン
            const response = await axiosClient.post('/api/login', {
                email: credentials.email,
                password: credentials.password
            });

            console.log('ログイン成功:', response.data);
            router.push('/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error('ログインエラー:', err.message);
                setError('認証に失敗しました。メールアドレスとパスワードをご確認ください。');
            } else {
                console.error('不明なエラー:', err);
                setError('ログイン中に問題が発生しました。時間をおいて再度お試しください。');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={450} my={40}>

            <Paper
                radius="md"
                withBorder
                p={30}
                mt={30}
                shadow="md"
                style={{
                    background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.9))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #e9ecef'
                }}
            >
                <Center mb={20}>
                    <ThemeIcon size={60} radius="xl" variant="light" color="blue">
                        <IconShieldLock size={30} />
                    </ThemeIcon>
                </Center>

                <Title order={2} ta="center" mt="md" mb={30}>
                    管理画面へログイン
                </Title>

                {infoMessage && (
                    <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
                        <Text size="sm">{infoMessage}</Text>
                    </Alert>
                )}

                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
                        <Text size="sm">{error}</Text>
                    </Alert>
                )}

                <form onSubmit={handleLogin}>
                    <Stack>
                        <TextInput
                            required
                            label="メールアドレス"
                            placeholder="your@email.com"
                            size="md"
                            leftSection={<IconAt size={16} />}
                            name="email"
                            id="email"
                            value={credentials.email}
                            onChange={handleInputChange}
                        />

                        <PasswordInput
                            required
                            label="パスワード"
                            placeholder="パスワードを入力"
                            size="md"
                            leftSection={<IconLock size={16} />}
                            name="password"
                            id="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                        />
                    </Stack>

                    <Group justify="space-between" mt="lg">
                        <Text size="sm" c="dimmed" component="a" href="#" style={{ cursor: 'pointer' }}>
                            パスワードをお忘れですか？
                        </Text>
                    </Group>

                    <Button
                        fullWidth
                        mt="xl"
                        size="md"
                        type="submit"
                        loading={loading}
                        variant="gradient"
                        gradient={{ from: '#6b78e5', to: '#49b2e9', deg: 45 }}
                    >
                        ログイン
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}