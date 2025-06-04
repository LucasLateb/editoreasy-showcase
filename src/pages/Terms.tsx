
import React from 'react';
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';

const Terms = () => {
  return (
    <>
      <SEO 
        title="Conditions Générales d'Utilisation - CGU | VideoCut"
        description="Consultez nos conditions générales d'utilisation (CGU) pour la plateforme VideoCut. Droits, obligations et règles d'usage de notre service."
        keywords="conditions générales utilisation, CGU, termes service, règles utilisation, VideoCut, contrat utilisateur"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Conditions Générales d'Utilisation VideoCut",
          "description": "Conditions générales d'utilisation et termes de service",
          "url": "https://videocut.lovable.app/terms"
        }}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
            
            <p className="text-muted-foreground mb-8 text-center">
              Last updated: [May 2025]
            </p>
            
            <p className="text-lg mb-8">
              Welcome to VideoCut. These Terms of Service ("Terms") govern your access to and use of the VideoCut platform (the "Service"). By using our platform, you agree to these Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of the Platform</h2>
            <p className="mb-6">
              You must be at least 18 years old to use VideoCut. You are responsible for your account and any activity that occurs through it.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Content</h2>
            <p className="mb-6">
              You retain ownership of all content you upload. By uploading videos, images, or profile information, you grant VideoCut a non-exclusive license to display and promote your content within the platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Prohibited Use</h2>
            <p className="mb-6">
              You agree not to use the platform for any unlawful, abusive, or harmful purpose, including infringing copyright or harassing others.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Subscription & Billing</h2>
            <p className="mb-6">
              VideoCut offers free and paid plans. Paid plans are billed monthly and can be canceled anytime. No refunds are provided for unused periods.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Termination</h2>
            <p className="mb-6">
              We reserve the right to suspend or terminate your account if you violate these Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="mb-6">
              We are not responsible for indirect damages, loss of profits, or data loss. Use the platform at your own risk.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to Terms</h2>
            <p className="mb-8">
              We may modify these Terms at any time. Continued use of the platform implies acceptance of the updated terms.
            </p>

            <hr className="my-8 border-border" />

            <p className="text-center text-muted-foreground">
              If you have any questions, contact us at{' '}
              <a 
                href="mailto:support@videocut.app" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                support@videocut.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
