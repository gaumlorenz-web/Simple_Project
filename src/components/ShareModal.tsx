import React, { useState } from 'react';
import { generateSocialShareLinks } from '../utils/share';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Send, 
  Mail, 
  QrCode,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  recipientName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  recipientName
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const links = generateSocialShareLinks(shareUrl, recipientName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Happy Birthday ${recipientName || ''}! 🎂`,
          text: `Check out this 3D Birthday card with balloons & cake!`,
          url: shareUrl
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  // Simple clean QR code preview using quick chart API SVG or data URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&color=d946ef&bgcolor=fff0f5`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-pink-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-pink-50 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-fun font-bold text-xl text-slate-800">
              Send Birthday Card to Ivy 💌
            </h3>
            <p className="text-xs text-slate-500">
              Send this dedicated 3D greeting & lively birthday song directly to Ivy!
            </p>
          </div>
        </div>

        {/* Share Link Copy Field */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Shareable Card Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-pink-50/80 border border-pink-200 rounded-2xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-700 font-mono truncate focus:outline-hidden"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-fun font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center justify-between">
            <span>Send directly via:</span>
            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="text-pink-600 hover:text-pink-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Device Share</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* WhatsApp */}
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 transition-all hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 text-sky-800 transition-all hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Send className="w-4 h-4 ml-0.5" />
              </div>
              <span className="text-xs font-semibold">Telegram</span>
            </a>

            {/* X / Twitter */}
            <a
              href={links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-all hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform font-bold text-xs">
                𝕏
              </div>
              <span className="text-xs font-semibold">X / Twitter</span>
            </a>

            {/* Email */}
            <a
              href={links.email}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-800 transition-all hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Email</span>
            </a>
          </div>
        </div>

        {/* QR Code toggle for physical gift cards */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-medium text-slate-600">
                Gift Tag QR Code (Print / Scan)
              </span>
            </div>
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
            >
              {showQr ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {showQr && (
            <div className="mt-3 p-4 bg-pink-50/50 rounded-2xl border border-pink-100 flex flex-col items-center justify-center animate-in fade-in">
              <img
                src={qrCodeUrl}
                alt="Birthday card QR code"
                className="w-40 h-40 rounded-xl shadow-xs border border-pink-200 bg-white p-2"
                referrerPolicy="no-referrer"
              />
              <p className="text-[11px] text-slate-500 mt-2 text-center max-w-xs">
                Scan with any smartphone camera to open the personalized 3D greeting!
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-fun font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
