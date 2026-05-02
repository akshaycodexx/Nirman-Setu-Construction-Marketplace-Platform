import { Link } from 'react-router-dom';
import { HardHat, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Nirman <span className="text-orange-400">Setu</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Construction ka trusted platform. Cement, balu, gitti, JCB — sab kuch ek jagah, verified suppliers ke saath.
            </p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>+91 00000 00000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>support@nirmansetu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>Jharkhand, India</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/request" className="hover:text-orange-400 transition-colors">Place Order</Link></li>
              <li><Link to="/track" className="hover:text-orange-400 transition-colors">Track Order</Link></li>
              <li><a href="#categories" className="hover:text-orange-400 transition-colors">Categories</a></li>
              <li><a href="#how-it-works" className="hover:text-orange-400 transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-gray-600">
                Nirman Setu is an intermediary platform connecting customers with verified construction material suppliers.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>&copy; {new Date().getFullYear()} Nirman Setu. All rights reserved.</p>
          <p>Made with dedication for Indian construction industry</p>
        </div>
      </div>
    </footer>
  );
}
