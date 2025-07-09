import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const EULA = () => {
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
            End-User License Agreement
          </h1>
          
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-lg p-8">
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold mb-4">License Grant</h2>
            <p className="mb-4">
              Subject to the terms of this EULA, TutorBox grants you a limited, non-exclusive, 
              non-transferable license to use the software for your personal or educational purposes.
            </p>

            <h2 className="text-xl font-semibold mb-4">Restrictions</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You may not reverse engineer, decompile, or disassemble the software</li>
              <li>You may not distribute, sell, or sublicense the software</li>
              <li>You may not use the software for commercial purposes without a commercial license</li>
              <li>You may not remove or alter any copyright notices</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
            <p className="mb-4">
              The software and all intellectual property rights therein are and shall remain 
              the property of TutorBox and its licensors.
            </p>

            <h2 className="text-xl font-semibold mb-4">Updates and Modifications</h2>
            <p className="mb-4">
              We may provide updates to the software from time to time. These updates may be 
              automatically installed to ensure optimal performance and security.
            </p>

            <h2 className="text-xl font-semibold mb-4">Termination</h2>
            <p className="mb-4">
              This license is effective until terminated. Your rights under this license will 
              terminate automatically if you fail to comply with any terms herein.
            </p>

            <h2 className="text-xl font-semibold mb-4">Support and Maintenance</h2>
            <p className="mb-4">
              Support and maintenance services are provided at our discretion and may be 
              subject to additional terms and fees.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EULA;