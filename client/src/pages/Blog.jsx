import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, Tag, ChevronRight, Search, TrendingUp, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { ARTICLES, CATEGORIES } from '../data/articles';

const CAT_COLORS = {
  rates:  'bg-blue-100 text-blue-700',
  rental: 'bg-purple-100 text-purple-700',
  guide:  'bg-green-100 text-green-700',
  tips:   'bg-orange-100 text-orange-700',
};

function ArticleCard({ article, featured = false }) {
  return (
    <Link to={`/blog/${article.slug}`}
      className={`group block bg-white rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden ${featured ? 'md:flex' : ''}`}>
      {/* Color banner (no image needed — topical color strip) */}
      <div className={`h-2 w-full ${featured ? 'md:h-auto md:w-2' : ''} ${
        article.category === 'rates'  ? 'bg-blue-500' :
        article.category === 'rental' ? 'bg-purple-500' :
        article.category === 'guide'  ? 'bg-green-500' : 'bg-orange-500'
      }`} />

      <div className="p-5 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CAT_COLORS[article.category] || 'bg-gray-100 text-gray-600'}`}>
            {CATEGORIES.find(c => c.id === article.category)?.label || article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" /> {article.readMin} min read
          </span>
        </div>

        <h2 className={`font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug mb-2 ${featured ? 'text-xl' : 'text-base'}`}>
          {article.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(article.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-xs font-semibold text-orange-500 flex items-center gap-1 group-hover:gap-2 transition-all">
            Padho <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const featured = ARTICLES.filter(a => a.featured);

  const filtered = useMemo(() => {
    let list = ARTICLES;
    if (activeCategory !== 'all') list = list.filter(a => a.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some(t => t.includes(q))
      );
    }
    return list;
  }, [activeCategory, query]);

  return (
    <>
      <Helmet>
        <title>Construction Guide & Rates — Nirman Setu Blog | Jharkhand</title>
        <meta name="description" content="Jharkhand construction guide — cement price Ranchi, JCB rent, ghar banane ka kharcha, material rate list. Free tips aur updated rates." />
        <meta property="og:title" content="Construction Guide & Rates — Nirman Setu Blog" />
        <meta property="og:description" content="Cement price, sariya rate, JCB rent, ghar ka total kharcha — Jharkhand ke liye updated construction guides." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://nirmansetu.com/blog" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-500 uppercase tracking-wide">Construction Guide</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Rates, Guides & Tips<br />
              <span className="text-orange-500">Jharkhand Construction ke Liye</span>
            </h1>
            <p className="text-gray-500 text-sm max-w-xl">
              Cement price, sariya rate, JCB rent, ghar banane ka kharcha — sab updated info ek jagah. Free aur reliable.
            </p>

            {/* Search */}
            <div className="relative mt-5 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cement price, JCB rent, ghar kharcha..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">

          {/* Featured articles */}
          {!query && activeCategory === 'all' && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Popular Articles</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {featured.map(a => <ArticleCard key={a.slug} article={a} />)}
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setQuery(''); }}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Article grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Koi result nahi mila</p>
              <p className="text-sm mt-1">Dusra keyword try karo</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(a => <ArticleCard key={a.slug} article={a} />)}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 bg-orange-500 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Material Ka Best Price Chahiye?</h3>
            <p className="text-orange-100 text-sm mb-5">
              Nirman Setu pe request karo — verified Jharkhand suppliers se 2 ghante mein quote milega.
            </p>
            <Link to="/request"
              className="inline-block bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Free Quote Lo →
            </Link>
          </div>
        </div>

        <WhatsAppButton message="Blog padh ke quote lena chahta hoon — help karo" />
        <Footer />
      </div>
    </>
  );
}
