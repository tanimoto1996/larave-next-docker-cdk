'use client';

import { Container, Group, Text, useMantineColorScheme } from '@mantine/core';
import { useEffect, useState } from 'react';

export function FooterSection() {
    // クライアントサイドレンダリングを確認するためのステート
    const [isClient, setIsClient] = useState(false);

    // コンポーネントがマウントされた後にクライアントサイドであることを確認
    useEffect(() => {
        setIsClient(true);
    }, []);

    // クライアント側のカラースキームを取得
    const { colorScheme } = useMantineColorScheme();

    return (
        <footer style={{
            height: '60px',
            borderTop: '1px solid #e9ecef',
            padding: '1rem',
            marginTop: 'auto',
            backgroundColor: isClient ? (colorScheme === 'dark' ? '#1A1B1E' : 'white') : 'white'
        }}>
            <Container size="lg">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">© 2025 ブログサイト. All rights reserved.</Text>
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">フォローする: Twitter | Facebook</Text>
                    </Group>
                </Group>
            </Container>
        </footer>
    );
}