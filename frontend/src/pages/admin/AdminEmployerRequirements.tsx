import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building2, 
  AlertCircle 
} from "lucide-react";
import { format, isValid } from "date-fns";

// 1. Define API URL based on your .env structure
// If VITE_API_URL is "http://localhost:5000/api", this results in "http://localhost:5000/api/employer-requirements"
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/employer-requirements`;

// Define the interface for the data
interface Requirement {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  positions: string;
  location: string;
  requirements: string;
  status: "Pending" | "Contacted" | "Closed";
  createdAt: string;
}

const AdminEmployerRequirements = () => {
  const [data, setData] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch Data from Backend
  const fetchRequirements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching requirements:", err);
      setError("Failed to load employer requirements. Please try again.");
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // Function to update status
  const updateStatus = async (id: string, currentStatus: string) => {
    // Cycle: Pending -> Contacted -> Closed -> Pending
    let newStatus = "Pending";
    if (currentStatus === "Pending") newStatus = "Contacted";
    else if (currentStatus === "Contacted") newStatus = "Closed";
    
    setUpdatingId(id);
    try {
      await axios.put(`${API_URL}/${id}`, {
        status: newStatus
      });
      
      // Optimistic update locally
      setData((prevData) => 
        prevData.map((item) => 
          item._id === id ? { ...item, status: newStatus as any } : item
        )
      );
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper for Badge Colors
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Contacted": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "Closed": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      default: return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"; // Pending
    }
  };

  // Helper for Date Formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM dd, yyyy") : "N/A";
  };

  return (
    <AdminLayout title="Employer Requirements">
      <div className="space-y-6">
        
        {/* Error State */}
        {error && (
          <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
            <Button variant="outline" size="sm" className="ml-auto border-red-200 hover:bg-red-100" onClick={fetchRequirements}>
              Retry
            </Button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Hiring Requests ({data.length})</h2>
            <Button variant="outline" size="sm" onClick={fetchRequirements} disabled={loading}>
              Refresh
            </Button>
          </div>
          
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[200px]">Company Profile</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead className="w-[300px]">Requirements</TableHead>
                <TableHead>Location & Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      Loading requirements...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No hiring requirements submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {item.companyName}
                        </div>
                        <div className="text-xs text-gray-500 pl-6">
                          Contact: <span className="font-medium">{item.contactPerson}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-3 w-3" /> 
                          <a href={`mailto:${item.email}`} className="hover:text-blue-600 transition-colors">{item.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone className="h-3 w-3" /> {item.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 border border-gray-100 line-clamp-3">
                        {item.requirements}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <MapPin className="h-3 w-3 text-red-400" /> {item.location || "Remote/Flexible"}
                         </div>
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3" /> {item.positions || "N/A"}
                         </div>
                       </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-gray-500">
                       <div className="flex items-center gap-1">
                           <Calendar className="h-3 w-3" /> 
                           {formatDate(item.createdAt)}
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`cursor-pointer transition-all ${getBadgeVariant(item.status)}`}
                        onClick={() => !updatingId && updateStatus(item._id, item.status)}
                      >
                        {updatingId === item._id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        {item.status}
                      </Badge>
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

export default AdminEmployerRequirements;