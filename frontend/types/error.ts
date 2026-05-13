

export type GlobalError =
    | { error: string }
    | {
    error: string;
    details: Record<string, { message: string }>;
};