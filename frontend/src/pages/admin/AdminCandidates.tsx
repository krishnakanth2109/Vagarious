import { useEffect, useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2
} from "lucide-react";
import { format, isValid } from "date-fns";
import { toast } from "sonner"; // Using sonner as seen in your AdminLayout

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/candidates`;

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  currentCompany?: string;
  experience: string;
  skills: string[];
  preferredLocation: string;
  appliedJob?: string;
  noticePeriod?: string;
  message?: string;
  submittedAt: string;
}

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setCandidates(response.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidate applications.");
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
    } catch (err) {
      toast.error("Failed to delete application");
    }
  };

  // --- EDIT HANDLERS ---
  const openEditModal = (candidate: Candidate) => {
    setEditingCandidate({
      ...candidate,
      skills: candidate.skills.join(", ") // Convert array to string for easy editing
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingCandidate((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await axios.put(`${API_URL}/${editingCandidate._id}`, {
        ...editingCandidate,
        // Convert back to array if user changed it
        skills: typeof editingCandidate.skills === 'string' 
          ? editingCandidate.skills.split(',').map((s: string) => s.trim()) 
          : editingCandidate.skills
      });

      setCandidates((prev) =>
        prev.map((c) => (c._id === editingCandidate._id ? response.data.candidate || response.data : c))
      );
      
      toast.success("Candidate updated successfully");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error("Failed to update candidate");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.appliedJob && c.appliedJob.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [candidates, searchTerm]);

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
            placeholder="Search by name, skills, or job..."
            className="border-none shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Candidates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[220px]">Candidate</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Role & Exp</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto text-blue-500" />
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate._id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{candidate.name}</span>
                        <span className="text-xs text-gray-500">{candidate.email}</span>
                        <span className="text-xs text-gray-400">{candidate.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                         {candidate.appliedJob || "General"}
                       </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{candidate.currentRole}</span>
                        <span className="text-xs text-gray-500">{candidate.experience} Years</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {candidate.skills?.slice(0, 2).map((skill, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" size="icon" className="h-8 w-8 text-blue-600"
                          onClick={() => openEditModal(candidate)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" size="icon" className="h-8 w-8 text-red-600"
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

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Edit Candidate</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="name" value={editingCandidate.name} onChange={handleEditChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" value={editingCandidate.email} onChange={handleEditChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="phone" value={editingCandidate.phone} onChange={handleEditChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input name="experience" value={editingCandidate.experience} onChange={handleEditChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <Input name="currentRole" value={editingCandidate.currentRole} onChange={handleEditChange} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input name="preferredLocation" value={editingCandidate.preferredLocation} onChange={handleEditChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skills (Comma Separated)</Label>
                <Input name="skills" value={editingCandidate.skills} onChange={handleEditChange} />
              </div>
              <div className="space-y-2">
                <Label>Admin Message / Notes</Label>
                <Textarea name="message" value={editingCandidate.message} onChange={handleEditChange} rows={3} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCandidates;