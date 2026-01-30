import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
// Import ALL icons that might be used
import { 
  ArrowRight, Code2, Database, Cloud, Shield, TestTube2, 
  Cpu, Smartphone, Globe, Headphones, Network, Server, 
  Terminal, Monitor, Zap, Users, Target, Lock, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import heroIT from "@/assets/hero-about.jpg";

// Map strings to Actual Components
const iconMap: Record<string, any> = {
  Code2, Database, Cloud, Shield, TestTube2, Headphones, 
  Server, Terminal, Monitor, Smartphone, Globe, Cpu, Network, Zap, 
  Users, Target, Lock, Layers
};

// --- DYNAMIC URL CONFIGURATION ---
// This grabs 'http://localhost:5000/api' from your .env file
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/it-recruitment`;

const ITRecruitment = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching from:", API_URL); // Debug log to check connection
        const res = await axios.get(API_URL);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch IT data", error);
        // We don't block the UI on error, just show empty or fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use data from DB or fallback empty arrays to prevent crashes
  const technologies = data?.technologies || [];
  const itRoles = data?.roles || [];
  const industries = data?.industries || [];
  const process = data?.process || [];

  if (loading) {
     return (
        <Layout>
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </Layout>
     );
  }

  return (
    <Layout>
      <HeroBanner
        image={heroIT}
        subtitle="IT Recruitment"
        title="Tech Talent Solutions for Digital Transformation"
        description="Connect with elite software developers, cloud architects, data scientists, and IT professionals who can accelerate your digital journey and drive innovation."
      >
        <Button variant="hero" size="lg" asChild>
          <Link to="/employers">Hire IT Talent</Link>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Schedule Tech Consultation</Link>
        </Button>
      </HeroBanner>

      {/* Technology Expertise */}
      <section className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Technology Expertise"
            title="Comprehensive Tech Stack Coverage"
            description="We recruit across the entire technology spectrum, from legacy systems to cutting-edge innovations."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.length > 0 ? technologies.map((tech: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <h3 className="text-lg font-bold font-heading mb-4 text-primary">
                  {tech.category}
                </h3>
                <ul className="space-y-2">
                  {tech.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )) : (
                <div className="col-span-full text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                  No technologies configured in Admin Panel yet.
                </div>
            )}
          </div>
        </div>
      </section>

      {/* IT Roles & Specializations */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="IT Roles We Recruit"
            title="Comprehensive IT Talent Solutions"
            description="From entry-level developers to CTOs, we help you build complete technology teams."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itRoles.length > 0 ? itRoles.map((role: any, index: number) => {
              const IconComponent = iconMap[role.icon] || Code2;
              
              return (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card-hover p-6"
                >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color || "from-blue-500 to-cyan-500"} flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-2">{role.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{role.description}</p>
                    <div className="flex flex-wrap gap-2">
                    {role.skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                        {skill}
                        </span>
                    ))}
                    </div>
                </motion.div>
              );
            }) : (
                <div className="col-span-full text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                  No roles configured in Admin Panel yet.
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Industries Served */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Industries Served"
            title="IT Talent Across Sectors"
            description="We understand the unique technology needs of different industries and provide tailored recruitment solutions."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((industry: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors hover:shadow-md"
              >
                <div className="text-2xl font-bold text-primary mb-1">{industry.count}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{industry.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Process */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our IT Recruitment Process"
            title="Technical Talent Acquisition Framework"
            description="A specialized process designed to identify, evaluate, and onboard top-tier technical talent."
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((step: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-secondary-foreground/5 rounded-2xl p-6 border border-secondary-foreground/10 hover:bg-secondary-foreground/10 transition-colors"
              >
                <span className="text-5xl font-bold font-heading text-primary/20 absolute top-4 right-4">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold font-heading mb-2 relative z-10">{step.title}</h3>
                <p className="text-secondary-foreground/70 relative z-10">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Ready to Build Your Tech Dream Team?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your technical hiring needs and find the perfect talent match for your projects.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/employers">
                  Hire IT Professionals <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Get Technical Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ITRecruitment;