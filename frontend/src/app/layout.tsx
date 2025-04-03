import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { HeaderSection } from '../components/HeaderSection';
import { FooterSection } from '../components/FooterSection';

export const metadata = {
  title: 'ブログサイト',
  description: '記事とコンテンツのブログサイト',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <ColorSchemeScript />
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
            {children}
          </main>
          <FooterSection />
        </MantineProvider>
      </body>
    </html>
  );
}