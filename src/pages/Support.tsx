
import React, { useState } from 'react';
import { Search, HelpCircle, MessageCircle, Mail, Phone, BookOpen, Video, Settings, CreditCard } from 'lucide-react';
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Premiers Pas',
      icon: BookOpen,
      questions: [
        {
          q: "Comment créer mon portfolio de monteur vidéo sur VideoCut ?",
          a: "Inscrivez-vous gratuitement, complétez votre profil professionnel, ajoutez vos spécialités de montage et téléchargez vos meilleures réalisations vidéo."
        },
        {
          q: "Quels formats vidéo puis-je télécharger pour mon showreel ?",
          a: "Nous supportons MP4, MOV, AVI, MKV jusqu'à 100MB. Recommandé : MP4 en 1080p pour une qualité optimale et un chargement rapide."
        },
        {
          q: "Comment optimiser mon profil pour attirer plus de clients ?",
          a: "Utilisez des mots-clés pertinents (montage vidéo, post-production), ajoutez des témoignages clients et mettez à jour régulièrement votre portfolio."
        }
      ]
    },
    {
      id: 'portfolio',
      title: 'Gestion Portfolio',
      icon: Video,
      questions: [
        {
          q: "Comment organiser mes vidéos par catégories ?",
          a: "Utilisez notre système de tags : mariage, corporate, publicité, documentaire, motion design, etc. pour faciliter la découverte."
        },
        {
          q: "Puis-je personnaliser l'apparence de mon portfolio ?",
          a: "Oui, choisissez parmi nos thèmes professionnels, personnalisez vos couleurs et ajoutez votre logo pour refléter votre identité visuelle."
        },
        {
          q: "Comment ajouter des informations sur mes projets ?",
          a: "Pour chaque vidéo, renseignez le titre, description, client, durée du projet, logiciels utilisés (Premiere, Final Cut, DaVinci) et techniques employées."
        }
      ]
    },
    {
      id: 'account',
      title: 'Compte & Facturation',
      icon: CreditCard,
      questions: [
        {
          q: "Quelles sont les différences entre les plans gratuit et premium ?",
          a: "Plan gratuit : 5 vidéos, profil basique. Premium : vidéos illimitées, analytics avancés, domaine personnalisé, support prioritaire."
        },
        {
          q: "Comment modifier mes informations de facturation ?",
          a: "Accédez à votre tableau de bord, section 'Facturation', puis mettez à jour vos coordonnées de paiement et adresse de facturation."
        },
        {
          q: "Puis-je annuler mon abonnement à tout moment ?",
          a: "Oui, annulation sans engagement depuis votre compte. Vos données restent accessibles jusqu'à la fin de la période payée."
        }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Chat en Direct",
      description: "Support instantané pour questions urgentes",
      action: "Démarrer une conversation",
      available: "Lun-Ven 9h-18h"
    },
    {
      icon: Mail,
      title: "Email Support", 
      description: "Réponse détaillée sous 24h",
      action: "support@videocut.com",
      available: "7j/7"
    },
    {
      icon: Phone,
      title: "Support Téléphonique",
      description: "Assistance technique personnalisée",
      action: "+33 1 23 45 67 89",
      available: "Premium uniquement"
    }
  ];

  return (
    <>
      <SEO 
        title="Support & Aide Monteurs Vidéo - Centre d'Assistance | VideoCut"
        description="Centre d'aide complet pour monteurs vidéo : FAQ, tutoriels, support technique, gestion portfolio, facturation et assistance personnalisée."
        keywords="support montage vidéo, aide éditeur vidéo, FAQ portfolio, assistance technique, service client, tutoriels monteur, dépannage"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "name": "Support VideoCut",
          "description": "Centre d'aide pour monteurs vidéo",
          "url": "https://videocut.lovable.app/support"
        }}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Centre d'Aide VideoCut
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Trouvez rapidement des réponses à vos questions sur la création de portfolio, 
              gestion de compte, facturation et optimisation de votre présence professionnelle.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher dans l'aide : portfolio, montage, facturation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button className="w-full mb-2">
                      {option.action}
                    </Button>
                    <p className="text-sm text-muted-foreground">{option.available}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
            <Tabs defaultValue="getting-started" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {category.title}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {faqCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                          {faq.q}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.a}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Resources Section */}
          <div className="bg-card rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Ressources Supplémentaires</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Guides Complets</h3>
                <p className="text-sm text-muted-foreground">
                  Tutoriels détaillés sur la création de portfolio professionnel pour monteurs
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Vidéos Tutoriels</h3>
                <p className="text-sm text-muted-foreground">
                  Formations vidéo sur l'optimisation SEO et la présentation de projets
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">API Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Intégration avancée pour développeurs et agences de production
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 dark:bg-yellow-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Communauté</h3>
                <p className="text-sm text-muted-foreground">
                  Forum d'entraide entre monteurs vidéo et échanges de bonnes pratiques
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
