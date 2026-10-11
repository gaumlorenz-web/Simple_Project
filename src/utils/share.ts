import { GreetingData, TemplateId, CakeFlavor, InstrumentType, BalloonTheme } from '../types';

export function encodeGreetingToUrl(data: GreetingData): string {
  try {
    const payload = JSON.stringify({
      r: data.recipientName,
      s: data.senderName,
      a: data.age || '',
      m: data.message,
      t: data.templateId,
      c: data.cakeFlavor,
      k: data.candlesCount,
      i: data.soundInstrument,
      b: data.balloonTheme
    });

    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(payload))));
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('card', encoded);
    return url.toString();
  } catch {
    return window.location.href;
  }
}

export function decodeGreetingFromUrl(): Partial<GreetingData> | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const cardParam = params.get('card');
    if (!cardParam) return null;

    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(cardParam))));
    const parsed = JSON.parse(jsonStr);

    return {
      recipientName: parsed.r || 'Birthday Star',
      senderName: parsed.s || 'Someone who loves you',
      age: parsed.a || '',
      message: parsed.m || '',
      templateId: (parsed.t as TemplateId) || 'pastel_pink',
      cakeFlavor: (parsed.c as CakeFlavor) || 'strawberry',
      candlesCount: typeof parsed.k === 'number' ? parsed.k : 3,
      soundInstrument: (parsed.i as InstrumentType) || 'musicbox',
      balloonTheme: (parsed.b as BalloonTheme) || 'pastel_mix'
    };
  } catch (err) {
    console.error('Failed to parse card from URL:', err);
    return null;
  }
}

export function generateSocialShareLinks(greetingUrl: string, recipientName: string) {
  const shareText = `🎂 Happy 20th Birthday Ivy! Renz made a special 3D birthday cake greeting card for you with lively music, floating balloons, and a heartfelt letter! Check it out:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(greetingUrl);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(`🎂 A Birthday Surprise for ${recipientName || 'You'}!`)}&body=${encodedText}%0A%0A${encodedUrl}`
  };
}
