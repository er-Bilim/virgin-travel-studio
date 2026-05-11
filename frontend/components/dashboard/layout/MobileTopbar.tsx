type Props = {
    onMenuClick: () => void;
};

export function MobileTopbar({ onMenuClick }: Props) {
    return (
        <div className="md:hidden flex items-center justify-between p-4 border-b">
            <div className="font-bold">Virgin Travel</div>

            <button onClick={onMenuClick}>
                ☰
            </button>
        </div>
    );
}