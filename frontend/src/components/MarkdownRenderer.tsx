'use client';

import { Box } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // コードハイライトとプラグインを動的に読み込む（クライアントサイドのみ）
  const [MarkdownComponents, setMarkdownComponents] = useState<any>({});
  
  useEffect(() => {
    // クライアントサイドでのみ実行する非同期インポート
    const loadComponents = async () => {
      try {
        // 必要なプラグインとコンポーネントを読み込む
        const [
          { Prism },
          { vscDarkPlus },
          remarkGfm,
          rehypeRaw
        ] = await Promise.all([
          import('react-syntax-highlighter'),
          import('react-syntax-highlighter/dist/cjs/styles/prism'),
          import('remark-gfm'),
          import('rehype-raw')
        ]);

        // ロードされたプラグインとコンポーネントをセットする
        setMarkdownComponents({
          SyntaxHighlighter: Prism,
          codeStyle: vscDarkPlus,
          remarkPlugins: [remarkGfm.default],
          rehypePlugins: [rehypeRaw.default],
          components: {
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <Prism
                  style={vscDarkPlus as any}
                  language={match[1]}
                  PreTag="div"
                  wrapLines={true}
                  wrapLongLines={true}
                  customStyle={{ 
                    wordWrap: 'break-word', 
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </Prism>
              ) : (
                <code className={className} style={{ 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }} {...props}>
                  {children}
                </code>
              );
            }
          }
        });
      } catch (error) {
        console.error('マークダウンコンポーネントの読み込みエラー:', error);
      }
    };

    loadComponents();
  }, []);

  return (
    <Box className={`markdown-content ${className || ''}`} style={{
      root: {
        // マークダウン内の全てのコード要素に対するスタイル
        '& pre, & code': {
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          maxWidth: '100%'
        }
      }
    }}>
      {/* プラグインとコンポーネントが読み込まれたら拡張機能付きのMarkdownを使用、それまではシンプルなMarkdown */}
      {Object.keys(MarkdownComponents).length > 0 ? (
        <ReactMarkdown
          remarkPlugins={MarkdownComponents.remarkPlugins}
          rehypePlugins={MarkdownComponents.rehypePlugins}
          components={MarkdownComponents.components}
        >
          {content}
        </ReactMarkdown>
      ) : (
        // プラグインが読み込まれるまでは最小限のマークダウン表示
        <ReactMarkdown>{content}</ReactMarkdown>
      )}
    </Box>
  );
}