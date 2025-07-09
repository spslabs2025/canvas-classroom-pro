import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-lg p-8">
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using TutorBox, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>

            <h2 className="text-xl font-semibold mb-4">Use License</h2>
            <p className="mb-4">
              Permission is granted to use TutorBox for personal and educational purposes. 
              This license shall automatically terminate if you violate any of these restrictions.
            </p>

            <h2 className="text-xl font-semibold mb-4">User Content</h2>
            <p className="mb-4">
              You retain ownership of all content you create using our platform. By uploading content, 
              you grant us a license to process and store your content for the purpose of providing our service.
            </p>

            <h2 className="text-xl font-semibold mb-4">Prohibited Uses</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Using the service for any unlawful purpose</li>
              <li>Uploading malicious or harmful content</li>
              <li>Attempting to gain unauthorized access to the service</li>
              <li>Violating intellectual property rights</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">Service Availability</h2>
            <p className="mb-4">
              We strive to maintain service availability but cannot guarantee uninterrupted access. 
              We reserve the right to modify or discontinue the service with notice.
            </p>

            <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="mb-4">
              TutorBox shall not be liable for any damages arising from the use or inability to use our service.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;