'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '../../../lib/axios';

type LoginCredentials = {
    email: string;
    password: string;
}

export default function Login() {

    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    } as const);

    const router = useRouter();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        try {
            // CSRF Cookieの取得
            await axiosClient.get('/sanctum/csrf-cookie');

            // シンプルなオブジェクトでログイン
            const response = await axiosClient.post('/login', {
                email: credentials.email,
                password: credentials.password
            });

            console.log('ログイン成功:', response.data);
            router.push('/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error('ログインエラー:', err.message);
            } else {
                console.error('不明なエラー:', err);
            }
            alert('ログインに失敗しました');
        }
    };

    // JSXを返す（ReactコンポーネントのUI部分）
    return (
        <div>
            <h1>ログイン</h1>
            {/* onSubmitでフォーム送信イベントを処理 */}
            <form onSubmit={handleLogin}>
                <div>
                    {/* htmlForでラベルと入力を関連付け（アクセシビリティ向上） */}
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        name="email" // nameはhandleInputChangeで使用
                        type="email"
                        value={credentials.email} // 型付きオブジェクトからの値
                        onChange={handleInputChange} // 共通のイベントハンドラ
                        required // HTML5のバリデーション属性
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={credentials.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">ログイン</button>
            </form>
        </div>
    );
}