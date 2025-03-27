import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Code, Database, BrainCircuit, TrendingUp, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
const MainIndex = () => {
  const isMobile = useIsMobile();

  // Popular course categories
  const popularCategories = [{
    id: 1,
    name: 'Data Science',
    icon: <Database className="w-5 h-5" />,
    count: '782 courses'
  }, {
    id: 2,
    name: 'Programming',
    icon: <Code className="w-5 h-5" />,
    count: '1,204 courses'
  }, {
    id: 3,
    name: 'AI & Machine Learning',
    icon: <BrainCircuit className="w-5 h-5" />,
    count: '340 courses'
  }, {
    id: 4,
    name: 'Business Analytics',
    icon: <TrendingUp className="w-5 h-5" />,
    count: '590 courses'
  }];

  // Featured Instructors
  const featuredInstructors = [{
    id: 1,
    name: 'Data Science',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  }, {
    id: 2,
    name: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
  }, {
    id: 3,
    name: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  }];

  // Learning paths
  const learningPaths = [{
    id: 1,
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80',
    title: 'Learn programming basics',
    description: 'Master the fundamentals of programming with our structured learning path'
  }, {
    id: 2,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    title: 'Master data analysis',
    description: 'From basics to advanced techniques in data visualization and interpretation'
  }];
  return <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-10 w-full py-3 px-4 md:py-4 md:px-6 lg:px-12 flex items-center justify-between border-b border-border bg-background">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Logo className="text-lg md:text-xl" />
          <Link to="/explore" className="text-muted-foreground hover:text-foreground hidden md:block">
            Explore
          </Link>
        </div>

        <div className="relative md:w-80 hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input type="text" className="pl-10 pr-4 py-2 bg-muted text-foreground border-none rounded-full w-full focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search for anything" />
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <Link to="/auth?mode=signin" className="text-muted-foreground hover:text-foreground font-medium text-sm md:text-base">Log in</Link>
          <Link to="/auth?mode=signup">
            <Button size={isMobile ? "sm" : "default"} className="bg-primary hover:bg-primary/90">Sign up</Button>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="w-full py-8 md:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-foreground">
              Skills for your present (and your future)
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
              Get started with us and explore thousands of courses.
            </p>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                Start Learning Now
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2">
            <img alt="Students learning together" className="rounded-lg shadow-lg w-full h-auto" src="/lovable-uploads/5214440c-1f13-41e8-8b9a-a5d372793831.jpg" />
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="w-full py-8 md:py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-center">From critical skills to technical topics</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12">Courses support your professional development</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {popularCategories.map(category => <Card key={category.id} className="bg-card hover:border-primary/50 transition-colors">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {category.icon}
                    <h3 className="font-medium text-base md:text-lg">{category.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </CardContent>
              </Card>)}
          </div>
          
          <div className="text-center mt-6 md:mt-8">
            <Button variant="outline" className="border-border text-foreground">
              Browse all categories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Learning paths section */}
      <section className="w-full py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex justify-between items-end mb-6 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold">Popular learning paths</h2>
            <Button variant="outline" size="sm" className="border-border text-foreground hidden sm:flex">
              View all
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {learningPaths.map(path => <Card key={path.id} className="overflow-hidden bg-card border-border">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  <img src={path.image} alt={path.title} className="w-full sm:w-28 h-28 object-cover rounded-lg" />
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-lg mb-2">{path.title}</h3>
                    <p className="text-muted-foreground mb-4">{path.description}</p>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 w-fit">
                      Learn more
                    </Button>
                  </div>
                </div>
              </Card>)}
          </div>
          
          <div className="flex justify-center mt-6 sm:hidden">
            <Button variant="outline" size="sm" className="border-border text-foreground">
              View all paths
            </Button>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="w-full py-8 md:py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Featured categories</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
            {featuredInstructors.map(instructor => <Card key={instructor.id} className="w-full sm:w-auto bg-card">
                <CardContent className="p-4 flex items-center justify-start gap-3">
                  <img src={instructor.avatar} alt={instructor.name} className="w-10 h-10 rounded-full mr-2 object-cover" />
                  <span className="font-medium">{instructor.name}</span>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full py-10 md:py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 text-white">Ready to start learning?</h2>
          <p className="mb-6 md:mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of students already learning on our platform. Get access to hundreds of courses today.
          </p>
          <Link to="/auth?mode=signup">
            <Button className="bg-white text-primary hover:bg-white/90">
              Sign up now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 md:py-12 bg-card text-card-foreground border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="font-bold mb-3 md:mb-4">EduForAll</h3>
              <p className="text-muted-foreground text-sm">Empowering education through technology</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 md:mb-4">Courses</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary">Popular Courses</a></li>
                <li><a href="#" className="hover:text-primary">New Releases</a></li>
                <li><a href="#" className="hover:text-primary">Featured</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 md:mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 md:mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>© 2023 EduForAll. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default MainIndex;