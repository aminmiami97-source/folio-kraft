import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  X, 
  Feather, 
  Sparkles, 
  Check, 
  Compass, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: Partial<UserProfile>) => void;
  initialName?: string;
}

const CHARACTER_PERSONAS = [
  {
    title: 'The Deep Thinker',
    desc: 'Contemplates concepts in quiet solitude, valuing stillness and deep focus.',
    icon: '☕',
  },
  {
    title: 'The Chronicler / Writer',
    desc: 'Drafts stories, essays, and unedited morning thoughts onto ruled pages.',
    icon: '🖋️',
  },
  {
    title: 'The Architect / Planner',
    desc: 'Organizes projects into structured boards, task lists, and categorized folders.',
    icon: '📐',
  },
  {
    title: 'The Visual Dreamer',
    desc: 'Collects pictures, moodboards, and spontaneous aesthetic snapshots.',
    icon: '🎨',
  },
  {
    title: 'The Privacy Purist',
    desc: 'Demands absolute zero-knowledge encryption and cryptographic autonomy.',
    icon: '🔒',
  },
];

const REFERRAL_SOURCES = [
  { id: 'youtube', label: 'YouTube', icon: '📺' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'twitter', label: 'Twitter (X)', icon: '🐦' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'other', label: 'Somewhere else', icon: '🌐' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialName = '',
}) => {
  const [name, setName] = useState(initialName);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [customExplanation, setCustomExplanation] = useState('');
  const [referralSource, setReferralSource] = useState<string>('');
  const [otherReferralText, setOtherReferralText] = useState('');

  if (!isOpen) return null;

  const handleSkip = () => {
    onSaveProfile({
      name: name.trim() || undefined,
      hasCompletedOnboarding: true,
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalExplanation = [
      selectedPersona ? `[${selectedPersona}]` : '',
      customExplanation.trim(),
    ]
      .filter(Boolean)
      .join(' - ');

    const finalReferral = referralSource === 'other' && otherReferralText.trim()
      ? `Other: ${otherReferralText.trim()}`
      : referralSource;

    onSaveProfile({
      name: name.trim() || undefined,
      characterExplanation: finalExplanation || undefined,
      referralSource: finalReferral || undefined,
      hasCompletedOnboarding: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F0] dark:bg-[#1C1916] border border-[#DDD0BC] dark:border-[#383129] rounded-lg w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Paper Top Header */}
        <div className="relative px-6 py-4 border-b border-[#E8DEC8] dark:border-[#2F2923] bg-[#F4EDE0] dark:bg-[#201C18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#8E4A35] text-white flex items-center justify-center shadow-xs">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif-paper text-lg font-bold text-[#2B2621] dark:text-[#EAE4D8]">
                  Welcome to Folio Kraft
                </h2>
                <p className="text-[11px] text-[#7E7365] dark:text-[#9F9485] font-mono-paper">
                  Desk Registration & Creative Persona
                </p>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs text-[#7E7365] hover:text-[#2B2621] dark:hover:text-[#FAF7F0] font-serif-paper px-2 py-1 rounded hover:bg-black/5 cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Paper Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <div className="p-3 rounded bg-[#F2EAE0] dark:bg-[#231F1B] border border-[#DDD0BC] dark:border-[#383129] text-[#6B5F50] dark:text-[#C5BCAD] font-serif-paper leading-relaxed text-xs">
            Every field here is <strong>completely optional</strong>. It helps customize your stationery experience and lets us know how you found us. You can skip anytime.
          </div>

          {/* 1. Name (Optional) */}
          <div className="space-y-1.5">
            <label className="block font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8]">
              1. What is your name or pen name? <span className="font-normal text-xs text-[#8E7E6E]">(Optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Elena, Julian, or leave blank to stay anonymous"
              className="w-full px-3.5 py-2 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] font-serif-paper text-sm focus:outline-none focus:ring-1 focus:ring-[#8E4A35]"
            />
          </div>

          {/* 2. Character Explanation (Optional) */}
          <div className="space-y-2.5">
            <label className="block font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8]">
              2. What best explains your character? <span className="font-normal text-xs text-[#8E7E6E]">(Optional)</span>
            </label>
            <p className="text-[11px] text-[#7E7365] dark:text-[#9F9485] font-serif-paper">
              Pick a creative persona that resonates, or write your own character explanation below:
            </p>

            {/* Persona Preset Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {CHARACTER_PERSONAS.map(p => {
                const isSelected = selectedPersona === p.title;
                return (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => setSelectedPersona(isSelected ? '' : p.title)}
                    className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EADECE] dark:bg-[#2F2923] border-[#8E4A35] text-[#2B2621] dark:text-[#FAF7F0] shadow-xs'
                        : 'bg-[#FCFAF6] dark:bg-[#221F1B] border-[#DDD3C0] dark:border-[#38322A] text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#F4ECE0]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-serif-paper font-bold text-xs text-[#2B2621] dark:text-[#EAE4D8]">
                      <span>{p.icon}</span>
                      <span>{p.title}</span>
                    </div>
                    <div className="text-[10px] text-[#7E7365] dark:text-[#9F9485] mt-0.5 line-clamp-2">
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Explanation Input */}
            <textarea
              rows={2}
              value={customExplanation}
              onChange={e => setCustomExplanation(e.target.value)}
              placeholder="Or explain in your own words what drives your mind, your work habits, or what you plan to write..."
              className="w-full px-3 py-2 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] font-serif-paper text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#8E4A35]"
            />
          </div>

          {/* 3. Where did you hear from us? (Optional) */}
          <div className="space-y-2">
            <label className="block font-serif-paper font-bold text-sm text-[#2B2621] dark:text-[#EAE4D8]">
              3. Where did you hear from us? <span className="font-normal text-xs text-[#8E7E6E]">(Optional)</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {REFERRAL_SOURCES.map(source => {
                const isSelected = referralSource === source.id;
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => setReferralSource(isSelected ? '' : source.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-serif-paper font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#8E4A35] text-white border-[#8E4A35]'
                        : 'bg-[#FCFAF6] dark:bg-[#25211D] border-[#DDD3C0] dark:border-[#38322A] text-[#5C5346] dark:text-[#C5BCAD] hover:bg-[#F2ECE0]'
                    }`}
                  >
                    <span>{source.icon}</span>
                    <span>{source.label}</span>
                  </button>
                );
              })}
            </div>

            {referralSource === 'other' && (
              <input
                type="text"
                value={otherReferralText}
                onChange={e => setOtherReferralText(e.target.value)}
                placeholder="Where did you hear about us? (e.g. Reddit, Friend, Newsletter...)"
                className="w-full px-3 py-1.5 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A] text-[#2B2621] dark:text-[#EAE4D8] text-xs focus:ring-1 focus:ring-[#8E4A35]"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E8DEC8] dark:border-[#2F2923] flex items-center justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 text-xs font-serif-paper text-[#7E7365] dark:text-[#9F9485] hover:text-[#2B2621] dark:hover:text-[#FAF7F0] cursor-pointer"
            >
              Skip for Now
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-md font-serif-paper font-bold text-xs bg-[#8E4A35] hover:bg-[#7D3F2D] text-white shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <span>Enter My Paper Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
