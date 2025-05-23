import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { Play, Briefcase } from 'lucide-react';

export type ExploreEditorCardData = {
  id: string;
  name: string | null;
  avatarUrl?: string | null;
  specializations?: string[] | null;
  showreelUrl?: string | null;
  showreelThumbnail?: string | null;
  about?: string | null; // Ajout du champ about
  // Add other fields from EditorType if needed for display, e.g., subscriptionTier
};

interface ExploreEditorCardProps {
  editor: ExploreEditorCardData;
}

const ExploreEditorCard: React.FC<ExploreEditorCardProps> = ({ editor }) => {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement | null>(null);

  const editorName = editor.name || 'Unknown Editor';

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    let match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&autohide=1&modestbranding=1`;
    }
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/|)(\d+)/i;
    match = url.match(vimeoRegex);
    if (match && match[1]) {
      // Using background=1 for more reliable autoplay, muted, and loop for Vimeo.
      // It also hides controls, title, byline, and portrait by default.
      // Added autoplay=1 and autopause=0 for robustness.
      return `https://player.vimeo.com/video/${match[1]}?background=1&autoplay=1&autopause=0&muted=1`;
    }
    // Direct video link (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }
    // Check for iframe embed code
    const iframeSrcRegex = /<iframe.*?src=["'](.*?)["']/;
    match = url.match(iframeSrcRegex);
    if (match && match[1]) {
        // Add autoplay and mute parameters if possible
        const src = match[1];
        const urlObj = new URL(src);
        urlObj.searchParams.set('autoplay', '1');
        urlObj.searchParams.set('mute', '1');
        // Common params for embeds
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
             urlObj.searchParams.set('loop', '1');
             const videoId = src.split('/').pop()?.split('?')[0] || '';
             if(videoId) urlObj.searchParams.set('playlist', videoId);
             urlObj.searchParams.set('controls', '0');
        } else if (src.includes('vimeo.com')) {
            urlObj.searchParams.set('loop', '1');
            urlObj.searchParams.set('autopause', '0');
            urlObj.searchParams.set('controls', '0');
        }
        return urlObj.toString();
    }
    return null; // Not a supported video URL for direct embed playback
  };

  const isVimeoShowreel = !!editor.showreelUrl && /vimeo\.com\/(?:video\/|)(\d+)/i.test(editor.showreelUrl);
  const effectiveShowreelUrl = editor.showreelUrl && !isVimeoShowreel ? getEmbedUrl(editor.showreelUrl) : null; // Ne pas générer d'URL embed pour Vimeo ici si on ne veut pas de player
  const isDirectVideo = effectiveShowreelUrl && effectiveShowreelUrl.match(/\.(mp4|webm|ogg)$/i);

  useEffect(() => {
    // Ne pas lire la vidéo si c'est un showreel Vimeo ou si on n'est pas en survol pour les vidéos directes
    if (isVimeoShowreel) {
      if (videoRef.current && isDirectVideo) { // Potentiellement, mettre en pause si elle jouait avant
         (videoRef.current as HTMLVideoElement).pause();
      }
      return; 
    }

    if (isHovering && videoRef.current && isDirectVideo) {
      (videoRef.current as HTMLVideoElement).play().catch(error => {
        console.warn("Video play failed:", error);
      });
    } else if (!isHovering && videoRef.current && isDirectVideo) {
      (videoRef.current as HTMLVideoElement).pause();
    }
  }, [isHovering, isDirectVideo, isVimeoShowreel]);

  return (
    <Link to={`/editor/${editor.id}`} className="block group">
      <Card 
        className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover-scale relative" // Ajout de relative pour le positionnement absolu de l'overlay
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative w-full aspect-video bg-muted overflow-hidden">
            {(isHovering && effectiveShowreelUrl && !isVimeoShowreel) ? ( // Condition pour afficher le lecteur vidéo/iframe
              isDirectVideo ? (
                <video
                  ref={videoRef as React.RefObject<HTMLVideoElement>}
                  src={effectiveShowreelUrl} // Sera null pour Vimeo ici, donc cette branche n'est pas prise pour Vimeo
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <iframe
                  ref={videoRef as React.RefObject<HTMLIFrameElement>}
                  src={effectiveShowreelUrl} // Sera null pour Vimeo ici
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; muted"
                  allowFullScreen
                  title={`${editorName}'s Showreel`}
                />
              )
            ) : (
              <>
                <Image
                  src={editor.showreelThumbnail || '/placeholder.svg'}
                  alt={`${editorName}'s Showreel Thumbnail`}
                  fallbackSrc="/placeholder.svg"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* L'icône Play ne s'affiche que si ce n'est pas un showreel Vimeo en survol, 
                    car l'overlay Vimeo prendra le dessus */}
                {!(isHovering && isVimeoShowreel) && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="h-12 w-12 text-white/80 fill-white/70" />
                    </div>
                )}
              </>
            )}
          </div>
          
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Avatar className="h-10 w-10 mr-3 border">
                  <AvatarImage src={editor.avatarUrl || undefined} alt={editorName} />
                  <AvatarFallback>{editorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="text-md font-semibold truncate story-link">{editorName}</h3>
              </div>

              {editor.specializations && editor.specializations.length > 0 && (
                <div className="mb-2">
                   <div className="flex items-center text-xs text-muted-foreground mb-1">
                     <Briefcase size={14} className="mr-1" />
                     <span>Spécialisations :</span>
                   </div>
                  <div className="flex flex-wrap gap-1">
                    {editor.specializations.slice(0, 3).map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{spec}</Badge>
                    ))}
                    {editor.specializations.length > 3 && (
                       <Badge variant="secondary" className="text-xs">...</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Overlay pour Vimeo au survol */}
        {isHovering && isVimeoShowreel && (
          <div className="absolute inset-0 bg-card text-card-foreground p-4 flex flex-col justify-start overflow-y-auto animate-fade-in z-10">
            <div className="flex items-center mb-3">
              <Avatar className="h-12 w-12 mr-3 border-2 border-background shadow-sm">
                <AvatarImage src={editor.avatarUrl || undefined} alt={editorName} />
                <AvatarFallback className="text-lg">{editorName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold story-link truncate">{editorName}</h3>
            </div>
            
            <div className="mb-3 flex-shrink-0">
              <h4 className="text-sm font-semibold mb-1 text-primary flex items-center">
                À propos
              </h4>
            </div>
            <div className="text-sm text-muted-foreground overflow-y-auto scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent flex-grow mb-3 pr-1">
              {editor.about || 'Aucune information disponible.'}
            </div>

            {editor.specializations && editor.specializations.length > 0 && (
              <div className="flex-shrink-0">
                <h4 className="text-sm font-semibold mb-1.5 text-primary flex items-center">
                  <Briefcase size={16} className="mr-1.5" />
                  Spécialisations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {editor.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">{spec}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
};

export default ExploreEditorCard;
