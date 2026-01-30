import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout"; // Adjust path based on your folder structure
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Mail, Phone, MapPin, Calendar } from "lucide-react";

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

  // Fetch Data from Backend
  const fetchRequirements = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employer-requirements");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching requirements:", error);
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // Function to update status (Optional Feature)
  const updateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Pending" ? "Contacted" : "Closed";
    try {
      await axios.put(`http://localhost:5000/api/employer-requirements/${id}`, {
        status: newStatus
      });
      toast.success(`Status updated to ${newStatus}`);
      fetchRequirements(); // Refresh list
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Employer Requirements">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Employer Requirements">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Hiring Requests ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Location/Pos</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No requirements submitted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        <div>{item.companyName}</div>
                        <div className="text-xs text-muted-foreground">{item.contactPerson}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" /> {item.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" /> {item.phone}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate text-sm" title={item.requirements}>
                          {item.requirements}
                        </p>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" /> {item.location || "N/A"}
                         </div>
                         <div className="text-xs text-muted-foreground mt-1">
                            Positions: {item.positions || "N/A"}
                         </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                         <div className="flex items-center gap-1 text-xs">
                             <Calendar className="h-3 w-3" /> 
                             {new Date(item.createdAt).toLocaleDateString()}
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`cursor-pointer ${
                            item.status === "Pending" ? "bg-yellow-500 hover:bg-yellow-600" :
                            item.status === "Contacted" ? "bg-blue-500 hover:bg-blue-600" :
                            "bg-green-500 hover:bg-green-600"
                          }`}
                          onClick={() => updateStatus(item._id, item.status)}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminEmployerRequirements;