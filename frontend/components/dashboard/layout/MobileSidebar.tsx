type Props = {
    open: boolean;
    onClose: () => void;
};
export function MobileSidebar({ open, onClose }: Props) {
    return (
        <>
            {open && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/40 z-40"
                />
            )}

            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="p-4 font-bold border-b">Menu</div>

                <nav className="p-2 flex flex-col gap-2">
                    {["Dashboard", "Managers", "Tours", "News"].map((item) => (
                        <button
                            key={item}
                            className="p-3 text-left hover:bg-gray-100 rounded"
                            onClick={onClose}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
}