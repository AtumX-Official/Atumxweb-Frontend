interface AddIconProps {
    active?: boolean
}
export default function AddIcon({ active = false }: AddIconProps) {
    const activeColor = 'rgba(54, 211, 255, 1)'
    // Inactive stroke comes from a class (not the attribute) so it can flip to white in dark mode.
    const strokeClass = active ? undefined : 'stroke-black dark:stroke-white'
    return (
        <svg width="140" height="43" viewBox="0 0 187 67" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="184" height="64" rx="8" className={`fill-[#EAEAEA] dark:fill-[#1f1f1f] ${strokeClass ?? ''}`} stroke={active ? activeColor : undefined} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />
            <path d="M76.3379 33.6117H93.6029M93.6029 33.6117H110.868M93.6029 33.6117V50.8767M93.6029 33.6117V16.3467" className={strokeClass} stroke={active ? activeColor : undefined} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
