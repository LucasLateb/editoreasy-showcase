
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Play, Edit, Film, Scissors } from 'lucide-react';
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Comment devenir un monteur vidéo professionnel en 2024",
      excerpt: "Découvrez les compétences essentielles, les logiciels de montage vidéo et les techniques avancées pour réussir dans l'édition vidéo professionnelle.",
      date: "2024-03-15",
      author: "Lucas Lateb",
      category: "Formation",
      image: "/placeholder.svg",
      readTime: "8 min"
    },
    {
      id: 2,
      title: "Les tendances du montage vidéo pour 2024",
      excerpt: "Explorez les dernières techniques de post-production, effets visuels, color grading et storytelling qui dominent l'industrie audiovisuelle.",
      date: "2024-03-10",
      author: "Équipe VideoCut",
      category: "Tendances",
      image: "/placeholder.svg",
      readTime: "6 min"
    },
    {
      id: 3,
      title: "Créer un portfolio vidéo qui attire les clients",
      excerpt: "Conseils d'experts pour présenter vos meilleurs projets de montage, showreel impactant et démonstration de vos compétences créatives.",
      date: "2024-03-05",
      author: "Marie Dubois",
      category: "Portfolio",
      image: "/placeholder.svg",
      readTime: "10 min"
    },
    {
      id: 4,
      title: "Tarification et négociation pour monteurs freelance",
      excerpt: "Guide complet sur les tarifs de montage vidéo, devis client, facturation et stratégies de négociation pour vidéastes indépendants.",
      date: "2024-02-28",
      author: "Pierre Martin",
      category: "Business",
      image: "/placeholder.svg",
      readTime: "12 min"
    }
  ];

  const categories = ["Tous", "Formation", "Tendances", "Portfolio", "Business", "Techniques", "Logiciels"];

  return (
    <>
      <SEO 
        title="Blog Montage Vidéo - Conseils, Tutoriels et Actualités | VideoCut"
        description="Découvrez nos articles sur le montage vidéo, post-production, création de contenu, techniques d'édition et conseils pour monteurs professionnels."
        keywords="blog montage vidéo, tutoriels édition vidéo, conseils monteur, post-production, création contenu vidéo, techniques montage, logiciels édition"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Blog VideoCut - Montage Vidéo",
          "description": "Articles et tutoriels sur le montage vidéo professionnel",
          "url": "https://videocut.lovable.app/blog",
          "publisher": {
            "@type": "Organization",
            "name": "VideoCut"
          }
        }}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Blog Montage Vidéo
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Conseils d'experts, tutoriels avancés et actualités du monde de l'édition vidéo, 
              post-production et création de contenu audiovisuel professionnel.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full border border-border hover:bg-accent transition-colors"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Article */}
          <div className="mb-16">
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src="/placeholder.svg" 
                    alt="Article vedette montage vidéo"
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Article Vedette
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Maîtriser le Color Grading : Guide Complet pour Monteurs
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Apprenez les techniques professionnelles de correction colorimétrique, 
                    étalonnage vidéo et création d'ambiances visuelles pour sublimer vos montages.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        15 Mars 2024
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Lucas Lateb
                      </span>
                    </div>
                    <Link 
                      to="/blog/color-grading-guide"
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Lire l'article
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={post.image} 
                  alt={`Article ${post.title}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-accent text-accent-foreground px-2 py-1 rounded text-sm">
                      {post.category}
                    </span>
                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {post.author}
                      </div>
                    </div>
                    <Link 
                      to={`/blog/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      Lire plus
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* SEO Content Section */}
          <div className="mt-16 bg-card rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Ressources Complètes pour Monteurs Vidéo Professionnels
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Techniques de Montage</h3>
                <p className="text-muted-foreground">
                  Découvrez les techniques avancées de montage vidéo, raccords, transitions 
                  et storytelling pour créer des contenus professionnels.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Film className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Post-Production</h3>
                <p className="text-muted-foreground">
                  Maîtrisez les outils de post-production, effets visuels, sound design 
                  et finalisation pour des résultats cinématographiques.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scissors className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Logiciels d'Édition</h3>
                <p className="text-muted-foreground">
                  Guides complets sur Adobe Premiere Pro, Final Cut Pro, DaVinci Resolve 
                  et autres logiciels de montage professionnels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
