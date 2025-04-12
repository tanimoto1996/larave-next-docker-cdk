import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { HeaderSection } from '../components/HeaderSection';
import { FooterSection } from '../components/FooterSection';
import { Providers } from './providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '知識の旅',
  description: '最新のトレンド、興味深い物語、専門家の洞察を発見するブログ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <title>知識の旅</title>
        <meta name="description" content="最新のトレンド、興味深い物語、専門家の洞察を発見するブログ" />
      </head>
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        margin: 0
      }}>
        <MantineProvider theme={theme}>
          <Notifications />
          <HeaderSection />
          <main style={{ flex: 1, padding: '1rem 0' }}>
            <Providers>{children}</Providers>
          </main>
          <FooterSection />
        </MantineProvider>
      </body>
    </html>
  );
}