import {useForm} from "react-hook-form";
import type {ContractFormValues} from "@/types/order";
import {createContractOrder} from "@/services/orders";
import {downloadBlobFile, isJsonBlob, parseBlobError} from "@/lib/utils";
import type {BlobError} from "@/types/error";
import {toast} from "sonner";
import {useState} from "react";
import {Download} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {Button} from "@/components/ui/button";
import {inputClass} from "@/lib/constants";
import {Input} from "@/components/ui/input";

interface Props {
    orderId: string;
}

const ContractForm: React.FC<Props> = ({orderId}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContractFormValues>({
        defaultValues: {
            passportIssueDate: '',
            passportIssuedBy: '',
            passportNumber: '',
            birthDate: ''
        },
    });

    const handleSubmitForm = async (data: ContractFormValues) => {
        setLoading(true)
        try {
            const blob = await createContractOrder(orderId, data);

            downloadBlobFile({
                blob,
                defaultName: `contract-${orderId}.pdf`,
            });
            reset();
            toast.success('Контракт успешно сформирован');
        }catch (e: unknown) {
            const err = e as BlobError;

            const data = err.response?.data;

            if (data && isJsonBlob(data)) {
                const parsed = await parseBlobError(data);
                toast.error(parsed.message ?? parsed.error ?? "Ошибка");
                return;
            }

            toast.error("Неизвестная ошибка при генерации PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-3">
                <div className="flex flex-col gap-4">
                    <label htmlFor="passportNumber" className="text-sm font-medium text-gray-700">
                        Серия/Номер паспорта
                    </label>
                    <Input
                        id="passportNumber"
                        {...register('passportNumber', {
                            required: 'Введите номер паспорта',
                            validate: (v) => v.trim() !== '' || 'Поле не должно быть пустым',
                            minLength: {
                                value: 2,
                                message: 'Поле должно содержать не менее 2 символов',
                            },
                        })}
                        className={inputClass}
                        placeholder="Номер паспорта"
                        disabled={loading}
                    />
                    {errors.passportNumber && <p className="text-sm text-red-500">{errors.passportNumber.message}</p>}

                    <label htmlFor="passportIssuedBy" className="text-sm font-medium text-gray-700">
                        Кем выдан
                    </label>
                    <Input
                        id="passportIssuedBy"
                        {...register('passportIssuedBy', {
                            required: 'Введите кем был выдан',
                            validate: (v) => v.trim() !== '' || 'Поле не должно быть пустым',
                            minLength: {
                                value: 2,
                                message: 'Поле должно содержать не менее 2 символов',
                            },
                        })}
                        className={inputClass}
                        placeholder="Кем выдан"
                        disabled={loading}
                    />

                    {errors.passportIssuedBy && (<p className="text-sm text-red-500">{errors.passportIssuedBy.message}</p>)}

                    <label htmlFor="passportIssueDate" className="text-sm font-medium text-gray-700">
                        Дата выдачи
                    </label>
                    <Input
                        id="passportIssueDate"
                        {...register('passportIssueDate', { required: 'Укажите дату выдачи' })}
                        className={inputClass}
                        type="date"
                        disabled={loading}
                    />

                    {errors.passportIssueDate && <p className="text-sm text-red-500">{errors.passportIssueDate.message}</p>}

                    <label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                        Дата рождения
                    </label>
                    <Input
                        id="birthDate"
                        {...register('birthDate', {
                            required: 'Укажите дату рождения',
                        })}
                        type="date"
                        className={inputClass}
                        disabled={loading}
                    />

                    {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}

                    <Button type="submit" disabled={loading} className="bg-[#1E2B6D] hover:bg-[#162356] cursor-pointer">
                        {!loading ? (
                            <>
                                <Download /> Генерировать PDF
                            </>
                        ) : (
                            <Spinner />
                        )}
                    </Button>
                </div>
            </form>
    );
};

export default ContractForm;