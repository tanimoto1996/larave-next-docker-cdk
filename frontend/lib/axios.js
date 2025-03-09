import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    withXSRFToken: true, // これを追加
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export default axiosClient;
