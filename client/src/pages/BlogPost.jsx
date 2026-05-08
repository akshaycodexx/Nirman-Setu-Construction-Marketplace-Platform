import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, Tag, ArrowLeft, ChevronRight, Share2, CheckCircle, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';
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

// ── Section renderers ─────────────────────────────────────────────────────────

function renderText(text) {
  // Bold: **text** → <strong>
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function Section({ s }) {
  switch (s.type) {
    case 'para':
      return <p className="text-gray-700 leading-relaxed text-[15px]">{renderText(s.text)}</p>;

    case 'h2':
      return <h2 className="text-xl font-bold text-gray-900 mt-2">{s.text}</h2>;

    case 'h3':
      return <h3 className="text-lg font-semibold text-gray-800 mt-1">{s.text}</h3>;

    case 'list':
      return (
        <div>
          {s.heading && <p className="font-semibold text-gray-800 mb-2">{s.heading}</p>}
          <ul className="space-y-2">
            {s.items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] text-gray-700">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>{renderText(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'table':
      return (
        <div>
          {s.heading && <p className="font-semibold text-gray-800 mb-2">{s.heading}</p>}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50">
                  {s.headers.map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2.5 text-gray-700 border-b border-gray-100 whitespace-nowrap">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {s.note && <p className="text-xs text-gray-400 mt-2 italic">{s.note}</p>}
        </div>
      );

    case 'tip':
      return (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{renderText(s.text)}</p>
        </div>
      );

    case 'warning':
      return (
        <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{renderText(s.text)}</p>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">Aksar Puchhe Jaane Wale Sawaal (FAQ)</h2>
          {s.items.map((item, i) => (
            <details key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group">
              <summary className="px-4 py-3 font-semibold text-gray-800 cursor-pointer text-sm list-none flex items-center justify-between">
                {item.q}
                <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      );

    default:
      return null;
  }
}

// ── Share handler ─────────────────────────────────────────────────────────────
function shareArticle(title) {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  }
}

// ── Related articles ──────────────────────────────────────────────────────────
function RelatedCard({ article }) {
  return (
    <Link to={`/blog/${article.slug}`}
      className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-300 hover:shadow-sm transition-all group">
      <div className={`w-1.5 rounded-full shrink-0 ${
        article.category === 'rates'  ? 'bg-blue-400' :
        article.category === 'rental' ? 'bg-purple-400' :
        article.category === 'guide'  ? 'bg-green-400' : 'bg-orange-400'
      }`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
          {article.titleShort || article.title}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {article.readMin} min
        </p>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = ARTICLES.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center px-4">
          <BookOpen className="w-12 h-12 text-gray-300" />
          <h1 className="text-xl font-bold text-gray-800">Article nahi mila</h1>
          <p className="text-gray-500 text-sm">Yeh article exist nahi karta ya URL galat hai.</p>
          <Link to="/blog" className="bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
            Blog par wapas jao
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const catLabel = CATEGORIES.find(c => c.id === article.category)?.label || article.category;
  const related = ARTICLES.filter(a => a.slug !== slug && a.category === article.category).slice(0, 4);
  const others = ARTICLES.filter(a => a.slug !== slug && a.category !== article.category).slice(0, 2);
  const suggestions = [...related, ...others].slice(0, 5);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Organization', name: 'Nirman Setu' },
    publisher: { '@type': 'Organization', name: 'Nirman Setu', logo: { '@type': 'ImageObject', url: 'https://nirmansetu.com/logo.png' } },
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Nirman Setu</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.date} />
        <meta name="keywords" content={article.tags.join(', ')} />
        <link rel="canonical" href={`https://nirmansetu.com/blog/${article.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
          <div className="lg:grid lg:grid-cols-[1fr_300px] gap-8 items-start">

            {/* ── Main article ─────────────────────────────────────────────── */}
            <article>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/blog" className="hover:text-orange-500 transition-colors">Blog</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-600 truncate max-w-[180px]">{article.titleShort || article.title}</span>
              </nav>

              {/* Header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CAT_COLORS[article.category] || 'bg-gray-100'}`}>
                    {catLabel}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {article.readMin} min read
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(article.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-3">{article.title}</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{article.description}</p>

                <div className="flex items-center gap-3">
                  <button onClick={() => shareArticle(article.title)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 transition-colors bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-lg">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content sections */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
                {article.sections.map((s, i) => <Section key={i} s={s} />)}
              </div>

              {/* CTA block */}
              <div className="mt-6 bg-orange-500 rounded-2xl p-6 text-white text-center">
                <h3 className="text-lg font-bold mb-1">{article.ctaText || 'Best Price Mein Material Lo'}</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Nirman Setu pe request karo — verified Jharkhand suppliers se 2 ghante mein quote.
                </p>
                <Link
                  to={article.ctaCategory ? `/request?category=${article.ctaCategory}` : '/request'}
                  className="inline-block bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
                  Free Quote Lo →
                </Link>
              </div>

              {/* Back to blog */}
              <div className="mt-4">
                <button onClick={() => navigate('/blog')}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Blog par wapas jao
                </button>
              </div>
            </article>

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="hidden lg:block space-y-5 sticky top-6">

              {/* Related articles */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Yeh Bhi Padho</h3>
                  <div className="space-y-2">
                    {suggestions.map(a => <RelatedCard key={a.slug} article={a} />)}
                  </div>
                </div>
              )}

              {/* Sticky CTA */}
              <div className="bg-orange-500 rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-1 text-sm">Material chahiye?</h3>
                <p className="text-orange-100 text-xs mb-3">Free quote — 2 ghante mein response guaranteed.</p>
                <Link to="/request"
                  className="block text-center bg-white text-orange-600 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                  Quote Lo →
                </Link>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { to: '/request', label: '→ Order Request Karo' },
                    { to: '/track', label: '→ Order Track Karo' },
                    { to: '/customer/estimator', label: '→ Material Calculator' },
                    { to: '/supplier/register', label: '→ Supplier Bano' },
                  ].map(({ to, label }) => (
                    <Link key={to} to={to} className="block text-gray-500 hover:text-orange-500 transition-colors">{label}</Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <WhatsAppButton message={`Blog padha: "${article.titleShort}" — quote lena chahta hoon`} />
        <Footer />
      </div>
    </>
  );
}
