import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe, BookOpen, Users, GraduationCap, HeartHandshake } from 'lucide-react';
import Logo from '@/components/Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';

const MainIndex = () => {
  const isMobile = useIsMobile();

  // Impact Metrics
  const impactStats = [
    { id: 1, value: '50K+', label: 'Learners Empowered', icon: <Users className="w-6 h-6" /> },
    { id: 2, value: '100+', label: 'Employers', icon: <Globe className="w-6 h-6" /> },
    { id: 3, value: '1K+', label: 'Trained Educators', icon: <GraduationCap className="w-6 h-6" /> },
    { id: 4, value: '10+', label: 'Local Languages', icon: <BookOpen className="w-6 h-6" /> }
  ];

  return <div className="min-h-screen flex flex-col bg-background text-foreground">
    {/* Navigation */}
    <header className="sticky top-0 z-10 w-full py-3 px-4 md:py-4 md:px-6 lg:px-12 flex items-center justify-between border-b border-border bg-background">
      <div className="flex items-center space-x-4 md:space-x-8">
        <div className="flex items-center gap-2">
          <Logo className="text-lg md:text-xl" />
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        <Link to="/auth?mode=signup">
          <Button size={isMobile ? "sm" : "default"} className="bg-primary hover:bg-primary/90">Log In</Button>
        </Link>
        <Link to="/auth?mode=register">
          <Button size={isMobile ? "sm" : "default"} className="bg-secondary hover:bg-secondary/90">Sign Up</Button>
        </Link>
      </div>
    </header>

    {/* Hero section */}
    <section className="w-full py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 flex flex-col items-center text-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Education Without <span className="text-primary">Boundaries</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Empowering communities with quality learning resources, localized content, and lifelong skills development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg">
                Start Learning
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Impact Section */}
    <section className="w-full py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Committed to achieving UN Sustainable Development Goal 4: Quality Education for All
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {impactStats.map(stat => (
            <Card key={stat.id} className="bg-background hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4 text-primary">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why VidyaVahini?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for communities with limited educational resources
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
            <div className="mb-4 text-primary">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Offline Accessibility</h3>
            <p className="text-muted-foreground">Learn without internet - download courses and access them anytime</p>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
            <div className="mb-4 text-primary">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Localized Curriculum</h3>
            <p className="text-muted-foreground">Content available in regional languages and cultural context</p>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
            <div className="mb-4 text-primary">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Focused</h3>
            <p className="text-muted-foreground">Collaborative learning and local skill development programs</p>
          </div>
        </div>
      </div>
    </section>

    {/* CTA section */}
    <section className="w-full py-20 bg-primary/90">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Join the Education Revolution
        </h2>
        <p className="text-lg mb-8 text-white/90">
          Whether you're a learner, educator, or employer - together we can bridge the educational divide
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth?mode=signup">
            <Button className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="w-full py-12 bg-card text-card-foreground border-t border-border">
      <div className="mt-0 text-center text-muted-foreground text-sm">
        <p>© 2025 VidyaVahini. Committed to equitable education worldwide.</p>
      </div>
    </footer>
  </div>;
};

export default MainIndex;