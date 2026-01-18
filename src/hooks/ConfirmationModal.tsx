import { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ isOpen, message, onConfirm, onCancel }: ConfirmationModalProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Defer setting state to avoid synchronous update within effect
      // This ensures it runs after the render, preventing cascading renders
      setTimeout(() => setDontAskAgain(false), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-xl font-black text-white uppercase italic mb-4 tracking-wider">
            Confirm Action
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="dont-ask-again"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer"
            />
            <label htmlFor="dont-ask-again" className="text-xs text-gray-400 select-none cursor-pointer">
              Don't ask again
            </label>
          </div>
        </div>
        <div className="bg-black/40 p-4 flex justify-end gap-3 border-t border-gray-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-gray-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(dontAskAgain)}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}