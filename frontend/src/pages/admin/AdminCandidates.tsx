import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Mail, Phone, MapPin, Briefcase, Eye, Trash2, X, 
  Calendar, User, Building2, Clock, FileText, Loader2, 
  ChevronRight, ArrowUpRight, Download, Info
} from "lucide-react";
import { format, isValid } from "date-fns";

// --- CONFIGURATION ---
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/candidates`;

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  currentCompany?: string;
  currentRole?: string;
  appliedJob: string;
  skills: string[] | string;
  preferredLocation: string;
  noticePeriod?: string;
  message?: string;
  submittedAt: string;
}

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      // Sort newest first
      const sorted = response.data.sort((a: Candidate, b: Candidate) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setCandidates(sorted);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load candidate data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this application? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
      toast.success("Record deleted successfully");
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.appliedJob.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "dd MMM yyyy, hh:mm a") : "N/A";
  };

  const renderSkills = (skills: string[] | string) => {
    const skillsArray = Array.isArray(skills) ? skills : (skills ? skills.split(',') : []);
    return (
      <div className="flex flex-wrap gap-1">
        {skillsArray.slice(0, 3).map((s, i) => (
          <Badge key={i} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-100">
            {s.trim()}
          </Badge>
        ))}
        {skillsArray.length > 3 && (
          <span className="text-[10px] text-slate-400 font-bold">+{skillsArray.length - 3}</span>
        )}
      </div>
    );
  };

  return (
    <AdminLayout title="Job Applications">
      <div className="space-y-6">
        
        {/* Header Stats & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Filter by name, job, or email..." 
              className="pl-10 h-11 bg-white border-slate-200 shadow-sm rounded-xl focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
            <User className="text-blue-500" size={18} />
            <span className="text-sm font-bold text-slate-700">Total Applications: {candidates.length}</span>
          </div>
        </div>

        {/* Desktop Table UI */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-slate-700 py-4">Submission Date</TableHead>
                <TableHead className="font-bold text-slate-700">Candidate Information</TableHead>
                <TableHead className="font-bold text-slate-700">Applying For</TableHead>
                <TableHead className="font-bold text-slate-700">Professional Status</TableHead>
                <TableHead className="font-bold text-slate-700">Notice Period</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                      <p className="text-slate-500 font-medium">Fetching applications...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                    No matching records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((c) => (
                  <TableRow key={c._id} className="hover:bg-blue-50/30 transition-colors group">
                    <TableCell className="text-xs font-semibold text-slate-500">
                      <div className="flex flex-col">
                        <span>{formatDate(c.submittedAt).split(',')[0]}</span>
                        <span className="text-[10px] opacity-60 font-normal">{formatDate(c.submittedAt).split(',')[1]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} className="text-slate-400" /> {c.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit text-blue-600 border-blue-200 bg-blue-50/50">
                          {c.appliedJob}
                        </Badge>
                        {renderSkills(c.skills)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{c.currentRole || "Fresher"}</span>
                        <span className="text-[11px] text-slate-500">{c.experience} yrs experience</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100">
                        {c.noticePeriod || "Immediate"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          onClick={() => setViewCandidate(c)}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDelete(c._id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- FULL DETAILS SLIDE-OVER / MODAL --- */}
      {viewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-2xl font-black">
                  {viewCandidate.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">{viewCandidate.name}</h2>
                  <p className="text-blue-300 font-bold flex items-center gap-2">
                    {viewCandidate.appliedJob} <ChevronRight size={14} /> Application #{(viewCandidate._id).slice(-6)}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setViewCandidate(null)}
              >
                <X size={24} />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto bg-slate-50/50">
              <div className="grid md:grid-cols-3 gap-8">
                
                {/* 1. Profile Sidebar */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} /> Contact Details
                    </h3>
                    <div className="space-y-3">
                      <div className="group cursor-pointer">
                        <p className="text-[10px] text-slate-400 font-bold">EMAIL ADDRESS</p>
                        <p className="text-sm font-bold text-slate-800 break-words">{viewCandidate.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">PHONE NUMBER</p>
                        <p className="text-sm font-bold text-slate-800">{viewCandidate.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">PREFERRED LOCATION</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          <MapPin size={14} className="text-red-500" /> {viewCandidate.preferredLocation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} /> Availablity
                    </h3>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">NOTICE PERIOD</p>
                      <p className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg w-fit mt-1">
                        {viewCandidate.noticePeriod || "Immediate Joiner"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Professional Content */}
                <div className="md:col-span-2 space-y-6">
                  {/* Experience Card */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Briefcase size={14} /> Work Experience
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">CURRENT/PREVIOUS ROLE</p>
                        <p className="text-lg font-black text-slate-900">{viewCandidate.currentRole || "Fresher"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">TOTAL EXPERIENCE</p>
                        <p className="text-lg font-black text-slate-900">{viewCandidate.experience} Years</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-400 font-bold">CURRENT COMPANY</p>
                        <p className="text-md font-bold text-slate-700 flex items-center gap-2">
                          <Building2 size={16} className="text-slate-400" /> {viewCandidate.currentCompany || "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Card */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <StarIcon size={14} /> Skillset
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(viewCandidate.skills) ? viewCandidate.skills : viewCandidate.skills?.split(',') || []).map((s, i) => (
                        <span key={i} className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black tracking-tight border border-slate-700">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Message Card */}
                  {viewCandidate.message && (
                    <div className="bg-blue-600 p-8 rounded-2xl shadow-lg shadow-blue-200 text-white">
                      <h3 className="text-xs font-black text-blue-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText size={14} /> Message from Candidate
                      </h3>
                      <p className="text-sm font-medium leading-relaxed italic">
                        "{viewCandidate.message}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                 <Calendar size={14} /> Applied on: {formatDate(viewCandidate.submittedAt)}
               </div>
               <div className="flex gap-3">
                  <Button variant="outline" className="font-bold border-slate-200" onClick={() => window.print()}>
                    <Download size={16} className="mr-2" /> Print Summary
                  </Button>
                  <Button className="font-bold px-8 bg-slate-900" onClick={() => setViewCandidate(null)}>
                    Done
                  </Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const StarIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default AdminCandidates;