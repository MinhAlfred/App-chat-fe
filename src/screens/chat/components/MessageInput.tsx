import { FormEvent } from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';

type Props = {
    value: string;
    onChange: (v: string) => void;
    onSubmit: (e: FormEvent) => void;
    disabled: boolean;
    isSending: boolean;
    errorMessage: string;
};

export default function MessageInput({ value, onChange, onSubmit, disabled, isSending, errorMessage }: Props) {
    return (
        <footer className="p-6 bg-white border-t border-slate-100">
            {errorMessage && <p className="text-sm text-red-500 mb-2">{errorMessage}</p>}
            <form
                className="flex items-center gap-4 bg-slate-100/80 p-2 pl-4 rounded-[2rem] focus-within:bg-slate-100 transition-colors"
                onSubmit={onSubmit}
            >
                <button
                    className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Attach file"
                    type="button"
                >
                    <Paperclip className="h-5 w-5" />
                </button>
                <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-slate-400 outline-none"
                    placeholder="Type a message..."
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || isSending}
                />
                <button
                    className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
                    title="Emoji"
                    type="button"
                >
                    <Smile className="h-5 w-5" />
                </button>
                <button
                    className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-60"
                    title="Send message"
                    type="submit"
                    disabled={disabled || !value.trim() || isSending}
                >
                    <Send className="h-4 w-4 ml-1" />
                </button>
            </form>
        </footer>
    );
}
