import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Users, Briefcase, FileCheck, TrendingUp, MoreHorizontal, LucideIcon } from "lucide-react";
import axios from "axios";

// 1. IMPORT API URL FROM ENV
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ... Interfaces remain the same ...
interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
}

interface ActivityItemProps {
  name: string;
  action: string;
  target: string;
  time: string;
}

interface TableRowProps {
  name: string;
  role: string;
  date: string;
  status: string;
  statusColor: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  // State for real data
  const [jobCount, setJobCount] = useState("0");
  const [loading, setLoading] = useState(true);

  // 2. FETCH REAL DATA USING ENV VARIABLE
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetches jobs from http://localhost:5000/api/jobs
        const response = await axios.get(`${API_URL}/jobs`);
        setJobCount(response.data.length.toString());
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout title="Overview">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Candidates" 
            value="2,543" 
            trend="+12%" 
            icon={Users} 
            color="bg-blue-500" 
          />
          
          {/* REAL DATA CARD */}
          <StatCard 
            title="Active Jobs" 
            value={loading ? "..." : jobCount} 
            trend="+5%" 
            icon={Briefcase} 
            color="bg-purple-500" 
          />
          
          <StatCard 
            title="Placements" 
            value="128" 
            trend="+18%" 
            icon={FileCheck} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Engagement" 
            value="89%" 
            trend="+2%" 
            icon={TrendingUp} 
            color="bg-orange-500" 
          />
        </div>

        {/* ... Rest of the charts and tables (static for now) ... */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div variants={item} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800">Recruitment Activity</h3>
                    <select className="bg-gray-50 border-none text-sm text-gray-500 rounded-lg p-2 outline-none">
                        <option>This Week</option>
                    </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                    {[65, 40, 75, 55, 90, 35, 80].map((h, i) => (
                        <div key={i} className="w-full bg-gray-50 rounded-t-lg relative group h-full flex items-end">
                             <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-full bg-blue-600 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity relative"
                             >
                             </motion.div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Recent Activity</h3>
                <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                    <ActivityItem name="Sarah Smith" action="applied for" target="Senior React Dev" time="2m ago" />
                    <ActivityItem name="TechCorp Inc." action="posted new job" target="Product Manager" time="1h ago" />
                </div>
            </motion.div>
        </div>

        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Recent Applications</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase">
                            <th className="px-6 py-4 font-semibold">Candidate</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <TableRow name="Alice Cooper" role="UI Designer" date="Oct 24, 2023" status="Reviewing" statusColor="text-yellow-600 bg-yellow-50" />
                        <TableRow name="Bob Marley" role="Backend Dev" date="Oct 23, 2023" status="Interview" statusColor="text-purple-600 bg-purple-50" />
                    </tbody>
                </table>
            </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

// ... Helper Components (StatCard, ActivityItem, TableRow) remain exactly the same as previous response ...
const StatCard = ({ title, value, trend, icon: Icon, color }: StatCardProps) => (
    <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h4 className="text-3xl font-bold text-gray-800 mt-2">{value}</h4>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon size={24} className={`${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-500 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
            <span className="text-gray-400 ml-2">vs last month</span>
        </div>
    </motion.div>
);

const ActivityItem = ({ name, action, target, time }: ActivityItemProps) => (
    <div className="flex gap-4">
        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
        <div>
            <p className="text-sm text-gray-800">
                <span className="font-semibold">{name}</span> {action} <span className="text-blue-600">{target}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
    </div>
);

const TableRow = ({ name, role, date, status, statusColor }: TableRowProps) => (
    <tr className="hover:bg-gray-50/50 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{name[0]}</div>
                <span className="font-medium text-gray-700">{name}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">{role}</td>
        <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
        <td className="px-6 py-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
                {status}
            </span>
        </td>
    </tr>
);

export default Dashboard;