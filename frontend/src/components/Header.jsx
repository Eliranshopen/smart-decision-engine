import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Zap, BarChart2, Newspaper, Globe, ChevronDown, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('sde_lang', lang);
    setLangOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: BarChart2 },
    { to: '/compare', label: 'Compare', icon: PlusCircle },
    { to: '/news', label: t('nav.news'), icon: Newspaper },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group no-underline">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Zap className="w-4 h-4 text-ink-950" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-white text-sm leading-none">Smart Decision</span>
            <span className="block font-mono text-amber-500 text-[10px] leading-none mt-0.5 tracking-widest uppercase">Engine</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-mono transition-all duration-200 no-underline
                  ${active
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language switcher */}
        <div className="relative shrink-0">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 hover:border-amber-500/30
                       text-gray-400 hover:text-white text-sm font-mono transition-all duration-200 cursor-pointer bg-transparent"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{i18n.language === 'he' ? 'HE' : 'EN'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 right-0 bg-ink-800 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 w-32"
            >
              {[
                { code: 'en', label: 'English', flag: '🇺🇸' },
                { code: 'he', label: 'עברית', flag: '🇮🇱' },
              ].map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => switchLang(code)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-mono transition-colors cursor-pointer bg-transparent border-none
                    ${i18n.language === code ? 'text-amber-400 bg-amber-500/10' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  <span>{flag}</span>
                  <span>{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
