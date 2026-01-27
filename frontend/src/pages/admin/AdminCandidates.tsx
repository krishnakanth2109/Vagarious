import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, Briefcase, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

// Determine API URL
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/candidates` 
  : "http://localhost:5000/api/candidates";

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  experience: string;
  skills: string[];
  preferredLocation: string;
  submittedAt: string;
}

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(API_URL);
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Candidate Applications">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm max-w-md">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <Input 
            placeholder="Search by name, email, or skills..." 
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
                <TableHead className="w-[250px]">Candidate Profile</TableHead>
                <TableHead>Role & Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Applied Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading applications...</TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No applications found.</TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate._id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-base text-gray-900">{candidate.name}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-3 h-3" /> {candidate.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-3 h-3" /> {candidate.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-medium">
                          <Briefcase className="w-3 h-3 text-blue-500" /> 
                          {candidate.currentRole || "N/A"}
                        </div>
                        <span className="text-xs text-muted-foreground bg-gray-100 w-fit px-2 py-0.5 rounded">
                          {candidate.experience} Exp
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {candidate.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="text-[10px] text-gray-500 px-1">+{candidate.skills.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" /> {candidate.preferredLocation || "Flexible"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {format(new Date(candidate.submittedAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCandidates;