import { Link } from 'react-router-dom';
import { HardHat, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6">
          <HardHat className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-8xl font-black text-orange-500 leading-none">404</h1>
        <p className="text-2xl font-bold text-white mt-3">Page nahi mila</p>
        <p className="text-gray-400 mt-2 mb-8">Yeh page exist nahi karta ya move ho gaya hai.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home Page
          </Link>
          <Link to="/track"
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
