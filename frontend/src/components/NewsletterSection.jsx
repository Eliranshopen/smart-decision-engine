import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, Loader2, Zap } from 'lucide-react';
import api from '../lib/api';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setState('loading');
    try {
      await api.post('/api/subscription', { email, plan: 'free' });
      setState('success');
    } catch (err) {
      setErrMsg(err.message || 'Something went wrong');
      setState('error');
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl px-6 py-8 my-10"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
    >
      {/* bg glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-2xl"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        {/* Icon + text */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-violet-400">Weekly AI Picks</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Stay ahead of the curve</h3>
          <p className="text-sm text-white/40">
            Get the best new AI tools &amp; courses every week — curated, ranked, free.
          </p>
        </div>

        {/* Form */}
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-emerald-400 py-3 justify-center"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">You're in! Check your inbox.</span>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                >
                  {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          {state === 'error' && (
            <p className="text-red-400 text-xs mt-1 text-center">{errMsg}</p>
          )}
          {state !== 'success' && (
            <p className="text-white/20 text-[10px] text-center mt-2">No spam. Unsubscribe anytime.</p>
          )}
        </div>
      </div>
    </div>
  );
}
