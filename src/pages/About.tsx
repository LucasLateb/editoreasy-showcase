
import React from 'react';
import { Users, Target, Award, Globe, Heart, Zap, Camera, Edit } from 'lucide-react';
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const teamMembers = [
    {
      name: "Lucas Lateb",
      role: "Fondateur & CEO",
      description: "Expert en montage vidéo et développement produit, passionné par l'innovation audiovisuelle",
      image: "/placeholder.svg"
    },
    {
      name: "Sophie Martin",
      role: "Directrice Créative",
      description: "15 ans d'expérience en post-production et direction artistique pour grandes marques",
      image: "/placeholder.svg"
    },
    {
      name: "Thomas Chen",
      role: "CTO",
      description: "Architecte logiciel spécialisé dans les plateformes de contenu créatif et streaming",
      image: "/placeholder.svg"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion Créative",
      description: "Nous célébrons la créativité et l'art du montage vidéo sous toutes ses formes"
    },
    {
      icon: Users,
      title: "Communauté Unie",
      description: "Favoriser les connexions entre monteurs, créateurs et professionnels de l'audiovisuel"
    },
    {
      icon: Target,
      title: "Excellence Technique",
      description: "Offrir des outils de qualité professionnelle pour showcaser le talent des éditeurs"
    },
    {
      icon: Globe,
      title: "Accessibilité Globale",
      description: "Démocratiser l'accès aux opportunités pour tous les monteurs vidéo"
    }
  ];

  const achievements = [
    { number: "2,500+", label: "Monteurs Inscrits" },
    { number: "15,000+", label: "Vidéos Hébergées" },
    { number: "50,000+", label: "Vues Mensuelles" },
    { number: "95%", label: "Satisfaction Client" }
  ];

  return (
    <>
      <SEO 
        title="À Propos de VideoCut - Plateforme Portfolio Monteurs Vidéo"
        description="Découvrez l'histoire de VideoCut, plateforme dédiée aux monteurs vidéo professionnels. Notre mission : connecter les talents créatifs avec les opportunités."
        keywords="à propos VideoCut, équipe montage vidéo, plateforme éditeurs, histoire entreprise, mission créative, portfolio professionnel"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "À Propos de VideoCut",
          "description": "Histoire et mission de VideoCut",
          "url": "https://videocut.lovable.app/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "VideoCut",
            "foundingDate": "2024",
            "founder": "Lucas Lateb"
          }
        }}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              À Propos de VideoCut
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              La plateforme de référence qui révolutionne la façon dont les monteurs vidéo 
              présentent leur talent et se connectent avec les opportunités professionnelles.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-8 md:p-12">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Chez VideoCut, nous croyons que chaque monteur vidéo mérite une vitrine professionnelle 
                  pour présenter son savoir-faire créatif. Notre plateforme connecte les talents de 
                  l'édition vidéo, post-production et motion design avec les clients à la recherche 
                  d'expertise audiovisuelle de qualité.
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold mb-2">Pour les Monteurs</h3>
                      <p className="text-muted-foreground">
                        Créez un portfolio professionnel, gérez vos projets et développez votre réseau
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Edit className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold mb-2">Pour les Clients</h3>
                      <p className="text-muted-foreground">
                        Découvrez des talents vérifiés, explorez des portfolios et trouvez le créateur idéal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{achievement.number}</div>
                  <div className="text-muted-foreground">{achievement.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center h-full">
                    <CardHeader>
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Notre Équipe</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-card rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Notre Histoire</h2>
            <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground">
              <p>
                VideoCut est né de la frustration de monteurs vidéo talentueux qui peinaient à 
                présenter efficacement leur travail créatif. En 2024, notre fondateur Lucas Lateb, 
                fort de son expérience dans l'industrie audiovisuelle, a décidé de créer la 
                plateforme qu'il aurait aimé avoir en tant que professionnel du montage.
              </p>
              <p>
                Aujourd'hui, VideoCut rassemble une communauté dynamique de plus de 2,500 monteurs 
                vidéo, motion designers, coloristes et créateurs de contenu. Nous continuons d'innover 
                pour offrir les meilleurs outils de présentation portfolio, networking professionnel 
                et développement de carrière dans l'écosystème créatif.
              </p>
              <p>
                Notre vision ? Devenir la référence mondiale pour tous les professionnels de 
                l'édition vidéo, de la post-production et de la création audiovisuelle qui 
                souhaitent faire connaître leur expertise et développer leur activité.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Rejoignez l'Aventure VideoCut</h2>
            <p className="text-xl mb-6 opacity-90">
              Faites partie de la communauté qui transforme l'industrie du montage vidéo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
                Créer Mon Portfolio
              </button>
              <button className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors">
                Explorer les Talents
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
