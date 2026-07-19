import type {AxiosError} from 'axios';


export type GlobalError =
    | { error: string }
    | {
    error: string;
    details: Record<string, { message: string }>;
};

export type BlobError = AxiosError<Blob>;