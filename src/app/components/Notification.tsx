import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export function Notification({ type, message, onClose }: { type: 'success' | 'error' | 'info', message: string, onClose: () => void }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  return (
    <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-right-5 duration-300">
      <div className={`${styles[type]} border shadow-xl rounded-2xl px-4 py-3 min-w-[320px] flex items-center gap-3 backdrop-blur-md`}>
        {icons[type]}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
          <X size={16} className="opacity-50" />
        </button>
      </div>
    </div>
  );
}