import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('login/', { username, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            alert("Xush kelibsiz!");
            navigate('/dashboard'); // Login muvaffaqiyatli bo'lsa dashboardga o'tamiz
        } catch (error) {
            alert("Login yoki parol xato!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
            <div className="bg-white p-10 rounded-[30px] shadow-xl shadow-blue-100 w-full max-w-md border border-blue-50">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <LogIn className="text-blue-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-700">Tizimga kirish</h2>
                    <p className="text-slate-400 text-sm mt-2">Assistant to Accountants</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Foydalanuvchi nomi</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                            placeholder="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Parol</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                    >
                        Kirish
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-slate-500">
                    Hisobingiz yo'qmi? <span className="text-blue-500 cursor-pointer font-medium">Ro'yxatdan o'ting</span>
                </p>
            </div>
        </div>
    );
};

export default Login;