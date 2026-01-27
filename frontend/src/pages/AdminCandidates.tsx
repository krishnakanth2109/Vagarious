import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Search, Filter, Download, Eye, Trash2 } from "lucide-react";

const AdminCandidates = () => {
  // Mock Data
  const candidates = [
    { id: 1, name: "Alice Johnson", role: "Frontend Developer", date: "2023-10-24", status: "Interview", avatar: "A" },
    { id: 2, name: "Robert Smith", role: "Product Manager", date: "2023-10-23", status: "New", avatar: "R" },
    { id: 3, name: "Karen Davis", role: "UX Designer", date: "2023-10-22", status: "Shortlisted", avatar: "K" },
    { id: 4, name: "Michael Wilson", role: "Backend Engineer", date: "2023-10-21", status: "Rejected", avatar: "M" },
    { id: 5, name: "James Brown", role: "DevOps Engineer", date: "2023-10-20", status: "Hired", avatar: "J" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AdminLayout title="Admin Candidates View">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search candidates..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                    <Filter size={18} /> <span>Filters</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                    <Download size={18} /> <span>Export</span>
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Candidate</th>
                        <th className="px-6 py-4">Applied Role</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {candidates.map((c) => (
                        <motion.tr key={c.id} variants={item} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm">
                                        {c.avatar}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{c.name}</p>
                                        <p className="text-xs text-gray-500">view profile</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">{c.role}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{c.date}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                    ${c.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' : ''}
                                    ${c.status === 'New' ? 'bg-blue-100 text-blue-700' : ''}
                                    ${c.status === 'Interview' ? 'bg-amber-100 text-amber-700' : ''}
                                    ${c.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                                    ${c.status === 'Shortlisted' ? 'bg-purple-100 text-purple-700' : ''}
                                `}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={18} /></button>
                                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminCandidates;