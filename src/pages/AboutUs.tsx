
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Users, Zap, Shield, Heart } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">TutorBox</span>
          </Link>
          
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            About TutorBox
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're revolutionizing online education by providing creators with powerful tools to build, 
            record, and share interactive lessons that engage and inspire learners worldwide.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-12">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                To democratize education by empowering every educator with professional-grade tools 
                that make creating engaging, interactive content simple, accessible, and affordable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg text-center p-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community First</h3>
            <p className="text-sm text-gray-600">
              We believe in building tools that bring educators and learners together
            </p>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg text-center p-6">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
            <p className="text-sm text-gray-600">
              Constantly pushing boundaries to create cutting-edge educational technology
            </p>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg text-center p-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Security</h3>
            <p className="text-sm text-gray-600">
              Your data and content are protected with enterprise-grade security
            </p>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg text-center p-6">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Passion</h3>
            <p className="text-sm text-gray-600">
              We're passionate about making education more engaging and accessible
            </p>
          </Card>
        </div>

        {/* Story Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                TutorBox was born from a simple observation: great educators were struggling with 
                complex, expensive tools that got in the way of what they do best—teaching.
              </p>
              <p>
                Founded by a team of educators and technologists, we set out to create a platform 
                that puts the focus back on content creation and student engagement. Our intuitive 
                interface, powerful recording capabilities, and seamless sharing features have helped 
                thousands of educators reach millions of learners worldwide.
              </p>
              <p>
                Today, TutorBox continues to evolve, driven by feedback from our amazing community 
                of educators who inspire us every day to build better tools for better learning.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of educators who are already creating amazing content with TutorBox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-blue-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © 2024 TutorBox. A product of{' '}
            <a 
              href="https://spslabs.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              SPS Labs
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
