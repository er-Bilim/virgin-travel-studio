import mongoose from 'mongoose';
import config from './config.js';
import User from './model/user/User.js';
import Category from './model/category/Category.js';
import News from './model/New/News.js';
import Tour from './model/tour/Tour.js';
import TourSet from './model/tourSet/TourSet.js';
import Order from './model/order/Order.js';
import Review from './model/review/Review.js';

const run = async () => {
  await mongoose.connect(config.db);
  const db = mongoose.connection;

  try {
    const collections = [
      'users',
      'categories',
      'news',
      'tours',
      'toursets',
      'orders',
      'reviews',
    ];

    for (const collectionName of collections) {
      try {
        await db.dropCollection(collectionName);
      } catch (e) {
        const err = e as { code?: number };
        if (err.code === 26) {
          console.log(
            `Коллекция ${collectionName} отсутствовала, пропускаем...`,
          );
          continue;
        }
        throw e;
      }
    }

    const admin = new User({
      fullName: 'admin',
      phone: '0555172032',
      password: '123456789',
      role: 'ADMIN',
    });
    await admin.save();

    const manager = new User({
      fullName: 'manager',
      phone: '0555172043',
      password: '123456789',
      role: 'MANAGER',
    });
    await manager.save();

    const client = new User({
      fullName: 'client',
      phone: '0555172011',
      password: '123456789',
      role: 'CLIENT',
    });
    await client.save();

    if (!admin || !manager || !client) {
      console.log('Что то пошло не так с ролями ');
      return;
    }

    const [categoryOne, categoryTwo, categoryThree, categoryFour] =
      await Category.create(
        { title: 'Экскурсионные' },
        { title: 'Оздоровительные' },
        { title: 'Пляжные', isPublished: true },
        { title: 'Гастрономические', isPublished: true },
      );

await News.create([
      {
        title: 'Раннее бронирование: Турция 2024 открыто!',
        content:
          'Ассоциация туроператоров совместно с ведущими авиаперевозчиками официально объявила о запуске масштабного и самого ожидаемого этапа программы «Раннее бронирование» на грядущий летний сезон. Эксперты отрасли в один голос утверждают, что в текущих экономических реалиях это единственный надежный способ гарантировать себе качественный отдых в премиальных отельных комплексах Анталийского, Даламанского и Эгейского побережий по фиксированной и максимально выгодной стоимости. Традиционно, наиболее востребованные семейные пятизвездочные резорты, работающие по концепции «Ультра все включено», заполняются задолго до начала лета и встают в стоп-лист уже к концу апреля.\n\n' +
          'В текущем сезоне принимающая сторона и российские консолидаторы рейсов пошли навстречу туристам и разработали беспрецедентно гибкие, лояльные условия для планирования и защиты семейного бюджета. Основные преимущества и ключевые параметры программы выглядят следующим образом:\n' +
          '- Первоначальный минимальный взнос для фиксации стоимости тура составляет всего 10% от общей цены;\n' +
          '- Предоставляется беспроцентная поэтапная рассрочка на оставшуюся часть суммы с возможностью закрытия платежа за две недели до вылета;\n' +
          '- Действует опция «Гарантия лучшей цены», которая обязывает туроператора сделать перерасчет в пользу клиента, если отель снизит стоимость;\n' +
          '- Предусмотрена возможность бесплатной отмены или изменения дат поездки в силу непредвиденных обстоятельств за 21 день до старта;\n' +
          '- Максимальные прямые скидки от самих турецких отельеров, которые на данном этапе достигают рекордных 40-45% на проживание.\n\n' +
          'Аналитики прогнозируют взрывной, ажиотажный спрос на такие европейские направления, как Бодрум, Мармарис и Фетхие, из-за чего глубина продаж в этом году бьет все исторические рекорды. Прошлый сезон показал, что туристы, откладывавшие покупку туров на май или июнь, столкнулись с дефицитом авиабилетов на удобные утренние рейсы и были вынуждены выбирать из оставшихся отелей не самого высокого уровня. Наша команда настоятельно рекомендует не затягивать с принятием решения и зафиксировать выгодные условия уже в ближайшие дни.',
        image: 'images/news_turkey.jpg',
        tags: ['Турция', 'акции', 'раннее бронирование'],
        isPublished: true,
        author: admin._id,
      },
      {
        title: 'Топ-5 скрытых жемчужин Дагестана',
        content:
          'Невероятный туристический бум в Республике Дагестан продолжает набирать обороты, привлекая путешественников со всех уголков страны. Однако подавляющее большинство гостей региона по-прежнему ограничивается стандартным, избитым набором локаций, включающим в себя Сулакский каньон, бархан Сарыкум и старинную цитадель Нарын-Кала в Дербенте. Наша специальная редакция совместно с опытными местными гидами и проводниками подготовила эксклюзивный лонгрид о тех потрясающих местах, которые пока еще не наводнили организованные толпы экскурсионных автобусов и где можно остаться наедине с величественной природой.\n\n' +
          'Мы тщательно проработали и составили уникальный альтернативный маршрут, который позволит вам прочувствовать настоящую, дикую, суровую и одновременно гостеприимную атмосферу этого кавказского края:\n' +
          '- Старый Кахиб и Гоор — древнейшие оборонительные башни и разрушенные аулы-призраки, буквально вросшие в отвесные неприступные скалы;\n' +
          '- Карадахская теснина — уникальный природный памятник шириной всего пару метров, который местные жители называют «Воротами чудес»;\n' +
          '- Салтинский подземный водопад — единственное в своем роде чудо природы, где бурный поток падает сквозь круглое отверстие в каменном гроте;\n' +
          '- Хунзахское плато и водопад Тобот — грандиозное зрелище, где мощная река с грохотом срывается в глубокое каньонное ущелье с высоты 70 метров;\n' +
          '- Высокогорное село Куруш — самый южный и самый высокогорный населенный пункт России, расположенный на головокружительной высоте над уровнем моря.\n\n' +
          'При самостоятельном планировании подобного сложного путешествия критически важно помнить о специфической логистике региона. Дороги ко многим из этих точек представляют собой извилистые каменистые серпантины, требующие от водителя повышенного внимания и автомобиля с высоким клиренсом и полным приводом. Также стоит учитывать, что инфраструктура в отдаленных районах только развивается, поэтому бронировать аутентичные гостевые дома у местных жителей необходимо как минимум за месяц до планируемой даты выезда.',
        image: 'images/news_dagestan.jpg',
        tags: ['Россия', 'советы', 'экскурсии'],
        isPublished: true,
        author: admin._id,
      },
      {
        title: 'Изменения в выдаче шенгенских виз',
        content:
          'Консульства европейских государств приняли решение существенно ужесточить текущий контроль за подтверждением финансовой состоятельности и благонадежности иностранных заявителей. Официальные представительства Италии, Франции, Германии и Испании синхронно обновили внутренний регламент приема и рассмотрения пакетов документов. Эти нововведения уже вызвали серьезный резонанс в туристической среде, привели к увеличению очередей в визовых центрах и заставили многих пересмотреть свои планы на отпуск.\n\n' +
          'Основные и наиболее радикальные изменения коснулись именно финансового блока документов, а также подтверждения реальных намерений туриста. Теперь соискателям необходимо строго и без малейших отклонений соблюдать следующие жесткие требования:\n' +
          '- Официальная выписка с банковского счета теперь обязана детально отражать движение денежных средств строго за последние 3-6 полных месяцев;\n' +
          '- Минимальный неснижаемый остаток на балансе существенно увеличен и теперь рассчитывается из нормы не менее 100-120 евро на каждый день поездки;\n' +
          '- Консульские сотрудники начали проводить выборочную телефонную верификацию справок с места работы по указанным городским номерам;\n' +
          '- Предоставление полностью выкупленных авиабилетов в обе стороны и подтвержденных оплат из отелей стало практически обязательным фактором;\n' +
          '- Использование спонсорских писем теперь жестко ограничено и допускается только для близких родственников при наличии документов о родстве.\n\n' +
          'В связи с возросшей нагрузкой и более тщательной проверкой личных данных, реальные сроки рассмотрения заявлений в разгар сезона могут растягиваться до 45-60 календарных дней. Ведущие специалисты в области туризма настоятельно рекомендуют подавать полный пакет документов максимально заранее, а также избегать сомнительных фирм-посредников, предлагающих «гарантированную» визу за пару дней, так как это напрямую ведет к получению пожизненного отказа в паспорте.',
        image: 'images/news_schengen.jpg',
        tags: ['визы', 'важно', 'Европа'],
        isPublished: true,
        author: manager._id,
      },
      {
        title: 'Горящий тур: Мальдивы на двоих за 180 000С',
        content:
          'Срочное информационное сообщение от нашего департамента горящих направлений: в системе бронирования зафиксировано аномальное падение стоимости на премиальный пакетный тур. По причине внезапной аннуляции крупного корпоративного заказа со стороны зарубежных партнеров, в свободную продажу был экстренно выгружен отказной тур на Мальдивские острова. Финальная стоимость данного предложения является уникальной для рынка, поскольку она едва покрывает текущую себестоимость трансатлантического перелета.\n\n' +
          'Предложение носит строго лимитированный характер, а плановый вылет из международного терминала назначен уже на послезавтра. В полную стоимость этого уникального горящего пакета включено абсолютно все необходимое для роскошного отдыха:\n' +
          '- Прямой беспосадочный чартерный перелет в обе стороны с включенным багажом весом до 23 килограмм на каждого пассажира;\n' +
          '- 7 полных ночей проживания в современном, высококлассном 4-звездочном отеле, расположенном на первой линии атолла Ари;\n' +
          '- Полноценное трехразовое питание по популярной системе All Inclusive с огромным выбором свежих морепродуктов и экзотических фруктов;\n' +
          '- Групповой трансфер на скоростном лицензированном катере непосредственно от международного аэропорта Мале до пирса отеля;\n' +
          '- Расширенная медицинская страховка со специальным покрытием всех возможных спортивных и специфических рисков.\n\n' +
          'На текущий момент времени в системе доступно для бронирования всего два последних свободных места. Для оперативного оформления тура в офисе или удаленно онлайн требуются действующие заграничные паспорта всех участников поездки со сроком действия не менее шести месяцев, а также моментальная стопроцентная оплата наличными или банковской картой. Подобные эксклюзивные путевки обычно раскупаются в течение первых двадцати минут с момента публикации.',
        image: 'images/mald_2.jpg',
        tags: ['горящие туры', 'Мальдивы', 'экзотика'],
        isPublished: false,
        author: manager._id,
      },
      {
        title: 'Горнолыжный сезон в Шерегеше: прогноз погоды',
        content:
          'Популярнейший сибирский курорт Шерегеш выходит на финальную стадию подготовки к официальному и торжественному открытию очередного зимнего горнолыжного сезона. Профильные синоптические ведомства и специализированные лавинные службы единогласно рапортуют о затяжных, аномально сильных снегопадах в районе сектора А. Благодаря этому на вершине и склонах знаменитой горы Зеленая уже сейчас сформировался идеальный, устойчивый и плотный снежный покров. Райдеры со всей страны ценят это место за уникальную структуру снега, создающую знаменитый эффект легкого «пухляка».\n\n' +
          'Действующая администрация спортивного комплекса подготовила грандиозную развлекательную шоу-программу, а также реализовала комплекс важных инфраструктурных изменений:\n' +
          '- Успешный запуск совершенно новой современной канатной дороги гондольного типа в секторе Е, что существенно снизит очереди в пиковые часы;\n' +
          '- Официальное внедрение долгожданного единого ски-пасса, который наконец-то объединил подъемники крупных конкурирующих операторов;\n' +
          '- Существенное расширение зоны для вечернего и ночного катания благодаря установке инновационной системы искусственного освещения трасс;\n' +
          '- Открытие дополнительных сертифицированных сервисных центров и станций проката с топовыми линейками сноубордов и лыж текущего года.\n\n' +
          'Долгосрочный метеорологический прогноз на стартовую неделю обещает спортсменам максимально комфортные климатические условия: температура воздуха зафиксируется в районе минус 7-10 градусов при полном отсутствии шквалистого ветра. Стоит отметить, что свободный номерной фонд в гостиницах и шале, расположенных у подножия горы, на текущий момент забронирован уже более чем на 85%, поэтому туристам стоит поторопиться с поиском вариантов для размещения.',
        image: 'images/news_sheregesh.jpg',
        tags: ['лыжи', 'Шерегеш', 'зима'],
        isPublished: true,
        author: manager._id,
      },
    ]);

    if (!categoryOne || !categoryTwo || !categoryThree || !categoryFour) {
      console.log('Что то пошло не так с категориями');
      return;
    }

    const [tour1, tour2, tour3, tour4, tour5] = await Tour.create([
      {
        title: 'Сказочный Бали: Нуса-Дуа',
        description:
          'Насладитесь белоснежными пляжами и первоклассным сервисом в лучшем курортном районе Бали. Программа включает посещение храмов и уроки серфинга.',
        images: [
          'images/bali_one.jpg',
          'images/bali_two.webp',
          'images/bali_three.webp',
        ],
        category: categoryOne._id,
        baseAdvantages: [
          'Первая береговая линия',
          'Завтраки включены',
          'Трансфер из аэропорта',
        ],
        isPublished: true,
      },
      {
        title: 'Тайны древнего Египта: Каир и Луксор',
        description:
          'Глубокое погружение в историю: Пирамиды Гизы, Сфинкс и величественный Луксорский храм. Сопровождение историка-гида.',
        images: ['images/egypt_1.png', 'images/egypt_2.png'],
        category: categoryTwo._id,
        baseAdvantages: [
          'Русскоговорящий гид',
          'Входные билеты включены',
          'Обед в местном ресторане',
        ],
        isPublished: true,
      },
      {
        title: 'Восхождение на Эльбрус',
        description:
          'Профессиональная экспедиция для тех, кто хочет покорить самую высокую точку Европы. Полная экипировка и опытные инструкторы.',
        images: ['images/elbrus_1.png'],
        category: categoryThree._id,
        baseAdvantages: [
          'Сертифицированные гиды',
          'Аренда снаряжения',
          'Групповая аптечка',
        ],
        isPublished: true,
      },
      {
        title: 'Уикенд в Стамбуле',
        description:
          'Прогулки по Босфору, ароматный кофе в районе Кадыкёй и величие Айя-Софии. Идеальный тур на 3 дня.',
        images: ['images/stamb_1.png', 'images/stamb_2.png'],
        category: categoryFour._id,
        baseAdvantages: [
          'Отель в центре города',
          'Карта для транспорта в подарок',
        ],
        isPublished: false,
      },
      {
        title: 'Мальдивы: Резорт Adaaran Select',
        description:
          'Уединенные виллы над водой, кристально чистая лагуна и дайвинг среди коралловых рифов.',
        images: [
          'images/mald_1.png',
          'images/mald_2.png',
          'images/mald_3.png',
          'images/mald_4.png',
        ],
        category: categoryFour._id,
        baseAdvantages: [
          'Всё включено',
          'Собственный риф',
          'Скидка на SPA 20%',
        ],
        isPublished: true,
      },
    ]);

    if (!tour1 || !tour2 || !tour3 || !tour4 || !tour5) {
      console.log('что пошло не так с турами');
      return;
    }

    const [ts1, ts2, ts3, ts4, ts5] = await TourSet.create([
      {
        tourId: tour1._id,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-12'),
        price: 150000,
        hotelName: 'Ayana Resort & Spa',
        hotelLocation: 'Джимбаран, Бали',
        airline: 'Turkish Airlines',
        isHot: true,
        flightDetails: 'Рейс TK-1234, пересадка в Стамбуле',
        totalSeats: 15,
        bookedSeats: 5,
        status: 'OPEN',
      },
      {
        tourId: tour2._id,
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-25'),
        price: 95000,
        discountPrice: 75000,
        isHot: true,
        saleDeadline: new Date('2024-06-10'),
        hotelName: 'Steigenberger Al Dau Beach',
        hotelLocation: 'Хургада, Египет',
        airline: 'EgyptAir',
        flightDetails: 'Прямой чартер',
        totalSeats: 25,
        bookedSeats: 20,
        status: 'OPEN',
      },
      {
        tourId: tour3._id,
        startDate: new Date('2024-08-05'),
        endDate: new Date('2024-08-15'),
        price: 60000,
        hotelName: 'Горный Приют 11',
        hotelLocation: 'Склон Эльбруса, 4200м',
        airline: 'Aeroflot',
        flightDetails: 'Рейс SU-1150 до Минвод',
        totalSeats: 10,
        bookedSeats: 10,
        status: 'CLOSED',
      },
      {
        tourId: tour4._id,
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-04'),
        price: 45000,
        isHot: true,
        hotelName: 'Legacy Ottoman Hotel',
        hotelLocation: 'Сиркеджи, Стамбул',
        status: 'FINISHED',
        totalSeats: 20,
        bookedSeats: 18,
      },
      {
        tourId: tour5._id,
        startDate: new Date('2024-09-20'),
        endDate: new Date('2024-09-30'),
        price: 250000,
        isHot: true,
        hotelName: 'Soneva Fushi',
        hotelLocation: 'Атолл Баа, Мальдивы',
        airline: 'Qatar Airways',
        flightDetails: 'Рейс QR-342 через Доху',
        totalSeats: 8,
        bookedSeats: 2,
        status: 'OPEN',
      },
    ]);

    if (!ts1 || !ts2 || !ts3 || !ts4 || !ts5) {
      console.log('что не так пошло с турсетами');
      return;
    }

    await Order.create([
      {
        tourSetId: ts1._id,
        clientName: 'Иван Иванов',
        clientPhone: '+996555123456',
        status: 'NEW',
        managerId: manager._id,
      },
      {
        tourSetId: ts2._id,
        clientName: 'Виталий Тар',
        clientPhone: '79001112233',
        status: 'IN_PROGRESS',
        managerId: manager._id,
      },
      {
        tourSetId: ts1._id,
        clientName: 'Виктор Петров',
        clientPhone: '+996700123987',
        status: 'REJECTED',
        managerId: manager._id,
        rejectionReason: 'передумал из-за изменения дат отпуска',
      },
      {
        tourSetId: ts5._id,
        clientName: 'Ольга Новикова',
        clientPhone: '+996999000111',
        status: 'CONTRACT_PENDING',
        managerId: manager._id,
      },
      {
        tourSetId: ts2._id,
        clientName: 'Сергей Васильев',
        clientPhone: '+79112223344',
        status: 'COMPLETED',
        managerId: manager._id,
      },
    ]);

    await Review.create([
      {
        clientName: 'Mila Petković',
        tourId: tour1._id,
        rating: 1,
        comment: 'Сервис круглосуточный, любая просьба выполнялась быстро.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Arjun Mehta',
        tourId: tour1._id,
        rating: 5,
        comment: 'Локация далековато от центра, но это плюс для тишины.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Petra Novotná',
        tourId: tour1._id,
        rating: 3,
        comment: 'Спасибо за подбор тура, всё под наши хотелки.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Chloe Dubois',
        tourId: tour1._id,
        rating: 3,
        comment: 'Море тёплое, песок чистый, что ещё нужно для счастья.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Ines Almeida',
        tourId: tour1._id,
        rating: 4,
        comment: 'Уютный номер, удобная кровать, отличный душ.',
        image: 'images/bali_three.webp',
        isModerated: false,
      },
      {
        clientName: 'Sara Johansson',
        tourId: tour1._id,
        rating: 4,
        comment: 'Хотелось бы больше времени на каждую локацию.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Hugo Lefebvre',
        tourId: tour1._id,
        rating: 5,
        comment: 'Турфирма реально болеет за клиента, чувствуется.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Camila Silva',
        tourId: tour1._id,
        rating: 5,
        comment: 'Хотелось бы больше времени на каждую локацию.',
        image: 'images/bali_one.jpg',
        isModerated: true,
      },
      {
        clientName: 'Marco Bianchi',
        tourId: tour1._id,
        rating: 1,
        comment: 'Не пожалел ни секунды, что выбрал этот тур.',
        image: 'images/bali_one.jpg',
        isModerated: true,
      },
      {
        clientName: 'Yuki Sato',
        tourId: tour1._id,
        rating: 4,
        comment: 'Гид рассказывал так, что хотелось слушать ещё.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Adrian Novak',
        tourId: tour1._id,
        rating: 5,
        comment: 'Получил массу впечатлений, голова до сих пор там.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Oscar Lindberg',
        tourId: tour1._id,
        rating: 4,
        comment: 'Очень понравилось, друзьям уже посоветовал.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Marek Dvořák',
        tourId: tour1._id,
        rating: 4,
        comment: 'Тур стоит своих денег и даже больше.',
        image: 'images/bali_two.webp',
        isModerated: true,
      },
      {
        clientName: 'Caleb Reyes',
        tourId: tour1._id,
        rating: 5,
        comment: 'Местная кухня покорила сердце и желудок.',
        image: 'images/bali_two.webp',
        isModerated: false,
      },
      {
        clientName: 'Mateo Rossi',
        tourId: tour1._id,
        rating: 4,
        comment: 'Уровень сервиса заметно выше, чем у конкурентов.',
        image: 'images/bali_one.jpg',
        isModerated: true,
      },
      {
        clientName: 'Hiroshi Tanaka',
        tourId: tour1._id,
        rating: 4,
        comment: 'Спасибо за подбор тура, всё под наши хотелки.',
        image: 'images/bali_two.webp',
        isModerated: true,
      },
      {
        clientName: 'Olivia Bennett',
        tourId: tour1._id,
        rating: 3,
        comment: 'Уровень сервиса заметно выше, чем у конкурентов.',
        image: 'images/bali_one.jpg',
        isModerated: true,
      },
      {
        clientName: 'Clara Weber',
        tourId: tour1._id,
        rating: 2,
        comment: 'Уровень сервиса заметно выше, чем у конкурентов.',
        image: 'images/bali_three.webp',
        isModerated: false,
      },
      {
        clientName: 'Mia Larsen',
        tourId: tour1._id,
        rating: 4,
        comment: 'Природа здесь космическая, никакие фотографии не передадут.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Liam Walsh',
        tourId: tour1._id,
        rating: 4,
        comment: 'Спасибо за чёткие инструкции перед вылетом.',
        image: 'images/bali_two.webp',
        isModerated: true,
      },
      {
        clientName: 'Nadia Said',
        tourId: tour1._id,
        rating: 4,
        comment: 'Местная кухня покорила сердце и желудок.',
        image: 'images/bali_three.webp',
        isModerated: true,
      },
      {
        clientName: 'Hannah Müller',
        tourId: tour1._id,
        rating: 1,
        comment: 'Поехали вдвоём, вернулись с кучей общих воспоминаний.',
        image: 'images/bali_two.webp',
        isModerated: true,
      },
      {
        clientName: 'Pablo Garcia',
        tourId: tour1._id,
        rating: 3,
        comment: 'Маршрут продуман, нет ощущения суеты.',
        image: 'images/bali_two.webp',
        isModerated: true,
      },
      {
        clientName: 'Jamal Ahmed',
        tourId: tour1._id,
        rating: 3,
        comment: 'Ожидал классики, получил приключение.',
        image: 'images/bali_two.webp',
        isModerated: true,
      },
      {
        clientName: 'Ethan Brooks',
        tourId: tour1._id,
        rating: 3,
        comment: 'Хороший выбор для первого знакомства с направлением.',
        image: 'images/bali_one.jpg',
        isModerated: true,
      },
      {
        clientName: 'Elena Popov',
        tourId: tour2._id,
        rating: 2,
        comment: 'Завтраки разнообразные, можно перепробовать всё за неделю.',
        image: 'images/egypt_2.png',
        isModerated: false,
      },
      {
        clientName: 'Henrik Berg',
        tourId: tour2._id,
        rating: 1,
        comment: 'Поехали вдвоём, вернулись с кучей общих воспоминаний.',
        image: 'images/egypt_2.png',
        isModerated: false,
      },
      {
        clientName: 'Ravi Patel',
        tourId: tour2._id,
        rating: 3,
        comment: 'Понравилась дотошность к деталям в организации.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Kira Sokolov',
        tourId: tour2._id,
        rating: 4,
        comment: 'Атмосфера расслабляющая, идеально для перезагрузки.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Pablo Garcia',
        tourId: tour2._id,
        rating: 5,
        comment: 'Экскурсии интересные, но некоторые слишком утомительные.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Aisha Khan',
        tourId: tour2._id,
        rating: 2,
        comment: 'Воздух здесь чище, чем дома, дышится по-другому.',
        image: 'images/egypt_1.png',
        isModerated: false,
      },
      {
        clientName: 'Jonas Eriksson',
        tourId: tour2._id,
        rating: 3,
        comment: 'Маршрут продуман, нет ощущения суеты.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Kenji Nakamura',
        tourId: tour2._id,
        rating: 5,
        comment: 'Каждый день был как маленькая жизнь.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Mateo Rossi',
        tourId: tour2._id,
        rating: 4,
        comment: 'Локация шикарная, фотографии получились сами собой.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Ines Almeida',
        tourId: tour2._id,
        rating: 2,
        comment: 'Локация далековато от центра, но это плюс для тишины.',
        image: 'images/egypt_1.png',
        isModerated: false,
      },
      {
        clientName: "Daniel O'Connor",
        tourId: tour2._id,
        rating: 3,
        comment: 'Спасибо за подбор тура, всё под наши хотелки.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Freya Olsen',
        tourId: tour2._id,
        rating: 5,
        comment: 'Аутентичность места поражает, не туристическая показуха.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Beatriz Lopes',
        tourId: tour2._id,
        rating: 1,
        comment: 'Гид рассказывал так, что хотелось слушать ещё.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Selin Yilmaz',
        tourId: tour2._id,
        rating: 4,
        comment: 'Бассейн с видом — отдельный вид удовольствия.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Nora Hansen',
        tourId: tour2._id,
        rating: 5,
        comment: 'Спасибо за чёткие инструкции перед вылетом.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Yuki Sato',
        tourId: tour2._id,
        rating: 5,
        comment: 'Идеальный баланс отдыха и впечатлений.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Bruno Costa',
        tourId: tour2._id,
        rating: 5,
        comment: 'Получили больше эмоций, чем ожидали за такой бюджет.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Nadia Said',
        tourId: tour2._id,
        rating: 5,
        comment: 'Бронировал в последний момент, всё равно всё прошло отлично.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Oscar Lindberg',
        tourId: tour2._id,
        rating: 2,
        comment: 'Всё прошло гладко, организаторы молодцы. Рекомендую.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Sophie Martin',
        tourId: tour2._id,
        rating: 4,
        comment:
          'Менеджер был на связи 24/7, любой вопрос решался моментально.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Lukas Hoffmann',
        tourId: tour2._id,
        rating: 5,
        comment: 'Сервис круглосуточный, любая просьба выполнялась быстро.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Ethan Brooks',
        tourId: tour2._id,
        rating: 4,
        comment: 'Поехал один, нашёл там друзей на всю жизнь.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Arjun Mehta',
        tourId: tour2._id,
        rating: 5,
        comment: 'Уютный номер, удобная кровать, отличный душ.',
        image: 'images/egypt_1.png',
        isModerated: true,
      },
      {
        clientName: 'Tess McAllister',
        tourId: tour2._id,
        rating: 1,
        comment: 'Турфирма реально болеет за клиента, чувствуется.',
        image: 'images/egypt_1.png',
        isModerated: false,
      },
      {
        clientName: 'Carlos Ramírez',
        tourId: tour2._id,
        rating: 5,
        comment: 'Понравилось буквально всё, придраться не к чему.',
        image: 'images/egypt_2.png',
        isModerated: true,
      },
      {
        clientName: 'Beatriz Lopes',
        tourId: tour3._id,
        rating: 5,
        comment: 'Локация шикарная, фотографии получились сами собой.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Layla Rahman',
        tourId: tour3._id,
        rating: 5,
        comment: 'Идеальный баланс отдыха и впечатлений.',
        image: 'images/elbrus_1.png',
        isModerated: false,
      },
      {
        clientName: 'Lina Petrov',
        tourId: tour3._id,
        rating: 5,
        comment: 'Понравилась честность менеджера, никаких сюрпризов.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Jamal Ahmed',
        tourId: tour3._id,
        rating: 3,
        comment: 'Хотелось бы больше времени на каждую локацию.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Freya Olsen',
        tourId: tour3._id,
        rating: 5,
        comment: 'Атмосфера курорта расслабляет с первой минуты.',
        image: 'images/elbrus_1.png',
        isModerated: false,
      },
      {
        clientName: 'Anna Kowalski',
        tourId: tour3._id,
        rating: 4,
        comment: 'Воздух здесь чище, чем дома, дышится по-другому.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Lara Schmidt',
        tourId: tour3._id,
        rating: 4,
        comment: 'Сервис на уровне европейских стандартов.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Stefan Köhler',
        tourId: tour3._id,
        rating: 3,
        comment: 'Природа здесь космическая, никакие фотографии не передадут.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Jonas Eriksson',
        tourId: tour3._id,
        rating: 3,
        comment: 'Закаты здесь просто открытка, каждый вечер любовались.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Sienna Wallace',
        tourId: tour3._id,
        rating: 4,
        comment: 'Ожидал классики, получил приключение.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Hiroshi Tanaka',
        tourId: tour3._id,
        rating: 5,
        comment: 'Не пожалел ни секунды, что выбрал этот тур.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Mehmet Demir',
        tourId: tour3._id,
        rating: 3,
        comment: 'Шумные соседи в отеле, но это не вина организаторов.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Oscar Lindberg',
        tourId: tour3._id,
        rating: 5,
        comment: 'Поездка как глоток свежего воздуха.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Marco Bianchi',
        tourId: tour3._id,
        rating: 5,
        comment: 'Гид рассказывал так, что хотелось слушать ещё.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Henrik Berg',
        tourId: tour3._id,
        rating: 5,
        comment: 'Возвращаться в реальность было физически больно.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Diego Fernandez',
        tourId: tour3._id,
        rating: 4,
        comment: 'Спасибо за чёткие инструкции перед вылетом.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Chloe Dubois',
        tourId: tour3._id,
        rating: 4,
        comment: 'Чувствовали себя в безопасности на протяжении всей поездки.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Nadia Said',
        tourId: tour3._id,
        rating: 1,
        comment: 'Виды из окна номера — отдельный аттракцион.',
        image: 'images/elbrus_1.png',
        isModerated: false,
      },
      {
        clientName: 'Noah Andersen',
        tourId: tour3._id,
        rating: 4,
        comment: 'Атмосфера курорта расслабляет с первой минуты.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Adrian Novak',
        tourId: tour3._id,
        rating: 5,
        comment: 'Понравилась дотошность к деталям в организации.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Fatima Zahra',
        tourId: tour3._id,
        rating: 5,
        comment: 'Получил массу впечатлений, голова до сих пор там.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Ravi Patel',
        tourId: tour3._id,
        rating: 3,
        comment: 'Маршрут продуман, нет ощущения суеты.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Akira Yamamoto',
        tourId: tour3._id,
        rating: 3,
        comment: 'Закаты здесь просто открытка, каждый вечер любовались.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Saskia de Vries',
        tourId: tour3._id,
        rating: 5,
        comment: 'Не пожалел ни секунды, что выбрал этот тур.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Matteo Conti',
        tourId: tour3._id,
        rating: 4,
        comment: 'Атмосфера расслабляющая, идеально для перезагрузки.',
        image: 'images/elbrus_1.png',
        isModerated: true,
      },
      {
        clientName: 'Aisha Khan',
        tourId: tour4._id,
        rating: 4,
        comment: 'Виды из окна номера — отдельный аттракцион.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Ravi Patel',
        tourId: tour4._id,
        rating: 4,
        comment: 'Сервис круглосуточный, любая просьба выполнялась быстро.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Lukas Hoffmann',
        tourId: tour4._id,
        rating: 5,
        comment: 'Отель чистый, персонал отзывчивый, виды шикарные.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Jamal Ahmed',
        tourId: tour4._id,
        rating: 2,
        comment: 'Хотелось бы побольше деталей по культуре в программе.',
        image: 'images/stamb_1.png',
        isModerated: false,
      },
      {
        clientName: 'Amelie Bauer',
        tourId: tour4._id,
        rating: 4,
        comment: 'Цена и качество совпали, никаких нареканий.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Bruno Costa',
        tourId: tour4._id,
        rating: 3,
        comment: 'Атмосфера расслабляющая, идеально для перезагрузки.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Hannah Müller',
        tourId: tour4._id,
        rating: 4,
        comment: 'Море впечатлений за минимальные деньги.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Oscar Lindberg',
        tourId: tour4._id,
        rating: 5,
        comment: 'Дорога была долгой, но оно того стоило.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Anya Krylov',
        tourId: tour4._id,
        rating: 4,
        comment: 'Поездка как глоток свежего воздуха.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Fatima Zahra',
        tourId: tour4._id,
        rating: 5,
        comment: 'Лучше отдыха у меня ещё не было.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Tara McKenzie',
        tourId: tour4._id,
        rating: 3,
        comment: 'Маленький отель, домашняя атмосфера, всё ламповое.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Pablo Garcia',
        tourId: tour4._id,
        rating: 5,
        comment: 'Маленький минус — слабый Wi-Fi, но это даже к лучшему.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Hiroshi Tanaka',
        tourId: tour4._id,
        rating: 3,
        comment: 'Уровень сервиса заметно выше, чем у конкурентов.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Beatriz Lopes',
        tourId: tour4._id,
        rating: 5,
        comment: 'Хороший выбор для первого знакомства с направлением.',
        image: 'images/stamb_2.png',
        isModerated: false,
      },
      {
        clientName: 'Jorge Mendoza',
        tourId: tour4._id,
        rating: 3,
        comment: 'Цены на месте кусаются, лучше взять с собой больше налички.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Mia Larsen',
        tourId: tour4._id,
        rating: 3,
        comment: 'Поехал один, нашёл там друзей на всю жизнь.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Sara Johansson',
        tourId: tour4._id,
        rating: 4,
        comment: 'Не хватило времени на свободные дни, программа плотная.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Ines Almeida',
        tourId: tour4._id,
        rating: 5,
        comment: 'Локация шикарная, фотографии получились сами собой.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Jonas Eriksson',
        tourId: tour4._id,
        rating: 3,
        comment: 'Местные жители очень дружелюбные, всегда помогут.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Elena Popov',
        tourId: tour4._id,
        rating: 5,
        comment: 'Гид говорил на русском очень хорошо, всё понятно.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Felix Wagner',
        tourId: tour4._id,
        rating: 4,
        comment: 'Хотелось бы больше времени на каждую локацию.',
        image: 'images/stamb_2.png',
        isModerated: true,
      },
      {
        clientName: 'Tomás Cabrera',
        tourId: tour4._id,
        rating: 1,
        comment: 'Экскурсии интересные, но некоторые слишком утомительные.',
        image: 'images/stamb_2.png',
        isModerated: false,
      },
      {
        clientName: 'Liam Walsh',
        tourId: tour4._id,
        rating: 2,
        comment: 'Цена и качество совпали, никаких нареканий.',
        image: 'images/stamb_1.png',
        isModerated: false,
      },
      {
        clientName: 'Kira Sokolov',
        tourId: tour4._id,
        rating: 4,
        comment: 'Поехали вдвоём, вернулись с кучей общих воспоминаний.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Sienna Wallace',
        tourId: tour4._id,
        rating: 5,
        comment: 'Спасибо за подбор тура, всё под наши хотелки.',
        image: 'images/stamb_1.png',
        isModerated: true,
      },
      {
        clientName: 'Theo Laurent',
        tourId: tour5._id,
        rating: 4,
        comment:
          'Программа насыщенная, времени посидеть в номере не оставалось.',
        image: 'images/mald_2.png',
        isModerated: true,
      },
      {
        clientName: 'Carlos Ramírez',
        tourId: tour5._id,
        rating: 5,
        comment: 'Спасибо за чёткие инструкции перед вылетом.',
        image: 'images/mald_2.png',
        isModerated: true,
      },
      {
        clientName: 'Henrik Berg',
        tourId: tour5._id,
        rating: 1,
        comment: 'Каждый день был как маленькая жизнь.',
        image: 'images/mald_1.png',
        isModerated: false,
      },
      {
        clientName: 'Niko Virtanen',
        tourId: tour5._id,
        rating: 3,
        comment: 'Маршрут продуман, нет ощущения суеты.',
        image: 'images/mald_1.png',
        isModerated: true,
      },
      {
        clientName: 'Layla Rahman',
        tourId: tour5._id,
        rating: 3,
        comment: 'Сервис круглосуточный, любая просьба выполнялась быстро.',
        image: 'images/mald_3.png',
        isModerated: true,
      },
      {
        clientName: "Daniel O'Connor",
        tourId: tour5._id,
        rating: 5,
        comment: 'Получилось совместить отдых и спорт, это здорово.',
        image: 'images/mald_2.png',
        isModerated: true,
      },
      {
        clientName: 'Saskia de Vries',
        tourId: tour5._id,
        rating: 5,
        comment: 'Завтраки разнообразные, можно перепробовать всё за неделю.',
        image: 'images/mald_4.png',
        isModerated: true,
      },
      {
        clientName: 'Omar Faruq',
        tourId: tour5._id,
        rating: 4,
        comment: 'Воздух здесь чище, чем дома, дышится по-другому.',
        image: 'images/mald_4.png',
        isModerated: false,
      },
      {
        clientName: 'Jonas Eriksson',
        tourId: tour5._id,
        rating: 2,
        comment: 'Локация шикарная, фотографии получились сами собой.',
        image: 'images/mald_1.png',
        isModerated: false,
      },
      {
        clientName: 'Elena Popov',
        tourId: tour5._id,
        rating: 3,
        comment: 'Из минусов только то, что отпуск закончился.',
        image: 'images/mald_4.png',
        isModerated: true,
      },
      {
        clientName: 'Nadia Said',
        tourId: tour5._id,
        rating: 1,
        comment: 'Тур стоит своих денег и даже больше.',
        image: 'images/mald_1.png',
        isModerated: true,
      },
      {
        clientName: 'Ethan Brooks',
        tourId: tour5._id,
        rating: 5,
        comment: 'Лучше отдыха у меня ещё не было.',
        image: 'images/mald_1.png',
        isModerated: true,
      },
      {
        clientName: 'Ravi Patel',
        tourId: tour5._id,
        rating: 3,
        comment: 'Хотелось бы побольше деталей по культуре в программе.',
        image: 'images/mald_3.png',
        isModerated: true,
      },
      {
        clientName: 'Lina Petrov',
        tourId: tour5._id,
        rating: 5,
        comment: 'Природа здесь космическая, никакие фотографии не передадут.',
        image: 'images/mald_3.png',
        isModerated: false,
      },
      {
        clientName: 'Kenji Nakamura',
        tourId: tour5._id,
        rating: 3,
        comment: 'Природа здесь космическая, никакие фотографии не передадут.',
        image: 'images/mald_4.png',
        isModerated: true,
      },
      {
        clientName: 'Hannah Müller',
        tourId: tour5._id,
        rating: 4,
        comment: 'Гид рассказывал так, что хотелось слушать ещё.',
        image: 'images/mald_3.png',
        isModerated: false,
      },
      {
        clientName: 'Jorge Mendoza',
        tourId: tour5._id,
        rating: 5,
        comment: 'Лучше отдыха у меня ещё не было.',
        image: 'images/mald_3.png',
        isModerated: true,
      },
      {
        clientName: 'Anna Kowalski',
        tourId: tour5._id,
        rating: 2,
        comment: 'Не хватило времени на свободные дни, программа плотная.',
        image: 'images/mald_2.png',
        isModerated: true,
      },
      {
        clientName: 'Mia Larsen',
        tourId: tour5._id,
        rating: 5,
        comment: 'Атмосфера курорта расслабляет с первой минуты.',
        image: 'images/mald_2.png',
        isModerated: true,
      },
      {
        clientName: 'Mehmet Demir',
        tourId: tour5._id,
        rating: 5,
        comment: 'Закаты здесь просто открытка, каждый вечер любовались.',
        image: 'images/mald_3.png',
        isModerated: true,
      },
      {
        clientName: 'Jamal Ahmed',
        tourId: tour5._id,
        rating: 3,
        comment: 'Хороший выбор для первого знакомства с направлением.',
        image: 'images/mald_1.png',
        isModerated: true,
      },
      {
        clientName: 'Felix Wagner',
        tourId: tour5._id,
        rating: 4,
        comment: 'Понравилась дотошность к деталям в организации.',
        image: 'images/mald_3.png',
        isModerated: true,
      },
      {
        clientName: 'Maja Janssen',
        tourId: tour5._id,
        rating: 4,
        comment: 'Всё прошло гладко, организаторы молодцы. Рекомендую.',
        image: 'images/mald_2.png',
        isModerated: true,
      },
      {
        clientName: 'Chloe Dubois',
        tourId: tour5._id,
        rating: 1,
        comment: 'Уровень сервиса заметно выше, чем у конкурентов.',
        image: 'images/mald_2.png',
        isModerated: false,
      },
      {
        clientName: 'Lucas van Dijk',
        tourId: tour5._id,
        rating: 2,
        comment: 'Цена и качество совпали, никаких нареканий.',
        image: 'images/mald_4.png',
        isModerated: false,
      },
    ]);

    console.log('Fixtures created successfully!');
  } finally {
    await db.close();
  }
};

run().catch(console.error);
