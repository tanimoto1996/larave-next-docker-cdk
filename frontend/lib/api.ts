import axiosClient from 'axios'; // axiosClient は既にあるはず

export const getUser = async () => {
    try {
        const response = await axiosClient.get('/user');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error; // 認証エラーがあれば throw して、ダッシュボードからログイン画面へ飛ばす
    }
};
