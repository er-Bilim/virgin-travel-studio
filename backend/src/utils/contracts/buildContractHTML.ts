import type {ContractData} from '@/types/contracts.types.js';

const formatDate = (date?: string | Date) => {
    if (!date) return '________________';

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
};

const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '________________';

    return new Intl.NumberFormat('ru-RU').format(price);
};

const valueOrLine = (value?: string | number | null) => {
    return value ? String(value) : '________________';
};

export const buildContractHTML = (data: ContractData) => {
    const currentDate = formatDate(new Date());
    const startDate = formatDate(data.tour.startDate);
    const endDate = formatDate(data.tour.endDate);
    const price = formatPrice(data.tour.price);

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: A4;
      margin: 16mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.45;
      color: #111827;
      background: #ffffff;
    }

    .document {
      width: 100%;
      max-width: 180mm;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 12px;
      text-align: center;
      font-size: 16px;
      text-transform: uppercase;
    }

    h2 {
      margin: 18px 0 8px;
      font-size: 13px;
      text-transform: uppercase;
    }

    p {
      margin: 0 0 7px;
      text-align: justify;
    }

    .top-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      font-weight: bold;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
    }

    td {
      vertical-align: top;
      padding: 8px;
      border: 1px solid #111827;
      width: 50%;
    }

    .sign-line {
      margin-top: 28px;
      border-top: 1px solid #111827;
      padding-top: 4px;
    }

    .appendix {
      margin-top: 22px;
      page-break-before: always;
    }
    
    .appendix-signatures {
        margin-top: 36px;
    }
  </style>
</head>

