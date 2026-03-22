import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, ArrowRight, TrendingUp, RefreshCw, Lock } from 'lucide-react';

const QUIZ_STEPS = ['goal', 'experience', 'risk'];

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizActive, setQuizActive] = useState(false);

  const currentStep = QUIZ_STEPS[quizStep];
  const totalSteps = QUIZ_STEPS.length;

  const questionOptions = Object.entries(
    t(`quiz.questions.${currentStep}.options`, { returnObjects: true })
  );

  const handleAnswer = (key) => {
    const newAnswers = { ...answers, [currentStep]: key };
    setAnswers(newAnswers);
    if (quizStep < totalSteps - 1) {
      setQuizStep(quizStep + 1);
    } else {
      navigate('/dashboard', { state: { answers: newAnswers } });
    }
  };

  const stats = [
    { value: '500+', label: t('hero.stats.programs'), icon: TrendingUp },
    { value: '24h', label: t('hero.stats.updated'), icon: RefreshCw },
    { value: '100%', label: t('hero.stats.free'), icon: Lock },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* Amber glow bg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {!quizActive ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 max-w-2xl"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono mb-6"
              >
                <Zap className="w-3 h-3" />
                {t('hero.badge')}
              </motion.div>

              {/* Title */}
              <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight mb-4">
                {t('hero.title')}{' '}
                <span className="text-amber-400">{t('hero.titleAccent')}</span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                {t('hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setQuizActive(true)}
                  className="amber-btn flex items-center gap-2 text-base px-8 py-3"
                >
                  {t('hero.cta')} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="ghost-btn text-base px-8 py-3"
                >
                  {t('hero.ctaSecondary')}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
                {stats.map(({ value, label, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <div className="font-mono font-bold text-2xl text-amber-400">{value}</div>
                    <div className="text-gray-500 text-xs mt-1 font-mono">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 w-full max-w-lg"
            >
              {/* Quiz card */}
              <div className="glass-card p-8">
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-gray-500">
                    {t('quiz.step', { current: quizStep + 1, total: totalSteps })}
                  </span>
                  <div className="flex gap-1.5">
                    {QUIZ_STEPS.map((_, i) => (
                      <div key={i} className={`h-1 w-8 rounded-full transition-colors duration-300
                        ${i <= quizStep ? 'bg-amber-500' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-display font-bold text-2xl text-white mb-6 text-left">
                      {t(`quiz.questions.${currentStep}.label`)}
                    </h2>

                    <div className="flex flex-col gap-2.5">
                      {questionOptions.map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => handleAnswer(key)}
                          className="w-full text-left px-5 py-4 rounded-xl border border-white/10 hover:border-amber-500/40
                                     bg-ink-900/40 hover:bg-amber-500/10 text-gray-300 hover:text-white
                                     font-sans text-sm transition-all duration-200 group flex items-center justify-between"
                        >
                          <span>{label}</span>
                          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {quizStep > 0 && (
                  <button
                    onClick={() => setQuizStep(quizStep - 1)}
                    className="mt-4 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {t('quiz.back')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
