import React, { useState } from 'react';
import { Note } from '../types';
import { X, Lock, ShieldCheck, Copy, Check } from 'lucide-react';

interface CipherInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

export const CipherInspectorModal: React.FC<CipherInspectorModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !note) return null;

  let parsedPayload: any = null;
  try {
    parsedPayload = JSON.parse(note.encryptedPayload);
  } catch {
    parsedPayload = { raw: note.encryptedPayload };
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(note.encryptedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#FAF7F0] dark:bg-[#1E1B18] border border-[#DDD3C0] dark:border-[#38322A] rounded-lg max-w-xl w-full shadow-2xl overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8DEC8] dark:border-[#302922] bg-[#F4EDE0] dark:bg-[#221F1B]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#5B8246]" />
            <h3 className="font-serif-paper text-base font-bold text-[#2B2621] dark:text-[#EAE4D8]">
              Zero-Knowledge Ciphertext Inspector
            </h3>
          </div>
          <button onClick={onClose} className="text-[#8E7E6E] hover:text-[#2B2621]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs font-mono-paper">
          <div className="p-3 rounded bg-[#EBF0E6] dark:bg-[#1E261C] border border-[#C8D5BE] dark:border-[#2C382A] text-[#3D4C2F] dark:text-[#A8C498] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-sans leading-relaxed text-[11px]">
              This is the exact cryptographic payload stored on Google Cloud Firestore. Your title, body, checklist, and attached photos are sealed client-side using <strong>AES-GCM 256</strong> before transmission. Neither Firebase nor server operators can read your plaintext.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[#7E7365] dark:text-[#9F9485]">
              <span>Cryptographic Envelope (Base64 Encoded):</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[#8E4A35] dark:text-[#D97E59] hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Ciphertext'}</span>
              </button>
            </div>

            <div className="p-3 rounded bg-[#2B2621] text-[#A6E22E] dark:bg-[#12100E] max-h-56 overflow-y-auto break-all text-[11px] leading-relaxed border border-[#403931]">
              <pre className="whitespace-pre-wrap">{JSON.stringify(parsedPayload, null, 2)}</pre>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#7E7365] dark:text-[#9F9485] pt-1">
            <div className="p-2 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A]">
              <span className="font-bold block text-[#2B2621] dark:text-[#EAE4D8]">Algorithm:</span>
              <span>AES-GCM 256 bits</span>
            </div>
            <div className="p-2 rounded bg-[#FCFAF6] dark:bg-[#25211D] border border-[#DDD3C0] dark:border-[#38322A]">
              <span className="font-bold block text-[#2B2621] dark:text-[#EAE4D8]">Key Derivation:</span>
              <span>PBKDF2 (100,000 iter, SHA-256)</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E8DEC8] dark:border-[#302922]">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs rounded-md bg-[#8E4A35] text-[#FAF7F0] font-serif-paper font-semibold cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
