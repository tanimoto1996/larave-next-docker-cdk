import axiosClient from '../lib/axios';

/**
 * ログイン中のユーザー情報を取得する
 */
export const getUser = async () => {
    try {
        const response = await axiosClient.get('/api/user');
        return response.data;
    } catch (error) {
        throw error; // 認証エラーがあれば throw して、ダッシュボードからログイン画面へ飛ばす
    }
};

/**
 * 公開済み記事の一覧を取得する
 */
export const getArticles = async () => {
    try {
        const response = await axiosClient.get('/api/articles');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch articles:', error);
        throw error;
    }
};

/**
 * 特定のスラグの記事詳細を取得する
 */
export const getArticleBySlug = async (slug: string) => {
    try {
        const response = await axiosClient.get(`/api/articles/${slug}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch article with slug: ${slug}`, error);
        throw error;
    }
};

/**
 * カテゴリー一覧を取得する
 */
export const getCategories = async () => {
    try {
        const response = await axiosClient.get('/api/categories');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
    }
};

/**
 * 記事のいいね数を更新する
 * 
 * @param string slug - 記事のスラグ
 * @param boolean isLiked - いいねを追加する場合はtrue、削除する場合はfalse
 * @returns 更新後のいいね数
 */
export const updateArticleLikes = async (slug: string, isLiked: boolean) => {
    try {
      const response = await axiosClient.post(`/api/articles/${slug}/likes`, { isLiked });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      // エラーログを詳細に記録
      if (error.response) {
        console.error(`APIエラー: ステータスコード ${error.response.status} - ${error.response.data?.message || 'エラーメッセージなし'}`);
        console.error('エラーレスポンス:', error.response);
        
        return {
          success: false,
          error: error.response.data?.message || 'APIエラーが発生しました'
        };
      } else if (error.request) {
        console.error('APIリクエストエラー: サーバーから応答がありません', error.request);
        return {
          success: false,
          error: 'サーバーから応答がありません'
        };
      } else {
        console.error('エラー:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    }
  };