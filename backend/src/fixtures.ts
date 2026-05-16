import mongoose from 'mongoose';
import config from './config.js';
import User from './model/user/User.js';
import Category from './model/category/Category.js';
import News from "./model/New/News.js";
import Tour from "./model/tour/Tour.js";

const run = async () => {
  await mongoose.connect(config.db);
  const db = mongoose.connection;

  const collections = ['users', 'categories', 'news', 'tours'];

  for (const collectionName of collections) {
    try {
      await db.dropCollection(collectionName);
    } catch (e) {
      console.log(`Коллекция ${collectionName} отсутствовала, пропускаем...`);
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

  const [news1, news2, news3, news4, news5] = await News.create([
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

  console.log('Fixtures created successfully!');
  await db.close();
};

run().catch(console.error);
