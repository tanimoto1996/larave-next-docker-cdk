import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUser } from '../../lib/api';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const data = await getUser();
                setUser(data);
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
