'use client';

import { Container, Group, Text } from '@mantine/core';

export function FooterSection() {
    return (
        <footer style={{
            height: '60px',
            borderTop: '1px solid #e9ecef',
            padding: '1rem',
            marginTop: 'auto',
            backgroundColor: 'white'
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