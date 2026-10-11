import React from 'react';
import { 
  GreetingData, 
  TemplateId, 
  CakeFlavor, 
  BalloonTheme, 
  InstrumentType, 
  TEMPLATES 
} from '../types';
import { 
  Palette, 
  Sparkles, 
  Heart, 
  Cake, 
  Music, 
  Smile, 
  RefreshCw, 
  Check, 
  Flame 
} from 'lucide-react';

interface GreetingEditorProps {
  data: GreetingData;
  onChange: (newData: GreetingData) => void;
  onPreview: () => void;
  onShare: () => void;
}

const WISH_INSPIRATIONS = [
  {
    category: "Heartfelt & Sweet 💖",
    text: "Wishing you a birthday sprinkled with joy, wrapped in hugs, and filled with sweetest memories! May your year ahead be as radiant and lovely as you are."
  },
  {
    category: "Fun & Playful 🎉",
    text: "Another year older, wiser, and even more fabulous! Eat all the cake, dance like nobody's watching, and make this year your most unforgettable chapter yet!"
  },
  {
    category: "Best Friend Forever 👯",
    text: "Happy Birthday to my favorite human! Thank you for all the endless laughs, late-night chats, and unforgettable moments. Here's to making 100 more this year!"
  },
  {
    category: "Short & Cheerful 🌟",
    text: "Wishing you the happiest of birthdays, filled with lots of love, laughter, sunshine, and delicious cake!"
  },
  {
    category: "Inspirational & Radiant ✨",
    text: "May this new chapter bring you peace in your heart, courage for your dreams, and all the quiet wonders you deserve. Happy Birthday!"
  }
];

export const GreetingEditor: React.FC<GreetingEditorProps> = ({
  data,
  onChange,
  onPreview,
  onShare
}) => {
  const updateField = <K extends keyof GreetingData>(key: K, value: GreetingData[K]) => {
    onChange({
      ...data,
      [key]: value
    });
  };

  const handleRandomWish = () => {
    const random = WISH_INSPIRATIONS[Math.floor(Math.random() * WISH_INSPIRATIONS.length)];
    updateField('message', random.text);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-pink-200/90 shadow-xl shadow-pink-100/50 space-y-6">
      {/* Editor Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-pink-100">
        <div>
          <h2 className="font-fun font-bold text-xl sm:text-2xl text-pink-600 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Customize Greeting Card
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize the recipient, message, cake flavors, and animated effects.
          </p>
        </div>
      </div>

      {/* Recipient & Sender Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Birthday Person Name *
          </label>
          <input
            type="text"
            value={data.recipientName}
            onChange={(e) => updateField('recipientName', e.target.value)}
            placeholder="e.g. Mia, Alexander, Bestie"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-pink-50/50 border border-pink-200 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-hidden transition-all font-medium text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Age / Milestone (Optional)
          </label>
          <input
            type="text"
            value={data.age || ''}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder="e.g. 21, Sweet 16, 30"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-pink-50/50 border border-pink-200 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-hidden transition-all font-medium text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            From / Sender Name
          </label>
          <input
            type="text"
            value={data.senderName}
            onChange={(e) => updateField('senderName', e.target.value)}
            placeholder="e.g. Sarah & Oliver, With Love"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-pink-50/50 border border-pink-200 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-hidden transition-all font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Template Theme Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-pink-500" />
          Choose Greeting Theme & Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(Object.keys(TEMPLATES) as TemplateId[]).map((tmplKey) => {
            const tmpl = TEMPLATES[tmplKey];
            const isSelected = data.templateId === tmplKey;
            return (
              <button
                key={tmplKey}
                type="button"
                onClick={() => {
                  updateField('templateId', tmplKey);
                  if (!data.message || data.message === TEMPLATES[data.templateId].sampleMessage) {
                    updateField('message', tmpl.sampleMessage);
                  }
                }}
                className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50/90 shadow-md ring-2 ring-pink-300'
                    : 'border-slate-200 hover:border-pink-300 bg-white hover:bg-pink-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{tmpl.sparkleEmoji}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="font-fun font-bold text-xs text-slate-800 truncate">
                  {tmpl.name}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {tmpl.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Birthday Message Box */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Personal Birthday Message
          </label>
          <button
            type="button"
            onClick={handleRandomWish}
            className="text-[11px] font-fun text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Wish Inspiration
          </button>
        </div>
        <textarea
          rows={3}
          value={data.message}
          onChange={(e) => updateField('message', e.target.value)}
          placeholder="Write your heartfelt or humorous birthday wishes here..."
          className="w-full px-3.5 py-2.5 rounded-2xl text-sm bg-pink-50/40 border border-pink-200 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-hidden transition-all text-slate-800 resize-none leading-relaxed"
        />

        {/* Quick Inspiration Pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {WISH_INSPIRATIONS.slice(0, 4).map((insp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => updateField('message', insp.text)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-pink-100/70 hover:bg-pink-200/80 text-pink-800 font-medium transition-colors cursor-pointer"
            >
              {insp.category}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Cake & Balloon Customization */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-pink-100">
        {/* Cake Flavor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Cake className="w-3.5 h-3.5 text-pink-500" />
            Cake Flavor & Look
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'strawberry', label: 'Strawberry 🍓' },
                { id: 'confetti', label: 'Confetti 🧁' },
                { id: 'matcha', label: 'Matcha Mint 🍵' },
                { id: 'chocolate', label: 'Choco Berry 🍫' }
              ] as { id: CakeFlavor; label: string }[]
            ).map((flv) => (
              <button
                key={flv.id}
                type="button"
                onClick={() => updateField('cakeFlavor', flv.id)}
                className={`px-2 py-1.5 rounded-xl text-xs font-fun transition-all cursor-pointer text-left truncate ${
                  data.cakeFlavor === flv.id
                    ? 'bg-pink-500 text-white font-semibold shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-slate-700'
                }`}
              >
                {flv.label}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Candles */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Candles on Cake
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateField('candlesCount', num)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-fun transition-all cursor-pointer text-center font-bold ${
                  data.candlesCount === num
                    ? 'bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-200'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Interactive: Click or blow to extinguish!
          </p>
        </div>

        {/* Balloon Theme */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-pink-500" />
            Balloon Palette
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'pastel_mix', label: 'Pastel Dream 🎈' },
                { id: 'pink_blush', label: 'Rose Blush 💖' },
                { id: 'rainbow', label: 'Carnival Pop 🌈' },
                { id: 'golden_party', label: 'Gold Sparkle ✨' }
              ] as { id: BalloonTheme; label: string }[]
            ).map((bal) => (
              <button
                key={bal.id}
                type="button"
                onClick={() => updateField('balloonTheme', bal.id)}
                className={`px-2 py-1.5 rounded-xl text-xs font-fun transition-all cursor-pointer text-left truncate ${
                  data.balloonTheme === bal.id
                    ? 'bg-pink-500 text-white font-semibold shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-slate-700'
                }`}
              >
                {bal.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          onClick={onPreview}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-sm font-fun font-semibold bg-white hover:bg-pink-50 text-pink-600 border border-pink-200 shadow-xs transition-all cursor-pointer text-center"
        >
          View Card Preview
        </button>

        <button
          type="button"
          onClick={onShare}
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-sm font-fun font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Save & Share Card 💌</span>
        </button>
      </div>
    </div>
  );
};
