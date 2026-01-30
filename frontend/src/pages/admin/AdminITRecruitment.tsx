import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Save, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// --- DYNAMIC URL FROM .ENV ---
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/it-recruitment`;

const AdminITRecruitment = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Initialize with empty arrays to prevent "map of undefined" errors
  const [data, setData] = useState({
    technologies: [],
    roles: [],
    industries: [],
    process: []
  });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      // Merge with default structure
      setData({
        technologies: res.data.technologies || [],
        roles: res.data.roles || [],
        industries: res.data.industries || [],
        process: res.data.process || []
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load data. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Sending data to:", API_URL, data);
      await axios.put(API_URL, data);
      toast.success("Page content updated successfully!");
    } catch (error: any) {
      console.error("Save Error:", error);
      // Show specific error message from backend if available
      const msg = error.response?.data?.message || "Failed to update content";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- UPDATERS ---

  // Helper to handle simple field updates
  const updateItem = (section: keyof typeof data, index: number, field: string, value: string) => {
    const updatedSection = [...data[section]] as any[];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setData({ ...data, [section]: updatedSection });
  };

  // Helper to handle Array inputs (comma separated strings -> Array)
  const updateArrayField = (section: keyof typeof data, index: number, field: string, valueString: string) => {
    const updatedSection = [...data[section]] as any[];
    // Split by comma, remove whitespace, and filter out empty strings
    const arrayData = valueString.split(",").map(s => s.trim()).filter(s => s !== "");
    updatedSection[index][field] = arrayData;
    setData({ ...data, [section]: updatedSection });
  };

  const addItem = (section: keyof typeof data, template: any) => {
    setData({ ...data, [section]: [...data[section], template] as any });
  };

  const removeItem = (section: keyof typeof data, index: number) => {
    const updatedSection = data[section].filter((_, i) => i !== index);
    setData({ ...data, [section]: updatedSection });
  };

  if (loading) return (
    <AdminLayout title="IT Recruitment">
      <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Manage IT Recruitment Page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium">Content Management</h2>
          <p className="text-sm text-muted-foreground">This content updates the /ITRecruitment public page.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={fetchData} size="icon"><RefreshCw className="w-4 h-4" /></Button>
           <Button onClick={handleSave} disabled={saving} className="gap-2">
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
             Save Changes
           </Button>
        </div>
      </div>

      <Tabs defaultValue="technologies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="technologies">Technologies</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="industries">Industries</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
        </TabsList>

        {/* TECHNOLOGIES */}
        <TabsContent value="technologies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tech Stacks</CardTitle>
              <Button size="sm" onClick={() => addItem('technologies', { category: "New Category", items: [] })}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.technologies.map((tech: any, index: number) => (
                <div key={index} className="flex gap-4 border p-4 rounded-lg bg-card">
                  <div className="flex-1 space-y-2">
                    <Input 
                        placeholder="Category Name (e.g. Frontend)" 
                        value={tech.category} 
                        onChange={(e) => updateItem('technologies', index, 'category', e.target.value)} 
                    />
                    <Textarea 
                        placeholder="Items (React, Angular...)" 
                        value={tech.items.join(", ")} 
                        onChange={(e) => updateArrayField('technologies', index, 'items', e.target.value)} 
                    />
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => removeItem('technologies', index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Roles</CardTitle>
              <Button size="sm" onClick={() => addItem('roles', { title: "New Role", description: "", skills: [], icon: "Code2" })}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              {data.roles.map((role: any, index: number) => (
                <div key={index} className="border p-4 rounded-lg bg-card relative">
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeItem('roles', index)}><Trash2 className="w-4 h-4" /></Button>
                  <div className="grid md:grid-cols-2 gap-4 pr-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold">Title</label>
                        <Input value={role.title} onChange={(e) => updateItem('roles', index, 'title', e.target.value)} />
                        <label className="text-xs font-bold">Description</label>
                        <Textarea value={role.description} onChange={(e) => updateItem('roles', index, 'description', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold">Icon Name (Lucide)</label>
                        <Input value={role.icon} onChange={(e) => updateItem('roles', index, 'icon', e.target.value)} />
                        <label className="text-xs font-bold">Skills (Comma separated)</label>
                        <Input value={role.skills.join(", ")} onChange={(e) => updateArrayField('roles', index, 'skills', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INDUSTRIES & PROCESS (Simplified for brevity, use same pattern) */}
        <TabsContent value="industries">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Industries</CardTitle><Button size="sm" onClick={() => addItem('industries', { name: "", count: "" })}><Plus className="w-4 h-4" /></Button></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                {data.industries.map((ind: any, index: number) => (
                <div key={index} className="flex gap-2 border p-3 rounded bg-card items-center">
                    <div className="flex-1 space-y-1">
                        <Input placeholder="Name" value={ind.name} onChange={(e) => updateItem('industries', index, 'name', e.target.value)} />
                        <Input placeholder="Count" value={ind.count} onChange={(e) => updateItem('industries', index, 'count', e.target.value)} />
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => removeItem('industries', index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                ))}
            </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="process">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Process Steps</CardTitle><Button size="sm" onClick={() => addItem('process', { step: "01", title: "", description: "" })}><Plus className="w-4 h-4" /></Button></CardHeader>
            <CardContent className="space-y-4">
                {data.process.map((step: any, index: number) => (
                <div key={index} className="flex gap-4 border p-4 rounded bg-card">
                    <div className="w-16"><Input value={step.step} onChange={(e) => updateItem('process', index, 'step', e.target.value)} placeholder="#" /></div>
                    <div className="flex-1 space-y-2">
                        <Input value={step.title} onChange={(e) => updateItem('process', index, 'title', e.target.value)} placeholder="Title" />
                        <Textarea value={step.description} onChange={(e) => updateItem('process', index, 'description', e.target.value)} placeholder="Desc" />
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => removeItem('process', index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                ))}
            </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminITRecruitment;