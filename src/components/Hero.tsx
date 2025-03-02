
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
      
      {/* Floating video editing objects - more spread out and colorful */}
      <div className="absolute top-[15%] left-[8%] w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#FEC6A1] backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0 rotate-[-5deg]" style={{ animationDelay: '0.8s' }}>
        <Film className="h-8 w-8 text-white drop-shadow-md" />
      </div>
      
      <div className="absolute top-[22%] right-[12%] w-14 h-14 bg-gradient-to-br from-[#0EA5E9] to-[#D3E4FD] backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0 rotate-[8deg]" style={{ animationDelay: '1.1s' }}>
        <Scissors className="h-7 w-7 text-white drop-shadow-md" />
      </div>
      
      <div className="absolute bottom-[18%] left-[18%] w-12 h-12 bg-gradient-to-br from-[#D946EF] to-[#E5DEFF] backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0 rotate-[12deg]" style={{ animationDelay: '1.4s' }}>
        <Play className="h-6 w-6 text-white drop-shadow-md" fill="currentColor" />
      </div>
      
      <div className="absolute top-[75%] right-[25%] w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#FFDEE2] backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0 rotate-[-10deg]" style={{ animationDelay: '1.7s' }}>
        <MonitorPlay className="h-8 w-8 text-white drop-shadow-md" />
      </div>
      
      <div className="absolute top-[45%] left-[5%] w-14 h-14 bg-gradient-to-br from-[#FEF7CD] to-[#FDE1D3] backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0 rotate-[15deg]" style={{ animationDelay: '2.0s' }}>
        <Clapperboard className="h-7 w-7 text-gray-800 drop-shadow-sm" />
      </div>
      
      <div className="absolute top-[60%] right-[8%] w-12 h-12 bg-gradient-to-br from-[#F2FCE2] to-[#accbee] backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0 rotate-[-8deg]" style={{ animationDelay: '2.3s' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-gray-800 drop-shadow-sm">
          <polygon points="23 7 16 12 23 17 23 7" fill="white"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="#F1F0FB"></rect>
        </svg>
      </div>
      
      <div className="absolute top-[30%] left-[28%] w-10 h-10 bg-gradient-to-br from-[#ee9ca7] to-[#ffdde1] backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center animate-slide-in-down opacity-0 rotate-[20deg]" style={{ animationDelay: '2.6s' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white drop-shadow-md">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" fill="#FEC6A1"></path>
          <circle cx="12" cy="13" r="3" fill="white"></circle>
        </svg>
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
