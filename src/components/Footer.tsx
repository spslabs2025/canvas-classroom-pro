
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-blue-100 py-4">
      <div className="container mx-auto px-4 text-center">
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
          {' • '}
          <Link 
            to="/about" 
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
          >
            About Us
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
