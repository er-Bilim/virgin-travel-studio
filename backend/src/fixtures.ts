import mongoose from 'mongoose';
import config from './config.js';
import User from './model/user/User.js';
import Category from './model/category/Category.js';
import News from "./model/New/News.js";
import Tour from "./model/tour/Tour.js";
import TourSet from "./model/tourSet/TourSet.js";
import Order from "./model/order/Order.js";
import Review from "./model/review/Review.js";

const run = async () => {
  await mongoose.connect(config.db);
  const db = mongoose.connection;

  try {

    const collections = ['users', 'categories', 'news', 'tours', 'toursets', 'orders', 'reviews'];

    for (const collectionName of collections) {
      try {
        await db.dropCollection(collectionName);
      } catch (e) {
        const err = e as { code?: number };
        if (err.code === 26) {
          console.log(`Коллекция ${collectionName} отсутствовала, пропускаем...`);
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

    const [categoryOne, categoryTwo, categoryThree, categoryFour] = await Category.create(
      {title: 'Экскурсионные'},
      {title: 'Оздоровительные'},
      {title: 'Пляжные', isPublished: true},
      {title: 'Гастрономические', isPublished: true},
    )

    await News.create([
      {
        title: "Раннее бронирование: Турция 2024 открыто!",
        content: "Успейте забронировать лучшие отели Анталии и Бодрума со скидкой до 40%. Первоначальный взнос всего 10%. Лето будет жарким!",
        image: "images/dracon.jpg",
        tags: ["Турция", "акции", "раннее бронирование"],
        isPublished: true,
        author: admin._id,
      },
      {
        title: "Топ-5 скрытых жемчужин Дагестана",
        content: "Дагестан — это не только Сулакский каньон. В этой статье мы расскажем о заброшенных аулах и секретных водопадах, о которых молчат путеводители.",
        image: "images/dracon.jpg",
        tags: ["Россия", "советы", "экскурсии"],
        isPublished: true,
        author: admin._id,
      },
      {
        title: "Изменения в выдаче шенгенских виз",
        content: "Внимание! С этой недели консульства Италии и Франции обновляют требования к финансовым гарантиям. Ознакомьтесь со списком документов.",
        image: "images/dracon.jpg",
        tags: ["визы", "важно", "Европа"],
        isPublished: true,
        author: manager._id,
      },
      {
        title: "Горящий тур: Мальдивы на двоих за 180 000₽",
        content: "Срочное предложение! Вылет послезавтра. Отель 4* на атолле Ари, питание 'все включено'. Осталось всего 2 места!",
        image: "images/dracon.jpg",
        tags: ["горящие туры", "Мальдивы", "экзотика"],
        isPublished: false,
        author: manager._id,
      },
      {
        title: "Горнолыжный сезон в Шерегеше: прогноз погоды",
        content: "Снег уже ложится на склоны! Подготовили для вас гид по самым популярным трассам и обзор цен на ски-пассы в этом сезоне.",
        image: "images/dracon.jpg",
        tags: ["лыжи", "Шерегеш", "зима"],
        isPublished: true,
        author: manager._id,
      }
    ]);


    if (!categoryOne || !categoryTwo || !categoryThree || !categoryFour) {
      console.log("Что то пошло не так с категориями");
      return;
    }

    const [tour1, tour2, tour3, tour4, tour5] = await Tour.create([
      {
        title: "Сказочный Бали: Нуса-Дуа",
        description: "Насладитесь белоснежными пляжами и первоклассным сервисом в лучшем курортном районе Бали. Программа включает посещение храмов и уроки серфинга.",
        images: ["images/dracon.jpg", "images/dracon.jpg"],
        category: categoryOne._id,
        baseAdvantages: ["Первая береговая линия", "Завтраки включены", "Трансфер из аэропорта"],
        isPublished: true,
      },
      {
        title: "Тайны древнего Египта: Каир и Луксор",
        description: "Глубокое погружение в историю: Пирамиды Гизы, Сфинкс и величественный Луксорский храм. Сопровождение историка-гида.",
        images: ["images/dracon.jpg"],
        category: categoryTwo._id,
        baseAdvantages: ["Русскоговорящий гид", "Входные билеты включены", "Обед в местном ресторане"],
        isPublished: true,
      },
      {
        title: "Восхождение на Эльбрус",
        description: "Профессиональная экспедиция для тех, кто хочет покорить самую высокую точку Европы. Полная экипировка и опытные инструкторы.",
        images: ["images/dracon.jpg"],
        category: categoryThree._id,
        baseAdvantages: ["Сертифицированные гиды", "Аренда снаряжения", "Групповая аптечка"],
        isPublished: true,
      },
      {
        title: "Уикенд в Стамбуле",
        description: "Прогулки по Босфору, ароматный кофе в районе Кадыкёй и величие Айя-Софии. Идеальный тур на 3 дня.",
        images: ["images/dracon.jpg"],
        category: categoryFour._id,
        baseAdvantages: ["Отель в центре города", "Карта для транспорта в подарок"],
        isPublished: false,
      },
      {
        title: "Мальдивы: Резорт Adaaran Select",
        description: "Уединенные виллы над водой, кристально чистая лагуна и дайвинг среди коралловых рифов.",
        images: ["images/dracon.jpg", "images/dracon.jpg"],
        category: categoryFour._id,
        baseAdvantages: ["Всё включено", "Собственный риф", "Скидка на SPA 20%"],
        isPublished: true,
      }
    ]);

    if (!tour1 || !tour2 || !tour3 || !tour4 || !tour5) {
      console.log("что пошло не так с турами");
      return;
    }

    const [ts1, ts2, ts3, ts4, ts5] = await TourSet.create([
      {
        tourId: tour1._id,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-12'),
        price: 150000,
        hotelName: "Ayana Resort & Spa",
        hotelLocation: "Джимбаран, Бали",
        airline: "Turkish Airlines",
        flightDetails: "Рейс TK-1234, пересадка в Стамбуле",
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
        hotelName: "Steigenberger Al Dau Beach",
        hotelLocation: "Хургада, Египет",
        airline: "EgyptAir",
        flightDetails: "Прямой чартер",
        totalSeats: 25,
        bookedSeats: 20,
        status: 'OPEN',
      },
      {
        tourId: tour3._id,
        startDate: new Date('2024-08-05'),
        endDate: new Date('2024-08-15'),
        price: 60000,
        hotelName: "Горный Приют 11",
        hotelLocation: "Склон Эльбруса, 4200м",
        airline: "Aeroflot",
        flightDetails: "Рейс SU-1150 до Минвод",
        totalSeats: 10,
        bookedSeats: 10,
        status: 'CLOSED',
      },
      {
        tourId: tour4._id,
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-04'),
        price: 45000,
        hotelName: "Legacy Ottoman Hotel",
        hotelLocation: "Сиркеджи, Стамбул",
        status: 'FINISHED',
        totalSeats: 20,
        bookedSeats: 18,
      },
      {
        tourId: tour5._id,
        startDate: new Date('2024-09-20'),
        endDate: new Date('2024-09-30'),
        price: 250000,
        hotelName: "Soneva Fushi",
        hotelLocation: "Атолл Баа, Мальдивы",
        airline: "Qatar Airways",
        flightDetails: "Рейс QR-342 через Доху",
        totalSeats: 8,
        bookedSeats: 2,
        status: 'OPEN',
      }
    ]);

    if (!ts1 || !ts2 || !ts3 || !ts4 || !ts5) {
      console.log("что не так пошло с турсетами");
      return;
    }

    await Order.create([
      {
        tourSetId: ts1._id,
        clientName: "Иван Иванов",
        clientPhone: "+996555123456",
        status: "NEW",
        managerId: manager._id,
      },
      {
        tourSetId: ts2._id,
        clientName: "Виталий Тар",
        clientPhone: "79001112233",
        status: "IN_PROGRESS",
        managerId: manager._id,
      },
      {
        tourSetId: ts1._id,
        clientName: "Виктор Петров",
        clientPhone: "+996700123987",
        status: "REJECTED",
        managerId: manager._id,
        rejectionReason: "передумал из-за изменения дат отпуска",
      },
      {
        tourSetId: ts5._id,
        clientName: "Ольга Новикова",
        clientPhone: "+996999000111",
        status: "CONTRACT_PENDING",
        managerId: manager._id,
      },
      {
        tourSetId: ts2._id,
        clientName: "Сергей Васильев",
        clientPhone: "+79112223344",
        status: "COMPLETED",
        managerId: manager._id,
      }
    ]);

    await Review.create([
      {
        clientName: "Анна Петрова",
        tourId: tour1._id,
        rating: 5,
        comment: "Это было незабываемое путешествие! Организация на высшем уровне, отель просто сказочный. Спасибо за такой отдых!",
        image: "images/dracon.jpg",
        isModerated: true,
      },
      {
        clientName: "Игорь Смирнов",
        tourId: tour2._id,
        rating: 4,
        comment: "В целом всё понравилось, пирамиды впечатляют. Единственный минус — долгий трансфер из аэропорта.",
        image: null,
        isModerated: true,
      },
      {
        clientName: "Елена Соколова",
        tourId: tour3._id,
        rating: 5,
        comment: "Тяжело, но оно того стоило! Виды с вершины открываются потрясающие. Гиды — настоящие профи.",
        image: "images/dracon.jpg",
        isModerated: true,
      },
      {
        clientName: "Максим Волков",
        tourId: tour4._id,
        rating: 3,
        comment: "Город красивый, но в отеле было шумновато. В следующий раз выберу другой район.",
        image: null,
        isModerated: false,
      },
      {
        clientName: "Светлана Морозова",
        tourId: tour5._id,
        rating: 5,
        comment: "Рай на земле! Тишина, спокойствие и бирюзовая вода. Обязательно вернусь еще раз.",
        image: "images/dracon.jpg",
        isModerated: true,
      }
    ]);


    console.log('Fixtures created successfully!');
  } finally {
    await db.close();
  }


};

run().catch(console.error);
