import axiosClient from './axios';

/**
 * 管理者用API
 * 管理画面から利用する管理者向けAPIエンドポイントを提供します
 */

/**
 * CSRFトークンを取得する関数
 */
export const getCsrfToken = async () => {
    await axiosClient.get('/sanctum/csrf-cookie');
};

/**
 * 記事一覧を取得する（管理者用）
 * 
 * @param params - フィルタリングパラメータ
 * @returns 記事一覧データ
 */
export const getArticles = async (params = {}) => {
    try {
        const response = await axiosClient.get('/api/admin/articles', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch articles:', error);
        throw error;
    }
};

/**
 * 記事の詳細を取得する（管理者用）
 * 
 * @param id - 記事ID
 * @returns 記事の詳細データ
 */
export const getArticle = async (id: number) => {
    try {
        const response = await axiosClient.get(`/api/admin/articles/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch article with id: ${id}`, error);
        throw error;
    }
};

/**
 * 記事を新規作成する
 * 
 * @param articleData - 記事データ
 * @returns 作成された記事データ
 */
export const createArticle = async (articleData: FormData) => {
    try {
        const response = await axiosClient.post('/api/admin/articles', articleData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create article:', error);
        throw error;
    }
};

/**
 * 記事を更新する
 * 
 * @param id - 記事ID
 * @param articleData - 更新する記事データ
 * @returns 更新された記事データ
 */
export const updateArticle = async (id: number, articleData: FormData) => {
    try {
        // FormDataを使用する場合、Laravel側で_methodを見てPUTリクエストとして処理する
        articleData.append('_method', 'PUT');

        const response = await axiosClient.post(`/api/admin/articles/${id}`, articleData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to update article with id: ${id}`, error);
        throw error;
    }
};

/**
 * ログイン状態を確認する関数
 * @returns ログインユーザー情報
 */
export const checkAuthStatus = async () => {
    try {
        const response = await axiosClient.get('/api/user');
        return response.data;
    } catch (error) {
        console.error('認証エラー：ログインしていないかセッションが切れています', error);
        throw new Error('認証に失敗しました。再ログインが必要です。');
    }
};

/**
 * 記事を削除する
 * 
 * @param id - 削除する記事ID
 */
export const deleteArticle = async (id: number) => {
    try {
        // CSRFトークンを事前に取得
        await getCsrfToken();

        // 認証状態を確認
        await checkAuthStatus();

        // 記事削除リクエスト実行
        await axiosClient.delete(`/api/admin/articles/${id}`);
        return true;
    } catch (error) {
        console.error(`Failed to delete article with id: ${id}`, error);
        throw error;
    }
};

/**
 * 記事フォーム用のデータ（カテゴリーと著者一覧）を取得する
 * 
 * @returns カテゴリーと著者一覧
 */
export const getArticleFormData = async () => {
    try {
        const response = await axiosClient.get('/api/admin/articles/form-data');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch form data:', error);
        throw error;
    }
};

/**
 * コメント一覧を取得する（管理者用）
 * 
 * @param params - フィルタリングパラメータ
 * @returns コメント一覧
 */
export const getComments = async (params = {}) => {
    try {
        const response = await axiosClient.get('/api/admin/comments', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        throw error;
    }
};

/**
 * コメントを承認する
 * 
 * @param id - コメントID
 * @returns 承認されたコメント
 */
export const approveComment = async (id: number) => {
    try {
        const response = await axiosClient.put(`/api/admin/comments/${id}/approve`);
        return response.data;
    } catch (error) {
        console.error(`Failed to approve comment with id: ${id}`, error);
        throw error;
    }
};

/**
 * コメントを削除する
 * 
 * @param id - コメントID
 */
export const deleteComment = async (id: number) => {
    try {
        await axiosClient.delete(`/api/admin/comments/${id}`);
        return true;
    } catch (error) {
        console.error(`Failed to delete comment with id: ${id}`, error);
        throw error;
    }
};