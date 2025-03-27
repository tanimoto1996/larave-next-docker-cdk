'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '../../../lib/api';
import React from 'react';

// ユーザー情報の型定義
interface User {
    name: string;
}

export default function DashboardPage(): React.ReactNode {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const data = await getUser();
                setUser(data as User);
            } catch (err) {
                console.error(err);
                // 認証エラー時はログイン画面へ
                router.push('/login');
            }
        })();
    }, [router]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>こんにちは、{user.name}さん</p>
        </div>
    );
}