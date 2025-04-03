// src/theme.ts
import { createTheme, MantineColorsTuple } from '@mantine/core';

const myColor: MantineColorsTuple = [
    '#e7f5ff',
    '#d0ebff',
    '#a5d8ff',
    '#74c0fc',
    '#4dabf7',
    '#339af0',
    '#228be6',
    '#1c7ed6',
    '#1971c2',
    '#1864ab',
];

export const theme = createTheme({
    primaryColor: 'blue',
    colors: {
        myColor,
        // その他のカスタムカラー
    },
    // その他のテーマ設定
});