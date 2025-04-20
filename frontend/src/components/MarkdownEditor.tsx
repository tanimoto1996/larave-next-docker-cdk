'use client';

import { useState } from 'react';
import { Box, Tabs, Textarea, Paper } from '@mantine/core';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  minRows = 10,
  placeholder = 'マークダウンで記事を書いてください...',
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string | null>('edit');

  return (
    <Box>
      <Tabs value={activeTab} onChange={setActiveTab} mb="xs">
        <Tabs.List>
          <Tabs.Tab value="edit">編集</Tabs.Tab>
          <Tabs.Tab value="preview">プレビュー</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Box style={{ display: activeTab === 'edit' ? 'block' : 'none' }}>
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          autosize
          minRows={minRows}
          styles={{
            input: {
              fontFamily: 'monospace',
            },
          }}
        />
      </Box>

      <Box style={{ display: activeTab === 'preview' ? 'block' : 'none' }}>
        <Paper p="md" withBorder>
          <MarkdownRenderer content={value} />
        </Paper>
      </Box>
    </Box>
  );
}