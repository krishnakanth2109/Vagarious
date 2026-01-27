import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, User, Bell, Lock, Shield } from "lucide-react";

const Settings = () => {
  return (
    <AdminLayout title="System Settings">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid grid-cols-1 xl:grid-cols-3 gap-8"
      >
        
        {/* Sidebar Navigation for Settings */}
        <div className="xl:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <nav className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
                        <User size={18} /> Profile Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium">
                        <Bell size={18} /> Notifications
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium">
                        <Lock size={18} /> Security
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium">
                        <Shield size={18} /> Roles & Permissions
                    </button>
                </nav>
            </div>
        </div>

        {/* Main Form Area */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Profile Section */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <User className="text-blue-500" size={20}/> General Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">First Name</label>
                        <input type="text" defaultValue="Admin" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Last Name</label>
                        <input type="text" defaultValue="User" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <input type="email" defaultValue="admin@vgs.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Bio</label>
                        <textarea className="w-full h-24 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" defaultValue="Super Administrator for VGS Recruitment Portal." />
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Bell className="text-blue-500" size={20}/> Email Preferences
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-800">New Application Alerts</p>
                            <p className="text-xs text-gray-500">Get notified when a candidate applies.</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-800">System Updates</p>
                            <p className="text-xs text-gray-500">Receive changelogs and maintenance alerts.</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium shadow-lg">
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default Settings;