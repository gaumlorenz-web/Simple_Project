export type TemplateId = 
  | 'pastel_pink'
  | 'carnival_confetti'
  | 'sweet_bakery'
  | 'golden_sparkle'
  | 'retro_bubblegum';

export type CakeFlavor = 
  | 'strawberry'
  | 'confetti'
  | 'matcha'
  | 'chocolate'
  | 'blueberry';

export type InstrumentType = 'musicbox' | 'chimes' | 'marimba';

export type BalloonTheme = 'pastel_mix' | 'pink_blush' | 'rainbow' | 'golden_party';

export interface GreetingData {
  recipientName: string;
  senderName: string;
  age?: string;
  message: string;
  templateId: TemplateId;
  cakeFlavor: CakeFlavor;
  candlesCount: number;
  soundInstrument: InstrumentType;
  balloonTheme: BalloonTheme;
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  bgGradient: string;
  cardBg: string;
  accentColor: string;
  borderStyle: string;
  fontBadge: string;
  sparkleEmoji: string;
  sampleMessage: string;
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  pastel_pink: {
    id: 'pastel_pink',
    name: 'Cotton Candy Dreams',
    description: 'Whimsical baby pinks, lilac glow, and floating pastel clouds',
    bgGradient: 'from-pink-100 via-rose-50 to-purple-100',
    cardBg: 'bg-white/85 backdrop-blur-md',
    accentColor: '#ec4899',
    borderStyle: 'border-pink-200/80 shadow-pink-200/50',
    fontBadge: 'font-fun text-pink-600',
    sparkleEmoji: '💖',
    sampleMessage: "Wishing you a birthday sprinkled with joy, wrapped in hugs, and filled with sweetest memories! May your year ahead be as radiant and lovely as you are."
  },
  carnival_confetti: {
    id: 'carnival_confetti',
    name: 'Carnival Confetti Splash',
    description: 'High-energy festive pastel streamers, balloon bursts, and party vibes',
    bgGradient: 'from-amber-50 via-pink-100 to-teal-50',
    cardBg: 'bg-white/90 backdrop-blur-md',
    accentColor: '#f43f5e',
    borderStyle: 'border-rose-300 shadow-rose-200/60',
    fontBadge: 'font-fun text-rose-600',
    sparkleEmoji: '🎉',
    sampleMessage: "Pop the confetti, crank the tunes, and eat all the cake! Here's to an incredible milestone and another year of nonstop laughter and adventures!"
  },
  sweet_bakery: {
    id: 'sweet_bakery',
    name: 'Sweet Strawberry Patisserie',
    description: 'Fresh berries, whipped vanilla frosting, and warm sweet cozy wishes',
    bgGradient: 'from-red-50 via-pink-50 to-orange-50',
    cardBg: 'bg-white/90 backdrop-blur-md',
    accentColor: '#fb7185',
    borderStyle: 'border-rose-200 shadow-orange-100/60',
    fontBadge: 'font-fun text-rose-500',
    sparkleEmoji: '🍰',
    sampleMessage: "Wishing you the sweetest birthday filled with extra frosting, unlimited dessert, and all the happiest moments life has to bake!"
  },
  golden_sparkle: {
    id: 'golden_sparkle',
    name: 'Rose Gold & Champagne',
    description: 'Chic blush elegance, gentle shimmer, and sophisticated celebration',
    bgGradient: 'from-stone-50 via-pink-50 to-amber-50',
    cardBg: 'bg-white/90 backdrop-blur-md',
    accentColor: '#d97706',
    borderStyle: 'border-amber-200 shadow-amber-100/50',
    fontBadge: 'font-serif text-amber-700',
    sparkleEmoji: '✨',
    sampleMessage: "Cheers to you on your special day! May this year bring you brilliant breakthroughs, effortless happiness, and endless reasons to celebrate."
  },
  retro_bubblegum: {
    id: 'retro_bubblegum',
    name: 'Retro Y2K Bubblegum Pop',
    description: 'Nostalgic 90s vibes, bright bubblegum pink, star stickers & sunny cheer',
    bgGradient: 'from-fuchsia-100 via-pink-100 to-yellow-100',
    cardBg: 'bg-white/90 backdrop-blur-md',
    accentColor: '#d946ef',
    borderStyle: 'border-fuchsia-300 shadow-fuchsia-200/60',
    fontBadge: 'font-fun text-fuchsia-600',
    sparkleEmoji: '⭐',
    sampleMessage: "You make the world 1000% more fun! Happy Birthday to the coolest person on the planet. Keep shining bright!"
  }
};
