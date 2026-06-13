import type { CustomTourMutation } from "@/types/order";
import type { RegisterOptions } from "react-hook-form";

export const countryCodeRule = {
  required: 'Выберите направление'
} satisfies RegisterOptions<CustomTourMutation, 'countryCode'>

export const startDateRule = {
  required: 'Выберите дату начала'
} satisfies RegisterOptions<CustomTourMutation, 'startDate'>

export const endDateRule = {
  required: 'Выберите дату конца'
} satisfies RegisterOptions<CustomTourMutation, 'endDate'>