
import React from 'react';
import { Users, MessageCircle, Award, Share2, Heart, Star, Zap, Camera } from 'lucide-react';
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Community = () => {
  const communityStats = [
    { label: "Monteurs Actifs", value: "2,500+", icon: Users },
    { label: "Projets Partagés", value: "15,000+", icon: Share2 },
    { label: "Discussions", value: "8,500+", icon: MessageCircle },
    { label: "Évaluations", value: "25,000+", icon: Star }
  ];

  const featuredMembers = [
    {
      name: "Sophie Laurent",
      role: "Monteuse Senior",
      speciality: "Documentaires & Reportages",
      projects: 150,
      rating: 4.9,
      avatar: "/placeholder.svg"
    },
    {
      name: "Thomas Dubois", 
      role: "Créateur de Contenu",
      speciality: "Réseaux Sociaux & Marketing",
      projects: 280,
      rating: 4.8,
      avatar: "/placeholder.svg"
    },
    {
      name: "Marie Chen",
      role: "Motion Designer",
      speciality: "Animation & Effets Visuels",
      projects: 95,
      rating: 5.0,
      avatar: "/placeholder.svg"
    }
  ];

  return (
    <>
      <SEO 
        title="Communauté Monteurs Vidéo - Réseau Professionnel | VideoCut"
        description="Rejoignez la plus grande communauté de monteurs vidéo, éditeurs et créateurs de contenu. Partagez vos projets, collaborez et développez votre réseau professionnel."
        keywords="communauté monteurs vidéo, réseau vidéastes, collaboration montage, forum éditeurs vidéo, partage projets, networking audiovisuel"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "OnlineGroup",
          "name": "Communauté VideoCut",
          "description": "Communauté de monteurs vidéo professionnels",
          "url": "https://videocut.lovable.app/community"
        }}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Communauté VideoCut
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Rejoignez le plus grand réseau de monteurs vidéo, éditeurs professionnels et créateurs de contenu. 
              Collaborez, partagez vos projets et développez votre carrière dans l'audiovisuel.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Users className="w-5 h-5 mr-2" />
              Rejoindre la Communauté
            </Button>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {communityStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Featured Members */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Membres Mis en Avant</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">{member.speciality}</p>
                    <div className="flex justify-center items-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <Share2 className="w-4 h-4 mr-1" />
                        {member.projects} projets
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {member.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Community Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Forums de Discussion</CardTitle>
                <CardDescription>
                  Échangez sur les techniques de montage, logiciels d'édition et tendances du secteur audiovisuel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Partage de Projets</CardTitle>
                <CardDescription>
                  Présentez vos réalisations, recevez des feedbacks et inspirez-vous des créations de la communauté
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Concours Créatifs</CardTitle>
                <CardDescription>
                  Participez à des défis mensuels de montage vidéo et remportez des prix exclusifs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-yellow-100 dark:bg-yellow-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Mentorat & Entraide</CardTitle>
                <CardDescription>
                  Connectez-vous avec des mentors expérimentés et aidez les nouveaux monteurs à progresser
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-red-100 dark:bg-red-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Opportunités Freelance</CardTitle>
                <CardDescription>
                  Découvrez des missions de montage, collaborations et projets rémunérés exclusifs à la communauté
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-indigo-100 dark:bg-indigo-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Événements & Meetups</CardTitle>
                <CardDescription>
                  Participez à des événements en ligne et rencontres locales pour networker avec d'autres professionnels
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Prêt à Rejoindre Notre Communauté ?</h2>
            <p className="text-xl mb-6 opacity-90">
              Connectez-vous avec plus de 2,500 monteurs vidéo professionnels et développez votre carrière
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Users className="w-5 h-5 mr-2" />
              S'inscrire Gratuitement
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Community;
