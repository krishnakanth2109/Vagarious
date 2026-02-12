import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Search, MapPin, Briefcase, Clock, Upload,
  CheckCircle2, FileText, Users, TrendingUp, Award, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import heroCandidates from "@/assets/hero-candidates.jpg";
import axios from "axios";

// --- TYPES ---
interface FormErrors {
  [key: string]: string;
}

// ---------------------------------------------------------
// API CONFIGURATION (Uses VITE_API_URL from .env)
// ---------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL;
console.log("Active API Endpoint:", API_URL);

const applicationProcess = [
  { icon: FileText, title: "Submit Resume", description: "Upload your updated resume through our portal or send via email." },
  { icon: Users, title: "Initial Screening", description: "Our recruiters review your profile and assess fit for available positions." },
  { icon: Search, title: "Job Matching", description: "We match your skills and preferences with suitable job opportunities." },
  { icon: TrendingUp, title: "Interview Prep", description: "Receive guidance and tips to ace your interviews." },
  { icon: Award, title: "Get Hired", description: "Clear interviews and land your dream job with our support." },
];

const faqs = [
  { question: "Is there any fee for candidates?", answer: "No, our services are completely free for job seekers." },
  { question: "How long does the placement process take?", answer: "Typically 2-4 weeks from profile submission to offer." },
  { question: "Will my resume be shared without my consent?", answer: "No. We seek consent before sharing your profile." },
  { question: "What types of jobs do you offer?", answer: "Opportunities across IT and Non-IT sectors." },
];

const benefits = [
  "Access to premium job opportunities", "Personalized job recommendations",
  "Interview preparation support", "Salary negotiation guidance",
  "Career counseling", "100% confidential process",
];

const Candidates = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    currentCompany: "",
    currentRole: "",
    skills: "",
    preferredLocation: "",
    noticePeriod: "",
    message: "",
  });

  // Fetch Jobs from Backend
  useEffect(() => {
    const fetchJobs = async () => {
      if (!API_URL) return;
      try {
        const response = await axios.get(`${API_URL}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // --- Strict Validation Rules ---
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.name.trim().length < 2) 
      newErrors.name = "Full name is required (text only).";
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) 
      newErrors.email = "Please enter a valid business/personal email.";

    if (formData.phone.length !== 10) 
      newErrors.phone = "Phone number must be exactly 10 digits.";

    if (formData.experience.trim().length === 0) 
      newErrors.experience = "Experience details are required.";

    if (formData.skills.trim().length < 5) 
      newErrors.skills = "Please list your primary skills (min 5 chars).";

    if (formData.preferredLocation.trim().length < 2) 
      newErrors.preferredLocation = "Enter a location (text only).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handle Real-time Strict Input Filtering ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // 1. STRICT: Block numbers in Name and Location
    if (name === "name" || name === "preferredLocation") {
      filteredValue = value.replace(/[0-9]/g, ""); 
    }

    // 2. STRICT: Allow only digits for Phone
    if (name === "phone") {
      filteredValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // 3. STRICT: Allow only numbers/experience symbols for Exp
    if (name === "experience") {
      filteredValue = value.replace(/[^0-9.+-]/g, "");
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));

    // Clear error for field as user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ 
        title: "Validation Error", 
        description: "Please check the red highlighted fields.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/candidates`, formData);
      toast({ 
        title: "Profile Submitted!", 
        description: "We will review your profile and contact you shortly." 
      });
      setFormData({ name: "", email: "", phone: "", experience: "", currentCompany: "", currentRole: "", skills: "", preferredLocation: "", noticePeriod: "", message: "" });
      setErrors({});
    } catch (error) {
      toast({ 
        title: "Submission Failed", 
        description: "Network error. Please try again later.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job: any) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <HeroBanner
        image={heroCandidates}
        subtitle="For Job Seekers"
        title="Your Next Career Move Starts Here"
        description="Explore exciting opportunities with top companies across IT and Non-IT sectors."
      >
        <Button variant="hero" size="lg" asChild><a href="#register">Upload Resume</a></Button>
        <Button variant="hero-outline" size="lg" asChild><a href="#jobs">View Jobs</a></Button>
      </HeroBanner>

      {/* Jobs Search */}
      <section id="jobs" className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading subtitle="Current Openings" title="Featured Job Opportunities" />
          
          <div className="mb-8 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by job title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>

          {jobsLoading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto w-8 h-8 text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground">No jobs found.</div>
              ) : (
                filteredJobs.map((job: any, index) => (
                  <motion.div key={job._id || index} className="glass-card-hover p-6 flex flex-col justify-between border border-border">
                    <div>
                      <h3 className="text-lg font-bold font-heading">{job.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{job.company}</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</div>
                        <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.experience}</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4" asChild><a href="#register">Apply Now</a></Button>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Profile Submission Form */}
      <section id="register" className="section-padding scroll-mt-24 bg-muted/30">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold font-heading mb-6">Upload Your Profile</h2>
              <div className="space-y-4">
                {benefits.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div className="glass-card p-8 bg-white dark:bg-slate-950 shadow-2xl border border-border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className={errors.name ? "text-destructive" : ""}>Full Name (Text only) *</Label>
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className={errors.name ? "border-destructive" : ""} />
                    {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className={errors.email ? "text-destructive" : ""}>Email Address *</Label>
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className={errors.phone ? "text-destructive" : ""}>Phone (10 digits) *</Label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="10 Digit Number" className={errors.phone ? "border-destructive" : ""} />
                    {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className={errors.experience ? "text-destructive" : ""}>Experience (e.g. 2+) *</Label>
                    <Input name="experience" value={formData.experience} onChange={handleChange} placeholder="Years" className={errors.experience ? "border-destructive" : ""} />
                    {errors.experience && <p className="text-[10px] text-destructive">{errors.experience}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className={errors.skills ? "text-destructive" : ""}>Key Skills *</Label>
                  <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, etc." className={errors.skills ? "border-destructive" : ""} />
                  {errors.skills && <p className="text-[10px] text-destructive">{errors.skills}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className={errors.preferredLocation ? "text-destructive" : ""}>Preferred Location (Text only) *</Label>
                    <Input name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="e.g. Hyderabad" className={errors.preferredLocation ? "border-destructive" : ""} />
                    {errors.preferredLocation && <p className="text-[10px] text-destructive">{errors.preferredLocation}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Notice Period</Label>
                    <Input name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} placeholder="e.g. 30 days" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Additional Info</Label>
                  <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Anything else..." rows={2} />
                </div>

                <Button type="submit" size="lg" className="w-full font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Submitting</> : "Submit Profile"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading subtitle="FAQs" title="Frequently Asked Questions" />
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card px-6 border-none">
                  <AccordionTrigger className="text-left hover:no-underline font-semibold">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Candidates;