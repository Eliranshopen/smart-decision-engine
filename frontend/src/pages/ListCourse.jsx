import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BookOpen, DollarSign, Link2, Mail, User, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import api from '../lib/api';

const CATEGORIES = ['AI & Machine Learning', 'Digital Marketing', 'E-commerce', 'Programming', 'Finance & Investing', 'Business', 'Design', 'Other'];

export default function ListCourse() {
  const { i18n } = useTranslation();
  const isHE = i18n.language === 'he';

  const [form, setForm] = useState({
    name: '', email: '', course_name: '', course_url: '',
    category: '', commission_pct: '', description: '',
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await api.post('/api/vendor-applications', form);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Submission failed. Please try again.');
    }
  };

  const content = {
    en: {
      badge: 'For Course Creators',
      title: 'List Your Course',
      subtitle: 'Join our affiliate program. We promote your course to our audience — you pay us commission only when a sale is made.',
      howTitle: 'How it works',
      steps: [
        { icon: BookOpen, title: 'Submit your course', desc: 'Fill in the form with your course details and desired commission rate.' },
        { icon: CheckCircle, title: 'We review & approve', desc: 'Our team reviews your submission within 48 hours.' },
        { icon: Zap, title: 'AI starts promoting', desc: 'Your course appears in our recommendations and AI-curated feeds.' },
        { icon: DollarSign, title: 'Earn on every sale', desc: 'You keep the majority — we take a small commission per conversion.' },
      ],
      form: {
        name: 'Your Full Name',
        email: 'Email Address',
        course_name: 'Course Name',
        course_url: 'Course URL',
        category: 'Category',
        commission_pct: 'Commission % you offer us (e.g. 30)',
        description: 'Brief description of your course',
        submit: 'Submit Application',
        submitting: 'Submitting...',
      },
      success: { title: "Application received!", body: "We'll review your course and get back to you within 48 hours." },
    },
    he: {
      badge: 'לבעלי קורסים',
      title: 'רשום את הקורס שלך',
      subtitle: 'הצטרף לתכנית השותפים שלנו. אנחנו מקדמים את הקורס שלך לקהל שלנו — אתה משלם עמלה רק כשיש מכירה.',
      howTitle: 'איך זה עובד',
      steps: [
        { icon: BookOpen, title: 'הגש את הקורס שלך', desc: 'מלא את הטופס עם פרטי הקורס ואחוז העמלה הרצוי.' },
        { icon: CheckCircle, title: 'אנחנו בודקים ומאשרים', desc: 'הצוות שלנו בוחן את הבקשה תוך 48 שעות.' },
        { icon: Zap, title: 'הבינה המלאכותית מתחילה לקדם', desc: 'הקורס שלך מופיע בהמלצות ובפידים החכמים שלנו.' },
        { icon: DollarSign, title: 'הרוויח על כל מכירה', desc: 'אתה שומר את הרוב — אנחנו לוקחים עמלה קטנה לכל המרה.' },
      ],
      form: {
        name: 'שם מלא',
        email: 'כתובת אימייל',
        course_name: 'שם הקורס',
        course_url: 'קישור לקורס',
        category: 'קטגוריה',
        commission_pct: 'אחוז עמלה שאתה מציע לנו (למשל 30)',
        description: 'תיאור קצר של הקורס',
        submit: 'שלח בקשה',
        submitting: 'שולח...',
      },
      success: { title: 'הבקשה התקבלה!', body: 'נבדוק את הקורס שלך ונחזור אליך תוך 48 שעות.' },
    },
  };

  const c = content[isHE ? 'he' : 'en'];

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">{c.success.title}</h2>
          <p className="text-gray-400 text-sm">{c.success.body}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4">
          <DollarSign className="w-3 h-3" />
          {c.badge}
        </div>
        <h1 className="page-title mb-3">{c.title}</h1>
        <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">{c.subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* How it works */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="section-title mb-6">{c.howTitle}</h2>
          <div className="flex flex-col gap-4">
            {c.steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="font-display font-semibold text-white text-sm mb-0.5">{title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-4">
            {[
              { name: 'name', label: c.form.name, icon: User, type: 'text' },
              { name: 'email', label: c.form.email, icon: Mail, type: 'email' },
              { name: 'course_name', label: c.form.course_name, icon: BookOpen, type: 'text' },
              { name: 'course_url', label: c.form.course_url, icon: Link2, type: 'url' },
              { name: 'commission_pct', label: c.form.commission_pct, icon: DollarSign, type: 'number' },
            ].map(({ name, label, icon: Icon, type }) => (
              <div key={name}>
                <label className="block text-xs font-mono text-gray-500 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    className="w-full bg-ink-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                               text-sm text-white placeholder-gray-600 font-sans
                               focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
            ))}

            {/* Category select */}
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5">{c.form.category}</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-ink-900/60 border border-white/10 rounded-xl px-4 py-2.5
                           text-sm text-white font-sans focus:outline-none focus:border-amber-500/50 transition-colors"
              >
                <option value="" disabled>{c.form.category}</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5">{c.form.description}</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                required
                className="w-full bg-ink-900/60 border border-white/10 rounded-xl px-4 py-2.5
                           text-sm text-white font-sans resize-none
                           focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="amber-btn py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? c.form.submitting : c.form.submit}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
