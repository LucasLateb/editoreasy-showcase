
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 bg-accent">
      {/* Background gradient decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse-subtle"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse-subtle"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="animate-slide-in-down opacity-0" style={{ animationDelay: '0.1s' }}>
            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary">
              The Portfolio Platform for Video Editors
            </span>
          </div>
          
          <h1 className="mt-8 text-4xl md:text-6xl font-bold tracking-tight text-balance animate-slide-in-down opacity-0" style={{ animationDelay: '0.3s' }}>
            Showcase Your Video Editing <br className="hidden md:inline" />
            <span className="text-primary">Projects & Skills</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance animate-slide-in-down opacity-0" style={{ animationDelay: '0.5s' }}>
            Create an impressive portfolio to attract clients, organize your work by categories, 
            and join a community of professional video editors.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.7s' }}>
            <Link to="/register">
              <Button size="lg" className="px-8 font-medium h-12 text-base">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="px-8 font-medium h-12 text-base">
                Explore Portfolios
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 border border-border rounded-2xl bg-background/50 backdrop-blur-sm p-6 animate-slide-in-up opacity-0" style={{ animationDelay: '0.9s' }}>
            <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-lg shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/50 z-10 animate-pulse-subtle pointer-events-none"></div>
              <img 
                src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
                alt="Video editing showcase" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm opacity-80">Featured editor</p>
                    <p className="text-lg font-medium">Cinematic Storytelling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
