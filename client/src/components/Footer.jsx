import { Link } from 'react-router-dom';
import { HardHat, Phone, Mail, MapPin } from 'lucide-react';
import useT from '../i18n/useT';

function GithubIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 7c.85 0 1.71.12 2.51.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedinIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.67H9.34V8.98h3.42v1.57h.05a3.75 3.75 0 0 1 3.37-1.85c3.61 0 4.27 2.38 4.27 5.47v6.28ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.04H3.53V8.98H7.1v11.47ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
    </svg>
  );
}

export default function Footer() {
  const t = useT();
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
            <p className="text-sm leading-relaxed max-w-xs">{t('footer.tagline')}</p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <a href="tel:+916299209933" className="hover:text-orange-400 transition-colors">+91 62992 09933</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <a href="mailto:akshaycodex@gmail.com" className="hover:text-orange-400 transition-colors">akshaycodex@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Jharkhand, India</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/request" className="hover:text-orange-400 transition-colors">{t('footer.placeOrder')}</Link></li>
              <li><Link to="/track" className="hover:text-orange-400 transition-colors">{t('footer.trackOrder')}</Link></li>
              <li><a href="#categories" className="hover:text-orange-400 transition-colors">{t('footer.categories')}</a></li>
              <li><a href="#how-it-works" className="hover:text-orange-400 transition-colors">{t('footer.howItWorks')}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-orange-400 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-400 transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>&copy; {new Date().getFullYear()} Nirman Setu. {t('footer.rights')}</p>
          <p>{t('footer.made')}</p>
        </div>

        {/* Owner / Developer credit */}
        <div className="border-t border-gray-800 mt-4 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>
            Built by <span className="text-white font-medium">Akshay Kumar Mandal</span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/akshaycodexx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              akshaycodexx
            </a>
            <a
              href="https://linkedin.com/in/akshaycodex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              akshaycodex
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
