
import React from 'react';
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';

const Privacy = () => {
  return (
    <>
      <SEO 
        title="Politique de Confidentialité - Protection des Données | VideoCut"
        description="Consultez notre politique de confidentialité détaillée sur la collecte, l'utilisation et la protection de vos données personnelles sur VideoCut."
        keywords="politique confidentialité, protection données, RGPD, vie privée, sécurité données, cookies, VideoCut"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Politique de Confidentialité VideoCut",
          "description": "Politique de confidentialité et protection des données personnelles",
          "url": "https://videocut.lovable.app/privacy"
        }}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
            
            <p className="text-muted-foreground mb-8 text-center">
              Last updated: [May 2025]
            </p>
            
            <p className="text-lg mb-8">
              Your privacy is important to us. This policy explains what data we collect and how we use it.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Data We Collect</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Name, email, password (encrypted)</li>
              <li>Profile information (bio, avatar, videos, tags)</li>
              <li>Usage metrics (views, clicks)</li>
              <li>Payment data (handled securely via third-party provider)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>To provide and personalize the service</li>
              <li>To enable user discovery and portfolio sharing</li>
              <li>To improve platform functionality and user experience</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Storage and Security</h2>
            <p className="mb-6">
              We use Supabase and industry-standard security to store and protect your data.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Services</h2>
            <p className="mb-6">
              We may integrate with external video platforms and payment providers. Their policies apply.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
            <p className="mb-6">
              You can access, modify or delete your data at any time from your dashboard or by contacting us.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies</h2>
            <p className="mb-8">
              We use cookies to enhance performance and collect analytics. You can manage cookies in your browser settings.
            </p>

            <hr className="my-8 border-border" />

            <p className="text-center text-muted-foreground">
              For questions about this policy, email us at{' '}
              <a 
                href="mailto:privacy@videocut.app" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                privacy@videocut.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
