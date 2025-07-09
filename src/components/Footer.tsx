
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-blue-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-600">
            © 2024 TutorBox. A product of{' '}
            <a 
              href="https://spslabs.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              SPS Labs
            </a>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              to="/about" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              About Us
            </Link>
            <Link 
              to="/privacy-policy" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              Terms of Service
            </Link>
            <Link 
              to="/eula" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              EULA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
