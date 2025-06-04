
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  structuredData?: object;
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = "VideoCut - Portfolio pour Éditeurs Vidéo",
  description = "Découvrez des monteurs vidéo professionnels et explorez leurs portfolios créatifs. La plateforme de référence pour connecter créateurs et clients.",
  keywords = "éditeur vidéo, monteur vidéo, portfolio vidéo, création vidéo, montage professionnel, créateur de contenu, créateur vidéo, freelance vidéo, vidéaste, réalisateur, motion designer, vidéographe, monteur freelance, vidéo editor, video creator, content creator, video freelancer, filmmaker, videographer, video producer, video specialist, director, video artist, post-production specialist, montage vidéo, création de vidéos sur mesure, editing vidéo, production audiovisuelle, retouche vidéo, étalonnage vidéo, montage aftermovie, bande démo, showreel, videography services, video editing, video post-production, color grading, after effects editing, cinematic editing, motion graphics, sound design, transitions vidéo, storytelling vidéo, visual storytelling, galerie vidéo, site portfolio, site créatif, présentation vidéo, portfolio en ligne, portfolio de monteur, video portfolio, video showcase, reel portfolio, demo reel, online video portfolio, creative portfolio, editing portfolio, showreel website, plateforme pour monteurs vidéo, outil pour monteur vidéo, outil de présentation vidéo, solution vidéo créative, SaaS vidéo, vidéo cloud, portfolio SaaS, video SaaS, video tool, creative video tool, online video solution, editor platform, creative showcase tool, portfolio builder, portfolio software, visibilité des monteurs, trouver un monteur vidéo, recruter un monteur, outil pour créateur, référencement créatif, CV vidéo, carte de visite vidéo, creative resume, hire a video editor, find video editor, video editing service, video editor portfolio, creative online presence, get clients video editing, promote video work, creative talent platform, freelancer showcase, portfolio pour freelance",
  image = "/og-image.png",
  url = "https://videocut.fr",
  type = "website",
  structuredData,
  noIndex = false
}) => {
  const fullTitle = title.includes('VideoCut') ? title : `${title} | VideoCut`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="VideoCut" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
