import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, Bell, Lightbulb,
    Plus, X, Loader2, LogOut, Hash,
    ChevronLeft, ChevronRight, CheckCircle2, Trash2, Pencil
} from 'lucide-react';

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [tip, setTip] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newCompany, setNewCompany] = useState({ name: '', inn: '', is_nds_payer: false });
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [completedReports, setCompletedReports] = useState({});

    const [isEditing, setIsEditing] = useState(false); // Tahrirlash rejimini aniqlash
    const [editId, setEditId] = useState(null); // Qaysi firma tahrirlanayotganini saqlash

    const navigate = useNavigate();

    // --- PAGINATION STATE ---
    const [reportPage, setReportPage] = useState(1);
    const [companyPage, setCompanyPage] = useState(1);
    const itemsPerPage = 3;

    const fetchData = async () => {
        try {
            const [reportRes, companyRes, tipRes, statusRes] = await Promise.all([
                api.get('my-reports/'),
                api.get('companies/'),
                api.get('daily-tip/'),
                api.get('report-status/')
            ]);

            setReports(reportRes.data || []);
            setCompanies(companyRes.data || []);
            setTip(tipRes.data.tip || '');

            const statusMap = {};
            statusRes.data.forEach(item => {
                statusMap[`${item.company}-${item.report_name}`] = item.is_completed;
            });
            setCompletedReports(statusMap);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- DELETE COMPANY ---
    const handleDeleteCompany = async (e, companyId) => {
        e.stopPropagation();
        if (window.confirm("Haqiqatan ham bu firmani o'chirib tashlamoqchimisiz?")) {
            try {
                await api.delete(`companies/${companyId}/`);
                fetchData();
            } catch (error) {
                alert("O'chirishda xatolik yuz berdi.");
            }
        }
    };

    // --- STATUS TOGGLE ---
    const toggleReportStatus = async (companyId, reportName) => {
        const key = `${companyId}-${reportName}`;
        const newValue = !completedReports[key];

        setCompletedReports(prev => ({ ...prev, [key]: newValue }));

        try {
            await api.post('report-status/', {
                company: companyId,
                report_name: reportName,
                is_completed: newValue
            });
        } catch (error) {
            console.error("Statusni saqlashda xato:", error);
        }
    };

    // --- URGENCY LOGIC ---
    const getUrgencyClass = (deadlineText) => {
        if (!deadlineText) return 'border-blue-50 bg-white text-slate-800';
        const today = new Date();
        const dayOfMonth = today.getDate();
        const match = deadlineText.match(/\d+/);
        if (!match) return 'border-blue-50 bg-white text-slate-800';
        const deadlineDay = parseInt(match[0]);

        if (dayOfMonth > deadlineDay) return 'border-red-100 bg-red-50 text-red-900';
        if (deadlineDay - dayOfMonth <= 3) return 'border-orange-100 bg-orange-50 text-orange-900';
        return 'border-blue-50 bg-white text-slate-800';
    };

    // --- DYNAMIC REPORTS LOGIC ---
    const getCompanyReports = (company) => {
        if (!company) return [];
        const base = [
            { name: "JSHDS va Ijtimoiy soliq", deadline: "Har oyning 15-sanasigacha", icon: "👤" },
            { name: "NPS (Pensiya) hisoboti", deadline: "Har oyning 15-sanasigacha", icon: "💰" },
            { name: "1-Stat (Yillik)", deadline: "Yilda 1 marta", icon: "📊" },
            { name: "4-Stat (Choraklik)", deadline: "Har chorakda", icon: "📈" },
        ];
        if (company.is_nds_payer) {
            base.push({ name: "QQS (NDS) hisoboti", deadline: "Har oyning 20-sanasigacha", icon: "📉" });
            base.push({ name: "Foyda solig'i", deadline: "Har 3 oyda (Choraklik)", icon: "🏦" });
        } else {
            base.push({ name: "Aylanmadan olinadigan soliq", deadline: "Har 3 oyda (Choraklik)", icon: "🔄" });
        }
        base.push({ name: "1-2 Shakl (Balans)", deadline: "Choraklik / Yillik", icon: "⚖️" });
        return base;
    };

    const currentReports = reports.slice((reportPage - 1) * itemsPerPage, reportPage * itemsPerPage);
    const currentCompanies = companies.slice((companyPage - 1) * itemsPerPage, companyPage * itemsPerPage);


    const openEditModal = (e, company) => {
    e.stopPropagation(); // Card bosilib ketmasligi uchun
    setIsEditing(true);
    setEditId(company.id);
    setNewCompany({
        name: company.name,
        inn: company.inn,
        is_nds_payer: company.is_nds_payer
    });
    setShowModal(true);
};

// Modal yopilganda hamma narsani tozalash uchun funksiya
    const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setNewCompany({ name: '', inn: '', is_nds_payer: false });
};

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (isEditing) {
            // Tahrirlash (PATCH so'rovi)
            await api.patch(`companies/${editId}/`, newCompany);
        } else {
            // Yangi firma qo'shish (POST so'rovi)
            await api.post('companies/', newCompany);
        }
        closeModal(); // Modalni yopish va tozalash
        fetchData();  // Ma'lumotlarni yangilash
    } catch (error) {
        console.error("Xatolik:", error);
        alert(isEditing ? "Tahrirlashda xatolik!" : "STIR xato yoki allaqachon mavjud!");
    }
};

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-2xl p-6 hidden md:flex flex-col justify-between border-r border-blue-50">
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2 text-blue-600">
                        <LayoutDashboard size={28} />
                        <h1 className="font-bold text-slate-800 text-xl">AccoAssistant</h1>
                    </div>
                    <nav className="space-y-2">
                        <div onClick={() => { setActiveTab('dashboard'); setSelectedCompany(null); }} className={`flex items-center gap-3 p-4 rounded-[20px] font-bold cursor-pointer transition-all ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard size={20} /> Dashboard</div>
                        <div onClick={() => { setActiveTab('firms'); setSelectedCompany(null); }} className={`flex items-center gap-3 p-4 rounded-[20px] font-bold cursor-pointer transition-all ${activeTab === 'firms' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}><Building2 size={20} /> Firmalarim</div>
                    </nav>
                </div>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-3 text-red-400 hover:bg-red-50 p-4 rounded-[20px] transition-all font-medium"><LogOut size={20} /> Chiqish</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{selectedCompany ? 'Firma Tafsilotlari' : (activeTab === 'dashboard' ? 'Dashboard' : 'Firmalarim')}</h2>
                    <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[22px] shadow-xl flex items-center gap-2 font-bold"><Plus size={20} /> YANGI FIRMA</button>
                </header>

                {activeTab === 'dashboard' ? (
                    /* --- DASHBOARD VIEW --- */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-bold text-slate-700 ml-2">Yaqinlashayotgan hisobotlar</h3>
                            {reports.length === 0 ? (
                                <div className="bg-white p-20 rounded-[45px] text-center border-2 border-dashed border-blue-100 text-slate-400">Hozircha hisobotlar yo'q.</div>
                            ) : (
                                <>
                                    <div className="grid gap-5">
                                        {currentReports.map((report) => (
                                            <div key={report.id} className="bg-white p-7 rounded-[35px] shadow-sm border border-blue-50 flex items-center justify-between hover:shadow-xl transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="bg-blue-50 p-4 rounded-[22px] text-blue-600"><Bell size={24} /></div>
                                                    <div><h4 className="font-bold text-slate-700 text-lg">{report.report_type}</h4><p className="text-sm text-slate-400 italic">{report.company_name}</p></div>
                                                </div>
                                                <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 font-black text-slate-700">{report.deadline}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-center gap-4 mt-8">
                                        <button onClick={() => setReportPage(p => Math.max(1, p - 1))} disabled={reportPage === 1} className="p-3 rounded-2xl bg-white border border-blue-100 text-blue-600 disabled:opacity-30"><ChevronLeft size={24} /></button>
                                        <span className="font-bold text-slate-600">Sahifa {reportPage} / {Math.ceil(reports.length / itemsPerPage)}</span>
                                        <button onClick={() => setReportPage(p => p + 1)} disabled={reportPage * itemsPerPage >= reports.length} className="p-3 rounded-2xl bg-white border border-blue-100 text-blue-600 disabled:opacity-30"><ChevronRight size={24} /></button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="bg-gradient-to-br from-violet-400 to-fuchsia-500 p-10 rounded-[45px] text-white shadow-2xl h-fit relative overflow-hidden">
                            <Lightbulb className="absolute -right-8 -top-8 text-white opacity-20" size={150} />
                            <p className="text-purple-100 text-xs font-black uppercase mb-4 tracking-widest">Kun maslahati</p>
                            <p className="text-2xl font-semibold leading-snug italic">"{tip || "Soliq qonunchiligiga rioya qiling."}"</p>
                        </div>
                    </div>
                ) : selectedCompany ? (
                    /* --- DETAIL VIEW --- */
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <button onClick={() => setSelectedCompany(null)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all bg-white px-6 py-3 rounded-2xl shadow-sm"><ChevronLeft size={20} /> ORQAGA QAYTISH</button>
                        <div className="bg-white p-10 rounded-[45px] shadow-xl border border-blue-50">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div><h2 className="text-4xl font-black text-slate-800 mb-2">{selectedCompany.name}</h2><p className="text-lg text-slate-400 font-medium italic">STIR: {selectedCompany.inn}</p></div>
                                <div className={`px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest ${selectedCompany.is_nds_payer ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{selectedCompany.is_nds_payer ? 'NDS TO\'LOVCHI' : 'AYLANMA SOLIQ'}</div>
                            </div>
                            <hr className="my-10 border-slate-100" />
                            <h3 className="text-2xl font-bold text-slate-700 mb-6 ml-2">Majburiy hisobotlar holati:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {getCompanyReports(selectedCompany).map((rep, index) => {
                                    const isDone = completedReports[`${selectedCompany.id}-${rep.name}`];
                                    const urgency = !isDone ? getUrgencyClass(rep.deadline) : 'bg-green-50 border-green-200 text-green-900';
                                    return (
                                        <div key={index} onClick={() => toggleReportStatus(selectedCompany.id, rep.name)} className={`p-8 rounded-[35px] border-2 transition-all cursor-pointer relative overflow-hidden group ${urgency} ${!isDone && 'hover:shadow-xl'}`}>
                                            <div className={`absolute top-6 right-6 transition-all ${isDone ? 'text-green-500 scale-110' : 'text-slate-200'}`}><CheckCircle2 size={28} /></div>
                                            <div className="text-4xl mb-4">{rep.icon}</div>
                                            <h4 className="font-bold text-lg mb-2">{rep.name}</h4>
                                            <p className="text-xs font-black uppercase mb-1 opacity-70">{isDone ? 'Muvaffaqiyatli topshirildi' : (urgency.includes('red') ? 'MUDDAT O\'TDI!' : 'MUDDAT:')}</p>
                                            {!isDone && <p className="text-sm font-medium opacity-60">{rep.deadline}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- FIRMS LIST VIEW --- */
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companies.length === 0 ? (
                                <div className="col-span-full bg-white p-20 rounded-[45px] text-center border-2 border-dashed border-blue-100 text-slate-400">Hech qanday firma qo'shilmagan.</div>
                            ) : (
                                currentCompanies.map((company) => (
                                    <div key={company.id} onClick={() => setSelectedCompany(company)} className="bg-white p-8 rounded-[40px] shadow-sm border border-blue-50 hover:shadow-xl transition-all cursor-pointer relative group">
                                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
{/*                                             <button onClick={(e) => handleDeleteCompany(e, company.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button> */}
                                        </div>
                                        {/* FIRMS LIST VIEW dagi mapping ichida */}
<div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
    {/* EDIT TUGMASI */}
    <button
        onClick={(e) => openEditModal(e, company)}
        className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
    >
        <Pencil size={18} />
    </button>

    <button
        onClick={(e) => handleDeleteCompany(e, company.id)}
        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
    >
        <Trash2 size={18} />
    </button>
</div>

                                        <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center text-blue-600 mb-6"><Building2 size={32} /></div>
                                        <h4 className="text-xl font-bold text-slate-800 mb-2">{company.name}</h4>
                                        <div className="flex items-center gap-2 text-slate-400 mb-4 font-medium italic"><Hash size={16} /> STIR: {company.inn}</div>
                                        <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${company.is_nds_payer ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{company.is_nds_payer ? 'NDS TO\'LOVCHI' : 'AYLANMA SOLIQ'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        {companies.length > itemsPerPage && (
                            <div className="flex items-center justify-center gap-4 mt-12">
                                <button onClick={() => setCompanyPage(p => Math.max(1, p - 1))} disabled={companyPage === 1} className="p-4 rounded-2xl bg-white border border-blue-100 text-blue-600 disabled:opacity-30 transition-all hover:bg-blue-50"><ChevronLeft size={24} /></button>
                                <div className="flex gap-2">
                                    {[...Array(Math.ceil(companies.length / itemsPerPage))].map((_, i) => (
                                        <button key={i} onClick={() => setCompanyPage(i + 1)} className={`w-12 h-12 rounded-2xl font-bold transition-all ${companyPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border border-blue-50 hover:bg-blue-50'}`}>{i + 1}</button>
                                    ))}
                                </div>
                                <button onClick={() => setCompanyPage(p => p + 1)} disabled={companyPage * itemsPerPage >= companies.length} className="p-4 rounded-2xl bg-white border border-blue-100 text-blue-600 disabled:opacity-30 transition-all hover:bg-blue-50"><ChevronRight size={24} /></button>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl relative">
            <button onClick={closeModal} className="absolute right-8 top-8 text-slate-300"><X size={28} /></button>

            {/* Dinamik sarlavha */}
            <h3 className="text-2xl font-black text-slate-800 mb-8">
                {isEditing ? "Firmani tahrirlash" : "Firma qo'shish"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    className="w-full p-5 bg-slate-50 rounded-[22px] outline-none border border-slate-100 focus:border-blue-400 transition-all"
                    placeholder="Firma nomi"
                    value={newCompany.name} // State-ga bog'ladik
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                    required
                />
                <input
                    className="w-full p-5 bg-slate-50 rounded-[22px] outline-none border border-slate-100 focus:border-blue-400 transition-all"
                    placeholder="STIR (INN)"
                    value={newCompany.inn} // State-ga bog'ladik
                    onChange={(e) => setNewCompany({...newCompany, inn: e.target.value})}
                    required
                />
                <div className="flex items-center gap-3 p-5 bg-blue-50 rounded-[22px] border border-blue-100">
                    <input
                        type="checkbox"
                        id="nds_check"
                        className="w-6 h-6 accent-blue-600"
                        checked={newCompany.is_nds_payer} // State-ga bog'ladik
                        onChange={(e) => setNewCompany({...newCompany, is_nds_payer: e.target.checked})}
                    />
                    <label htmlFor="nds_check" className="text-sm font-bold text-blue-800 cursor-pointer">NDS to'lovchimi?</label>
                </div>

                {/* Dinamik tugma matni */}
                <button className="w-full bg-blue-600 text-white p-5 rounded-[22px] font-black uppercase tracking-widest active:scale-95 transition-all">
                    {isEditing ? "O'ZGARISHLARNI SAQLASH" : "SAQLASH"}
                </button>
            </form>
        </div>
    </div>
)}
            </div>
        </div>
    );
};

export default Dashboard;