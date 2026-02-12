import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Search, MapPin, Briefcase, Clock, Upload,
  CheckCircle2, FileText, Users, TrendingUp, Award
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
console.log("Current API URL:", import.meta.env.VITE_API_URL);
// Static Data
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
  { question: "Can I apply for multiple positions?", answer: "Yes, you can express interest in multiple positions." },
  { question: "Do you provide career counseling?", answer: "Yes, guidance on resumes and interviews is provided." },
];

const benefits = [
  "Access to premium job opportunities", "Personalized job recommendations",
  "Interview preparation support", "Salary negotiation guidance",
  "Career counseling", "100% confidential process",
];

// ---------------------------------------------------------
// IMPORT API URL FROM .ENV
// ---------------------------------------------------------
// This will use 'https://vagarious.onrender.com/api' from your screenshot
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Candidates = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  
  // State for Form Submission Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact Form State
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
      try {
        // GET request to /api/jobs
        const response = await axios.get(`${API_URL}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        toast({
          title: "Connection Error",
          description: "Could not load jobs. Please check your connection.",
          variant: "destructive",
        });
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, [toast]);

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // POST request to /api/candidates
      await axios.post(`${API_URL}/candidates`, formData);

      toast({
        title: "Profile Submitted!",
        description: "Our recruitment team will review your profile and contact you soon.",
      });

      // Reset Form
      setFormData({
        name: "", email: "", phone: "", experience: "",
        currentCompany: "", currentRole: "", skills: "",
        preferredLocation: "", noticePeriod: "", message: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(
    (job: any) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout>
      <HeroBanner
        image={heroCandidates}
        subtitle="For Job Seekers"
        title="Your Next Career Move Starts Here"
        description="Explore exciting opportunities with top companies. Let our experienced recruiters help you find the perfect role."
      >
        <Button variant="hero" size="lg" asChild>
          <a href="#register">Upload Resume</a>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <a href="#jobs">View Jobs</a>
        </Button>
      </HeroBanner>

      {/* Current Openings */}
      <section id="jobs" className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Current Openings"
            title="Featured Job Opportunities"
            description="Explore our latest job openings across IT and Non-IT sectors."
          />

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by job title, skills, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-xl"
              />
            </div>
          </div>

          {jobsLoading ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading job opportunities...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                  No jobs found matching your criteria. Try adjusting your search.
                </div>
              ) : (
                filteredJobs.map((job: any, index) => (
                  <motion.div
                    key={job._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card-hover p-6 flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold font-heading line-clamp-1">{job.title}</h3>
                          <p className="text-muted-foreground text-sm font-medium">{job.company}</p>
                        </div>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                          {job.type}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" /> {job.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 shrink-0" /> {job.experience}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" /> Posted {formatDate(job.postedAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 4).map((skill: string, i: number) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-auto" asChild>
                      <a href="#register">Apply Now <ArrowRight className="w-4 h-4" /></a>
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          )}
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Don't see a suitable position? Register with us.</p>
            <Button asChild><a href="#register">Register for Job Alerts</a></Button>
          </motion.div>
        </div>
      </section>

      {/* Application Process Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="How It Works"
            title="Your Journey to Success"
            description="Our streamlined process makes job hunting easy and stress-free."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {applicationProcess.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-sky-dark mx-auto mb-4 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold font-heading mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < applicationProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-primary/30 mx-auto" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Register Form */}
      <section id="register" className="section-padding scroll-mt-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
           
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Get Started</h2>
              <p className="text-muted-foreground mb-8">Register with us to access exclusive job opportunities.</p>
              <div className="space-y-4">
                {benefits.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Total Experience *</Label>
                    <Input id="experience" name="experience" value={formData.experience} onChange={handleChange} required placeholder="e.g., 5 years" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input id="currentCompany" name="currentCompany" value={formData.currentCompany} onChange={handleChange} placeholder="Company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input id="currentRole" name="currentRole" value={formData.currentRole} onChange={handleChange} placeholder="Your designation" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills *</Label>
                  <Input id="skills" name="skills" value={formData.skills} onChange={handleChange} required placeholder="e.g., React, Node.js, AWS" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredLocation">Preferred Location</Label>
                    <Input id="preferredLocation" name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="e.g., Bangalore, Mumbai" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noticePeriod">Notice Period</Label>
                    <Input id="noticePeriod" name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} placeholder="e.g., 30 days" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Any additional details..." rows={3} />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <span className="flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full" /> Sending...</span> : <><Upload className="w-5 h-5 mr-2" /> Submit Profile</>}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading subtitle="FAQs" title="Frequently Asked Questions" description="Find answers to common questions." />
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card px-6 border-none">
                  <AccordionTrigger className="text-left hover:no-underline"><span className="font-semibold">{faq.question}</span></AccordionTrigger>
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