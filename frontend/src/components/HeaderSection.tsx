'use client';

import { Container, Group, Text, ThemeIcon } from '@mantine/core';
import { IconPill } from '@tabler/icons-react';

export function HeaderSection() {
    return (
        <header style={{
            height: '70px',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 1000
        }}>
            <Container size="lg" style={{ display: 'flex', justifyContent: 'center' }}>
                {/* センターに配置したスタイリッシュなロゴ */}
                <Group gap={8}>
                    <ThemeIcon
                        size={36}
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: '#6b78e5', to: '#49b2e9', deg: 45 }}
                    >
                        <IconPill size={20} stroke={2} />
                    </ThemeIcon>
                    <Text
                        fw={700}
                        size="xl"
                        style={{
                            background: 'linear-gradient(45deg, #6b78e5 0%, #49b2e9 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Insights
                    </Text>
                </Group>
            </Container>
        </header>
    );
}