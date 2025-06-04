
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Check, Video, Users, Zap, Shield, Star, Globe } from 'lucide-react';

const Features: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Video,
      title: "Professional Video Portfolio",
      description: "Showcase your best video editing work with high-quality uploads and custom thumbnails."
    },
    {
      icon: Users,
      title: "Client Discovery",
      description: "Get discovered by potential clients looking for talented video editors."
    },
    {
      icon: Zap,
      title: "Easy Portfolio Management",
      description: "Upload, organize, and manage your video portfolio with our intuitive dashboard."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your content is safely stored with enterprise-grade security and 99.9% uptime."
    },
    {
      icon: Star,
      title: "Premium Features",
      description: "Access advanced analytics, custom branding, and priority support with Pro plans."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with clients worldwide and expand your freelance opportunities."
    }
  ];

  return (
    <HelmetProvider>
      <div className="min-h-screen">
        <SEO
          title="Features - VideoCut | Professional Video Editing Platform"
          description="Discover all the features that make VideoCut the perfect platform for video editors to showcase their work and connect with clients."
          keywords="video editing platform, portfolio features, video editor tools, professional showcase"
        />
        
        <Navbar />
        
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Everything You Need to <span className="text-primary">Showcase Your Talent</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                VideoCut provides all the tools and features you need to create a professional video editing portfolio and connect with clients.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <div key={index} className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mr-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-accent rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join thousands of video editors who are already showcasing their work on VideoCut.
              </p>
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-lg font-medium hover:bg-primary/90 transition-colors">
                Create Your Portfolio Today
              </button>
            </div>
          </div>
        </main>

        <footer className="bg-secondary py-8 border-t">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              © 2025 VideoCut. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default Features;
