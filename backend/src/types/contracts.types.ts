export type ContractData = {
    client: {
        name: string;
        phone: string;
        passportNumber: string;
        passportIssuedBy: string;
        passportIssueDate: string;
        birthDate: string;
    };
    tour: {
        title?: string;
        startDate?: Date;
        endDate?: Date;
        price?: number;
        hotel?: string;
    };
    manager: {
        name?: string;
        phone?: string;
    };
};