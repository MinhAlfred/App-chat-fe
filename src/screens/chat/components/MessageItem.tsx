import { useEffect, useRef, useState } from 'react';
import { Forward, Reply, Smile, FileText, Download } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { MessageResponse, MessageType } from '../../../types/message';
import { reactToMessage, unreactMessage } from '../../../api/chat-api';
import { formatTime } from '../utils';
import Avatar from './Avatar';

type Props = {
    message: MessageResponse;
    isMine: boolean;
    isSenderOnline: boolean;
    onForward: (message: MessageResponse) => void;
    onReply: (message: MessageResponse) => void;
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg|avif)(\?.*)?$/i;

const isImageUrl = (url: string | null | undefined, fileName: string | null | undefined): boolean => {
    if (!url) return false;
    if (IMAGE_EXTENSIONS.test(fileName ?? '')) return true;
    return IMAGE_EXTENSIONS.test(url);
};

export default function MessageItem({ message, isMine, isSenderOnline, onForward, onReply }: Props) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const displayReactions = (message.reactions ?? []).filter((r) => r.count > 0);

    // Close picker on outside click
    useEffect(() => {
        if (!showPicker) return;
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showPicker]);

    const handleEmojiClick = async (data: EmojiClickData) => {
        setShowPicker(false);
        const alreadyReacted = displayReactions.some((r) => r.emoji === data.emoji && r.reactedByMe);
        try {
            if (alreadyReacted) {
                await unreactMessage(message.id);
            } else {
                await reactToMessage(message.id, data.emoji);
            }
        } catch (e) {
            console.error('[Reaction] handleEmojiClick failed:', e);
        }
    };

    const handleReactionClick = async (emoji: string, reactedByMe: boolean) => {
        try {
            if (reactedByMe) {
                await unreactMessage(message.id);
            } else {
                await reactToMessage(message.id, emoji);
            }
        } catch (e) {
            console.error('[Reaction] handleReactionClick failed:', e);
        }
    };

    return (
        <div className={`group flex items-end gap-3 max-w-[85%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
            <Avatar name={message.senderName} src={message.senderAvatar} online={isSenderOnline} size="sm" />

            <div className="relative">
                {!isMine && (
                    <p className="text-xs font-semibold text-slate-500 mb-1 ml-1">{message.senderName}</p>
                )}

                <div
                    className={`relative p-4 rounded-2xl shadow-sm border text-sm leading-relaxed ${
                        isMine
                            ? 'bg-blue-600 text-white rounded-br-none border-blue-600'
                            : 'bg-white text-slate-700 rounded-bl-none border-slate-100'
                    }`}
                >
                    {message.replyTo && (
                        <div className={`mb-2 px-3 py-2 rounded-xl text-xs border-l-2 ${isMine ? 'bg-blue-500/40 border-white/60 text-blue-100' : 'bg-slate-100 border-slate-400 text-slate-500'}`}>
                            <p className="font-semibold mb-0.5">{message.replyTo.senderName}</p>
                            <p className="truncate">{message.replyTo.content}</p>
                        </div>
                    )}
                    {(message.type === MessageType.IMAGE || isImageUrl(message.mediaUrl, message.fileName)) && message.mediaUrl ? (
                        <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={message.mediaUrl}
                                alt={message.fileName || 'image'}
                                className="max-w-[260px] max-h-[260px] rounded-xl object-cover"
                            />
                        </a>
                    ) : message.type === MessageType.FILE && message.mediaUrl ? (
                        <a
                            href={message.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={message.fileName}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl min-w-[180px] transition-colors ${isMine ? 'bg-blue-500/40 hover:bg-blue-500/60' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                            <FileText className="h-8 w-8 flex-shrink-0 opacity-70" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.fileName || 'File'}</p>
                                {message.fileSize ? (
                                    <p className="text-xs opacity-60">{(message.fileSize / 1024).toFixed(1)} KB</p>
                                ) : null}
                            </div>
                            <Download className="h-4 w-4 flex-shrink-0 opacity-60" />
                        </a>
                    ) : (
                        message.content || '[No content]'
                    )}
                    <span
                        className={`pointer-events-none absolute -bottom-6 ${isMine ? 'right-0' : 'left-0'} whitespace-nowrap rounded-lg bg-slate-800/80 px-2 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10`}
                    >
                        {formatTime(message.createdAt)}
                    </span>
                </div>

                {/* Reaction bubbles */}
                {displayReactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        {displayReactions.map((r) => (
                            <button
                                key={r.emoji}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                    r.reactedByMe
                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                                onClick={() => void handleReactionClick(r.emoji, r.reactedByMe)}
                                type="button"
                            >
                                <span>{r.emoji}</span>
                                <span className="font-medium">{r.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? '-left-24' : '-right-24'}`}>
                    <button
                        className="p-1.5 rounded-full bg-white shadow border border-slate-100 text-slate-400 hover:text-yellow-500 transition-colors"
                        title="React"
                        onClick={() => setShowPicker((v) => !v)}
                        type="button"
                    >
                        <Smile className="h-3.5 w-3.5" />
                    </button>
                    <button
                        className="p-1.5 rounded-full bg-white shadow border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Reply"
                        onClick={() => onReply(message)}
                        type="button"
                    >
                        <Reply className="h-3.5 w-3.5" />
                    </button>
                    <button
                        className="p-1.5 rounded-full bg-white shadow border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Forward"
                        onClick={() => onForward(message)}
                        type="button"
                    >
                        <Forward className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Emoji picker */}
                {showPicker && (
                    <div
                        ref={pickerRef}
                        className={`absolute z-50 bottom-full mb-2 ${isMine ? 'right-0' : 'left-0'}`}
                    >
                        <EmojiPicker
                            theme={Theme.LIGHT}
                            onEmojiClick={(data) => void handleEmojiClick(data)}
                            lazyLoadEmojis
                            height={350}
                            width={300}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
