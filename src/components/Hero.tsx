
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Film, Scissors, Play, MonitorPlay, Clapperboard } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 bg-accent">
      {/* Background gradient decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse-subtle"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse-subtle"></div>
      
      {/* Floating video editing objects */}
      <div className="absolute top-1/4 left-10 md:left-20 w-14 h-14 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0" style={{ animationDelay: '1.2s' }}>
        <Film className="h-8 w-8 text-primary" />
      </div>
      
      <div className="absolute top-1/3 right-10 md:right-32 w-16 h-16 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0" style={{ animationDelay: '1.5s' }}>
        <Scissors className="h-8 w-8 text-primary" />
      </div>
      
      <div className="absolute bottom-1/4 left-20 md:left-40 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0" style={{ animationDelay: '1.8s' }}>
        <Play className="h-6 w-6 text-primary" fill="currentColor" />
      </div>
      
      <div className="absolute bottom-1/3 right-16 md:right-48 w-14 h-14 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0" style={{ animationDelay: '2.1s' }}>
        <MonitorPlay className="h-7 w-7 text-primary" />
      </div>
      
      <div className="absolute top-2/3 right-8 md:right-20 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0" style={{ animationDelay: '2.4s' }}>
        <Clapperboard className="h-6 w-6 text-primary" />
      </div>
      
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
        </div>
      </div>
    </div>
  );
};

export default Hero;
