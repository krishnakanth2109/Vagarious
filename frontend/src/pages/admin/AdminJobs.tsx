import { useState, useEffect } from "react";
// CORRECTION: The path below is now pointing to 'components/admin' instead of 'components/layout'
import AdminLayout from "@/components/admin/AdminLayout"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Determine API URL based on environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/jobs` 
  : "http://localhost:5000/api/jobs";

const AdminJobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    experience: "",
    skills: "", 
    description: ""
  });

  // Fetch Jobs on Mount
  const fetchJobs = async () => {
    try {
      const response = await axios.get(API_URL);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(API_URL, formData);
      
      toast({
        title: "Success",
        description: "Job posted successfully!",
      });
      
      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        experience: "",
        skills: "",
        description: ""
      });
      
      fetchJobs(); // Refresh list

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast({ title: "Deleted", description: "Job removed." });
      fetchJobs();
    } catch (error) {
      toast({ title: "Error", description: "Could not delete job." });
    }
  };

  return (
    <AdminLayout title="Job Management">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Add Job Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Plus className="w-5 h-5" /> Post New Job
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. React Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" value={formData.company} onChange={handleChange} required placeholder="e.g. Tech Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Bangalore" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <select 
                id="type"
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input id="experience" name="experience" value={formData.experience} onChange={handleChange} required placeholder="e.g. 3-5 Years" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (Comma separated)</Label>
              <Input id="skills" name="skills" value={formData.skills} onChange={handleChange} required placeholder="React, Node.js, AWS" />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Posting..." : "Publish Job"}
            </Button>
          </form>
        </div>

        {/* Right Column: Jobs List */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Briefcase className="w-5 h-5" /> Active Jobs ({jobs.length})
          </h3>

          {jobs.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
              No active jobs found. Use the form to post one.
            </div>
          ) : (
            jobs.map((job: any) => (
              <div key={job._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-500 font-medium">{job.company} • {job.location} • {job.type}</p>
                  <p className="text-xs text-gray-400 mt-1">Exp: {job.experience}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skills.map((skill: string, i: number) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(job._id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJobs;