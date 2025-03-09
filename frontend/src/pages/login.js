import { useState } from 'react';
import { useRouter } from 'next/router';
import axiosClient from '../../lib/axios'; // withCredentials: true が設定されている

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter(); // ✅ useRouter を追加

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // CSRF Cookie の取得
            await axiosClient.get('/sanctum/csrf-cookie');

            // ログインリクエスト
            const response = await axiosClient.post('/login', { email, password });
            console.log('Logged in successfully:', response.data);

            // ✅ ログイン成功時にダッシュボードへリダイレクト
            router.push('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            alert('ログインに失敗しました');
        }
    };

    return (
        <div>
            <h1>ログイン</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type='submit'>ログイン</button>
            </form>
        </div>
    );
}
