export default function Logo() {
    return (
        <svg
            width="260"
            height="60"
            viewBox="0 0 320 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Логотип Virgin Travel Studio"
        >
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                        dx="0"
                        dy="1"
                        stdDeviation="1"
                        floodColor="#000"
                        floodOpacity="0.4"
                    />
                </filter>
            </defs>

            <text
                x="0"
                y="28"
                fontSize="22"
                fontWeight="800"
                letterSpacing="2"
                fill="#FFFFFF"
                filter="url(#shadow)"
            >
                VIRGIN TRAVEL STUDIO
            </text>

            <text
                x="2"
                y="50"
                fontSize="12"
                fontWeight="500"
                letterSpacing="0.5"
                fill="#D1D5DB"
            >
                Designing your finest memories
            </text>
        </svg>
    );
}