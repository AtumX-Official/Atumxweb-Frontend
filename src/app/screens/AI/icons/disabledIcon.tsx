/** Class switched off — circle with a red cross, the counterpart of EnabledIcon's green tick. */
export default function DisabledIcon(){
    return (
        <svg width="21" height="22" viewBox="0 0 32 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="13.5" cy="13.5" r="12" stroke="currentColor" strokeWidth="3" />
            <path d="M8.5 8.5L18.5 18.5M18.5 8.5L8.5 18.5" stroke="#FF4945" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
