'use client';

import { useState, useEffect } from 'react';
import { ActionIcon, Text, Group, Tooltip } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { updateArticleLikes } from '../../lib/api';

interface LikeButtonProps {
  articleSlug: string;
  initialCount: number;
}

/**
 * いいねボタンコンポーネント
 * ローカルストレージを使用して、ユーザーがどの記事にいいねしたかを追跡します
 */
export default function LikeButton({ articleSlug, initialCount }: LikeButtonProps) {
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);

  // コンポーネントマウント時にローカルストレージからいいね状態を取得
  useEffect(() => {
    const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}');
    setIsLiked(!!likedArticles[articleSlug]);
  }, [articleSlug]);

  const handleLikeClick = async () => {
    try {
      // いいね状態を反転
      const newLikedState = !isLiked;

      // APIを呼び出していいね数を更新
      const response = await updateArticleLikes(articleSlug, newLikedState);

      // APIが成功した場合のみ、UI状態とローカルストレージを更新
      if (response.success) {
        setIsLiked(newLikedState);
        setLikesCount(response.data.likes_count);

        // ローカルストレージを更新
        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}');

        if (newLikedState) {
          likedArticles[articleSlug] = true;
        } else {
          delete likedArticles[articleSlug];
        }

        localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
      } else {
        console.error('いいねの更新に失敗しました:', response.error || 'サーバーエラー');
      }
    } catch (error: any) {
      console.error('いいねの更新に失敗しました', error);

      // 開発環境では詳細なエラー情報をコンソールに出力
      if (process.env.NODE_ENV === 'development') {
        if (error.response) {
          console.error('エラーレスポンス:', error.response.data);
          console.error('ステータスコード:', error.response.status);
        } else if (error.request) {
          console.error('リクエストエラー: 応答なし', error.request);
        } else {
          console.error('リクエスト設定エラー:', error.message);
        }
      }

      // UIに通知する代わりに、console.errorでログを残す
      // 将来的には通知コンポーネントを使ってユーザーに通知することも検討
    }
  };

  return (
    <Group gap={4}>
      <Tooltip label={isLiked ? 'いいねを取り消す' : 'いいねする'}>
        <ActionIcon
          variant="transparent"
          color={isLiked ? 'red' : 'gray'}
          onClick={handleLikeClick}
          aria-label="いいね"
        >
          {isLiked ? <IconHeartFilled size="1.2rem" /> : <IconHeart size="1.2rem" />}
        </ActionIcon>
      </Tooltip>
      <Text size="sm" color="dimmed">{likesCount}</Text>
    </Group>
  );
}