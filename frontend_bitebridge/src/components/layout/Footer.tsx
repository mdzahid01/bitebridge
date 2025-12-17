import { Link } from 'react-router-dom';
import { 
  Store, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Brand Section */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="bg-orange-600 text-white p-2 rounded-lg">
                <Store size={24} />
              </span>
              <span className="font-bold text-2xl tracking-tighter text-white">
                Bite<span className="text-orange-500">Bridge</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-80 mb-6">
              Connecting food lovers with the best local vendors. Scan, order, and enjoy seamless dining experiences without the wait.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Facebook size={20} />} />
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Instagram size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/scan">Scan & Order</FooterLink>
              <FooterLink to="/menu">Browse Menu</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
            </ul>
          </div>

          {/* 3. For Business / Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <FooterLink to="/vendor/signup" className="text-orange-400 hover:text-orange-300 font-semibold">
                Become a Vendor
              </FooterLink>
              <FooterLink to="/vendor/login">Vendor Login</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-orange-500 mt-1 flex-shrink-0" />
                <span className="text-sm">123 Foodie Street, Tech Park, Bangalore, India 560001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm">support@bitebridge.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM SECTION: COPYRIGHT */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
          <p>© {new Date().getFullYear()} BiteBridge. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Helper Components for Clean Code ---

const FooterLink = ({ to, children, className = "" }: any) => (
  <li>
    <Link 
      to={to} 
      className={`hover:text-orange-500 transition-colors duration-200 block ${className}`}
    >
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ icon }: any) => (
  <a 
    href="#" 
    className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 hover:text-white transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;