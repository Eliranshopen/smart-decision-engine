import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
  return m ? m[1] : null;
}

export default function VideoModal({ url, title, onClose }) {
  const ytId = getYouTubeId(url);
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
    : url; // fallback: direct video URL used in <video> tag

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-ink-950/90 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-display font-semibold text-white text-sm truncate max-w-[80%]">
              {title}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-ink-800 border border-white/10 flex items-center justify-center
                         text-gray-400 hover:text-white hover:border-amber-500/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video frame */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10"
               style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
            {ytId ? (
              <iframe
                src={embedSrc}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <video
                src={url}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full bg-black"
              />
            )}
          </div>

          {/* Amber glow */}
          <div className="absolute -inset-1 rounded-3xl bg-amber-500/5 blur-xl -z-10 pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
