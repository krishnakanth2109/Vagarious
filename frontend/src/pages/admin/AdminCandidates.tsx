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
import { 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Eye, 
  Trash2, 
  X, 
  Calendar, 
  User,
  Building2,
  Clock,
  FileText,
  Loader2
} from "lucide-react";
import { format, isValid } from "date-fns";

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/candidates`;

// Matches the data sent from the Frontend Form
interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  currentCompany?: string;
  currentRole?: string;
  appliedJob: string;
  skills: string[];
  preferredLocation: string;
  noticePeriod?: string;
  message?: string;
  submittedAt: string;
}

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // View Modal State
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  // --- FETCH DATA ---
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this application?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
      toast.success("Application deleted successfully");
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Failed to delete application");
    }
  };

  // --- FILTER LOGIC ---
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.appliedJob.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [candidates, searchTerm]);

  // Helper for Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM dd, yyyy") : "N/A";
  };

  return (
    <AdminLayout title="Candidate Applications">
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="flex items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm max-w-md">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <Input 
            placeholder="Search by name, job, or skills..." 
            className="border-none shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[250px]">Candidate</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" /> Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate._id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900">{candidate.name}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3 h-3" /> {candidate.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3 h-3" /> {candidate.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {candidate.appliedJob}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-gray-700">{candidate.currentRole || "N/A"}</span>
                        <span className="text-xs text-gray-500">{candidate.experience} Years Exp</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {candidate.skills.slice(0, 2).map((skill, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 2 && (
                          <span className="text-[10px] text-gray-400 pl-1">+{candidate.skills.length - 2}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(candidate.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* VIEW BUTTON */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => setViewCandidate(candidate)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* DELETE BUTTON */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(candidate._id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* --- VIEW DETAILS MODAL --- */}
      {viewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3" /> Submitted on {formatDate(viewCandidate.submittedAt)}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewCandidate(null)}>
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* 1. Job & Personal Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Candidate Info</h3>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{viewCandidate.name}</p>
                      <p className="text-sm text-gray-500">{viewCandidate.email}</p>
                      <p className="text-sm text-gray-500">{viewCandidate.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-700">Preferred: {viewCandidate.preferredLocation}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Job Application</h3>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">Applied For</p>
                    <p className="font-bold text-blue-900 text-lg">{viewCandidate.appliedJob}</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 2. Professional Experience */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Professional</h3>
                   <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Role: <span className="font-medium">{viewCandidate.currentRole || "Not specified"}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Company: <span className="font-medium">{viewCandidate.currentCompany || "Not specified"}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Experience: <span className="font-medium">{viewCandidate.experience} Years</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Notice Period: <span className="font-medium">{viewCandidate.noticePeriod || "Immediate"}</span></span>
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Skills</h3>
                   <div className="flex flex-wrap gap-2">
                     {viewCandidate.skills.map((skill, idx) => (
                       <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium border border-slate-200">
                         {skill}
                       </span>
                     ))}
                   </div>
                </div>
              </div>

              {/* 3. Message / Additional Info */}
              {viewCandidate.message && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                   <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Cover Note / Message
                   </h3>
                   <p className="text-gray-700 text-sm italic">
                     "{viewCandidate.message}"
                   </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button onClick={() => setViewCandidate(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminCandidates;