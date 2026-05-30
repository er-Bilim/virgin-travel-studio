import axiosApi from "@/lib/axiosApi";
import type {ReportParams} from "@/types/reports";
import type {AxiosResponse} from "axios";

export const reportsManager = async (params: ReportParams): Promise<AxiosResponse<Blob>> => {
    return await axiosApi.get('/reports/daily-manager', {
        params,
        responseType: "blob",
    });
}

export const reportsTourSet = async (id: string): Promise<AxiosResponse<Blob>> => {
    return await axiosApi.get(`/reports/tour-roster/${id}`, {
        responseType: "blob",
    });
}

