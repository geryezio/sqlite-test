'use client';

import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function Home() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('USER');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, role }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage(`User ${data.data.name} berhasil ditambahkan!`);
                setName('');
                setEmail('');
                fetchUsers();
            } else {
                setMessage(`Gagal: ${data.error}`);
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: number) => {
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMessage(`User ID ${id} berhasil dihapus.`);
                fetchUsers();
            }
        } catch (err: any) {
            setMessage(`Error deleting user: ${err.message}`);
        }
    };

    const handleSeedData = async () => {
        setLoading(true);
        try {
            const samples = [
                { name: 'Andi Wijaya', email: `andi.${Date.now()}@example.com`, role: 'ADMIN' },
                { name: 'Dewi Lestari', email: `dewi.${Date.now()}@example.com`, role: 'USER' },
            ];

            for (const item of samples) {
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                });
            }
            setMessage('Sample data SQLite berhasil dimasukkan!');
            fetchUsers();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Apakah Anda yakin ingin mengosongkan tabel SQLite?')) return;
        try {
            await fetch('/api/users', { method: 'DELETE' });
            setMessage('Semua data berhasil dibersihkan dari database SQLite.');
            fetchUsers();
        } catch (err: any) {
            setMessage(`Error resetting: ${err.message}`);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="border-b border-slate-800 pb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
                            DB
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                Uji Coba SQLite + Prisma ORM
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Database File: <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400">prisma/dev.db</code> | Driver: <code className="bg-slate-900 px-2 py-0.5 rounded text-sky-400">better-sqlite3</code>
                            </p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
                        <span>{message}</span>
                        <button onClick={() => setMessage('')} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Input */}
                    <div className="md:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span>➕</span> Tambah User Baru
                        </h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="budi@example.com"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="SUPERADMIN">SUPERADMIN</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan ke SQLite'}
                            </button>
                        </form>

                        <hr className="border-slate-800" />

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={handleSeedData}
                                disabled={loading}
                                className="w-full bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 text-xs py-2 rounded-lg transition"
                            >
                                ⚡ Isi Data Contoh Otomatis
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="w-full bg-rose-950/40 hover:bg-rose-950 border border-rose-900 text-rose-300 text-xs py-2 rounded-lg transition"
                            >
                                🗑️ Reset Database (Kosongkan)
                            </button>
                        </div>
                    </div>

                    {/* Table / List View */}
                    <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span>📑</span> Data User di SQLite ({users.length})
                            </h2>
                            <button
                                onClick={fetchUsers}
                                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                            >
                                🔄 Refresh
                            </button>
                        </div>

                        {users.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
                                Belum ada data di database SQLite.<br />
                                Silakan tambah user baru atau klik <strong>⚡ Isi Data Contoh</strong>.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                                        <tr>
                                            <th className="py-3 px-3">ID</th>
                                            <th className="py-3 px-3">Nama</th>
                                            <th className="py-3 px-3">Email</th>
                                            <th className="py-3 px-3">Role</th>
                                            <th className="py-3 px-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-800/40 transition">
                                                <td className="py-3 px-3 font-mono text-xs text-slate-500">#{u.id}</td>
                                                <td className="py-3 px-3 font-medium text-white">{u.name}</td>
                                                <td className="py-3 px-3 text-slate-400 text-xs font-mono">{u.email}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                                        u.role === 'ADMIN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                                        u.role === 'SUPERADMIN' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                                                        'bg-slate-800 text-slate-300'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 px-2 py-1 rounded transition"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Technical Information Box */}
                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <span>💡</span> Cara Kerja SQLite di Proyek Ini:
                    </h3>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
                        <li><strong>Schema:</strong> Terdefinisi di <code className="text-slate-200">prisma/schema.prisma</code> (menggunakan model <code className="text-slate-200">User</code>).</li>
                        <li><strong>Driver:</strong> Menggunakan library <code className="text-slate-200">better-sqlite3</code> dengan adapter <code className="text-slate-200">@prisma/adapter-better-sqlite3</code> (Prisma 7).</li>
                        <li><strong>Client Instance:</strong> Dikelola secara singleton di <code className="text-slate-200">lib/prisma.ts</code>.</li>
                        <li><strong>Script Terminal:</strong> Anda juga bisa menjalankan uji coba terminal langsung via: <code className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded">docker compose exec app-test npx tsx scripts/test-sqlite.ts</code></li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