<body>
  <main class="document">
    <h1>Договор на оказание туристических услуг № ______</h1>

    <div class="top-line">
      <span>г. Бишкек</span>
      <span>${currentDate}</span>
    </div>

    <p>
      ОсОО «________________________» (торговая марка <strong>Virgin Travel Studio</strong>),
      в лице Директора _______________________________________, действующего на основании Устава,
      именуемое в дальнейшем <strong>«Исполнитель»</strong>, с одной стороны, и гражданин(ка)
      <strong>${valueOrLine(data.client.name)}</strong>, паспорт №
      <strong>${valueOrLine(data.client.passportNumber)}</strong>, выдан
      <strong>${valueOrLine(data.client.passportIssuedBy)}</strong> от
      <strong>${formatDate(data.client.passportIssueDate)}</strong>, именуемый(ая) в дальнейшем
      <strong>«Заказчик»</strong>, с другой стороны, совместно именуемые «Стороны»,
      заключили настоящий Договор о нижеследующем:
    </p>

    <h2>1. Предмет договора</h2>
    <p>1.1. Исполнитель обязуется по заданию Заказчика обеспечить оказание комплекса туристических услуг, а Заказчик обязуется оплатить эти услуги в полном объеме и в установленные сроки.</p>
    <p>1.2. Перечень, потребительские свойства и характеристики тура фиксируются в Приложении №1, которое является неотъемлемой частью настоящего Договора.</p>

    <h2>2. Стоимость услуг и порядок расчетов</h2>
    <p>2.1. Полная стоимость Турпродукта составляет <strong>${price} сомов</strong>.</p>
    <p>2.2. Заказчик обязуется внести предоплату в размере не менее ____% от стоимости тура. Полная оплата должна быть произведена не позднее чем за ______ дней до даты начала путешествия.</p>
    <p>2.3. В случае несвоевременной оплаты Исполнитель вправе аннулировать бронирование с удержанием фактически понесенных расходов.</p>

    <h2>3. Права и обязанности сторон</h2>
    <p>3.1. Исполнитель обязан предоставить Заказчику достоверную информацию о туре, сроках, условиях проживания, перелете и иных существенных условиях поездки.</p>
    <p>3.2. Заказчик обязан предоставить достоверные персональные данные, действительные документы и своевременно оплатить Турпродукт.</p>

    <h2>4. Изменение и расторжение договора</h2>
    <p>4.1. Заказчик вправе отказаться от исполнения Договора в письменной форме.</p>
    <p>4.2. При отказе от тура Заказчик возмещает Исполнителю фактически понесенные расходы, включая штрафы отелей, авиакомпаний и иных партнеров.</p>

    <h2>5. Ограничение ответственности Исполнителя</h2>
    <p>5.1. Исполнитель не несет ответственности за действия третьих лиц: авиакомпаний, отелей, трансферных компаний, гидов и страховых организаций.</p>
    <p>5.2. Исполнитель не несет ответственности за отказ во въезде, отказ в визе, задержку рейсов, утерю багажа и иные обстоятельства, не зависящие от Исполнителя.</p>

    <h2>6. Форс-мажор</h2>
    <p>6.1. Стороны освобождаются от ответственности за неисполнение обязательств при наступлении обстоятельств непреодолимой силы.</p>
    <p>6.2. При наступлении форс-мажора Исполнитель производит возврат средств за вычетом фактически понесенных расходов либо предлагает перенос дат путешествия.</p>

    <h2>7. Порядок разрешения споров</h2>
    <p>7.1. Все споры решаются путем переговоров с соблюдением обязательного досудебного порядка.</p>
    <p>7.2. При невозможности достижения согласия спор передается в суд по месту нахождения Исполнителя.</p>

    <h2>8. Прочие условия и персональные данные</h2>
    <p>8.1. Заказчик дает согласие на обработку персональных данных в целях исполнения настоящего Договора.</p>
    <p>8.2. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу.</p>

    <h2>9. Адреса, реквизиты и подписи сторон</h2>
    <table>
      <tr>
        <td>
          <strong>ИСПОЛНИТЕЛЬ:</strong><br />
          ОсОО «________________________»<br />
          ТМ Virgin Travel Studio<br />
          Юр. адрес: г. Бишкек, ул. _______________, д. ___<br />
          ИНН: _________________________________<br />
          Р/с: __________________________________<br />
          Банк: _________________________________<br />
          БИК: _________________________________<br />
          Тел: +996 (***) ***-***-***<br />
          E-mail: _______________________________<br />
          Менеджер: ${valueOrLine(data.manager.name)}<br />
          Тел. менеджера: ${valueOrLine(data.manager.phone)}
          <div class="sign-line">Подпись: _______________________</div>
          М.П.
        </td>

        <td>
          <strong>ЗАКАЗЧИК:</strong><br />
          ФИО: ${valueOrLine(data.client.name)}<br />
          Дата рождения: ${formatDate(data.client.birthDate)}<br />
          Паспорт: ${valueOrLine(data.client.passportNumber)}<br />
          Выдан: ${valueOrLine(data.client.passportIssuedBy)}<br />
          Дата выдачи: ${formatDate(data.client.passportIssueDate)}<br />
          Тел: ${valueOrLine(data.client.phone)}<br />
          E-mail: _______________________________
          <div class="sign-line">Подпись: _______________________</div>
        </td>
      </tr>
    </table>

    <section class="appendix">
      <h1>Приложение №1 к Договору № ______</h1>
      <h2>Лист бронирования</h2>

      <p><strong>1. Данные туриста:</strong> ${valueOrLine(data.client.name)}, дата рождения: ${formatDate(data.client.birthDate)}, паспорт: ${valueOrLine(data.client.passportNumber)}.</p>
      <p><strong>2. Маршрут и сроки:</strong> ${valueOrLine(data.tour.title)}. Период с ${startDate} по ${endDate}.</p>
      <p><strong>3. Размещение:</strong> ${valueOrLine(data.tour.hotel)}.</p>
      <p><strong>4. Стоимость тура:</strong> ${price} сомов.</p>
      <p><strong>5. Менеджер:</strong> ${valueOrLine(data.manager.name)}, тел: ${valueOrLine(data.manager.phone)}.</p>

      <div class="top-line appendix-signatures">
        <span>Исполнитель: __________________</span>
        <span>Заказчик: __________________</span>
      </div>
    </section>
  </main>
</body>
</html>
  `;
};