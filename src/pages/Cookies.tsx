
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';

const Cookies: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <div className="min-h-screen">
        <SEO
          title="Cookie Policy - VideoCut"
          description="Learn about how VideoCut uses cookies to enhance your experience on our platform."
          keywords="cookies, privacy, data collection, user experience"
        />
        
        <Navbar />
        
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
              <p className="text-muted-foreground text-lg mb-8">Last updated: May 2025</p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
                  <p className="text-muted-foreground">
                    Cookies are small text files that are stored on your device when you visit our website. 
                    They help us provide you with a better experience by remembering your preferences and analyzing how you use our platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-medium mb-2">Essential Cookies</h3>
                      <p className="text-muted-foreground">
                        These cookies are necessary for the website to function properly. They enable core functionality 
                        such as user authentication and security features.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Analytics Cookies</h3>
                      <p className="text-muted-foreground">
                        We use analytics cookies to understand how visitors interact with our website. 
                        This helps us improve our platform and user experience.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Functional Cookies</h3>
                      <p className="text-muted-foreground">
                        These cookies remember your preferences and settings to provide you with a 
                        personalized experience across your visits.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
                  <p className="text-muted-foreground mb-4">
                    You can control and manage cookies in several ways:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Browser Settings: Most browsers allow you to control cookies through their settings</li>
                    <li>Opt-out Tools: You can use browser extensions to block tracking cookies</li>
                    <li>Clear Cookies: You can delete existing cookies from your browser</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Please note that disabling certain cookies may affect the functionality of our website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
                  <p className="text-muted-foreground">
                    We may use third-party services that set their own cookies. These include analytics providers, 
                    payment processors, and social media platforms. Please refer to their respective privacy policies 
                    for more information about their cookie practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Cookie Policy from time to time. Any changes will be posted on this page 
                    with an updated revision date.
                  </p>
                </section>

                <div className="border-t pt-8 mt-12">
                  <p className="text-muted-foreground">
                    If you have any questions about our use of cookies, please contact us at{' '}
                    <a href="mailto:privacy@videocut.app" className="text-primary hover:underline">
                      privacy@videocut.app
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-secondary py-8 border-t">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              © 2025 VideoCut. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default Cookies;
