import axios from 'axios';

// ブラウザ環境かどうかを判定
const isBrowser = typeof window !== 'undefined';

// 環境に応じたAPIのベースURLを設定
const getApiBaseUrl = () => {
    // ブラウザで実行されている場合
    if (isBrowser) {
        // 現在のホスト名に基づいてAPIのURLを決定
        const hostname = window.location.hostname;

        // localhostまたは192.168.*などの場合は開発環境とみなす
        if (hostname === 'localhost' || hostname.match(/^192\.168\./)) {
            return 'http://localhost:8000';
        }

        // その他の場合は本番環境のAPIを使用
        return process.env.NEXT_PUBLIC_API_URL || 'https://api.visionaryfuture.shop';
    }

    // サーバーサイドレンダリング時
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const axiosClient = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default axiosClient;