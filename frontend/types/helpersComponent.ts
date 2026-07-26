export type TableAction<T> = {
    id: string;
    label: string | ((row: T) => string);
    onClick: (row: T) => void;
    className?: string;
    hidden?: boolean | ((data: T) => boolean);
};