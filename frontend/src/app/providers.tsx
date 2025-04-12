'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { ReactNode, useEffect, useState } from 'react';

// カスタムテーマを作成
const theme = createTheme({
    // 必要に応じてテーマの設定を追加
});

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // SSRでのレンダリング時には子コンポーネントのみを返す
        return <>{children}</>;
    }

    return (
        <MantineProvider theme={theme} defaultColorScheme="light">
            {children}
        </MantineProvider>
    );
}
