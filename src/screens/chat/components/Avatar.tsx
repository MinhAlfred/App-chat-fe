import { useState } from 'react';

type Size = 'sm' | 'md' | 'lg';

type Props = {
    name: string;
    src?: string | null;
    online?: boolean;
    size?: Size;
    className?: string;
};

const sizeMap: Record<Size, { container: string; dot: string }> = {
    sm: { container: 'w-8 h-8 text-xs', dot: 'w-2 h-2 bottom-0 right-0' },
    md: { container: 'w-11 h-11 text-sm', dot: 'w-2.5 h-2.5 bottom-0 right-0' },
    lg: { container: 'w-12 h-12 text-base', dot: 'w-3 h-3 bottom-0.5 right-0.5' },
};

export default function Avatar({ name, src, online, size = 'md', className = '' }: Props) {
    const { container, dot } = sizeMap[size];
    const [imgError, setImgError] = useState(false);
    const initial = (name || 'U').slice(0, 1).toUpperCase();

    return (
        <div className={`relative shrink-0 ${className}`}>
            {src && !imgError ? (
                <img
                    src={src}
                    alt={initial}
                    className={`${container} rounded-full object-cover`}
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className={`${container} rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center`}>
                    {initial}
                </div>
            )}
            {online && (
                <span className={`absolute ${dot} bg-green-500 border-2 border-white rounded-full`} />
            )}
        </div>
    );
}
