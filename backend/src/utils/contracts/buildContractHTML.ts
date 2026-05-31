import type {ContractData} from "@/types/contracts.types.js";


export const buildContractHTML = (data: ContractData) => {
    return `
    <html lang="ru">
      <head>
        <style>
          body { font-family: Arial,sans-serif; font-size: 12px; }
          h1 { text-align: center; }
        </style>
      </head>
      <body>
        <h1>Договор туристических услуг</h1>

        <p><b>Клиент:</b> ${data.client.name}</p>
        <p><b>Паспорт:</b> ${data.client.passportNumber}</p>

        <h3>Тур</h3>
        <p>${data.tour.title}</p>
        <p>${data.tour.startDate} - ${data.tour.endDate}</p>
        <p>${data.tour.price}</p>

        <h3>Менеджер</h3>
        <p>${data.manager.name}</p>
      </body>
    </html>
  `;
};