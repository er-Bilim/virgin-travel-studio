import axiosApi from "@/lib/axiosApi";
import type { HomepageSettingsFields, HomepageSettingsMutationData } from "@/types/homepageSettings";

const makeHomepageFormData = (data: HomepageSettingsMutationData): FormData => {
  const formData = new FormData();

  if (data.video) {
    formData.append('video', data.video);
  }

  if (data.deleteVideo !== undefined) {
    formData.append('deleteVideo', String(data.deleteVideo));
  }

  if (data.hero) {
    if (data.hero.title !== undefined)
      formData.append('hero[title]', data.hero.title);
    if (data.hero.subtitle !== undefined)
      formData.append('hero[subtitle]', data.hero.subtitle);
    if (data.hero.videoUrl !== undefined)
      formData.append('hero[videoUrl]', data.hero.videoUrl);
  }

  if (data.mainPopularTours) {
    if (data.mainPopularTours.title !== undefined)
      formData.append('mainPopularTours[title]', data.mainPopularTours.title);
    if (data.mainPopularTours.subtitle !== undefined)
      formData.append(
        'mainPopularTours[subtitle]',
        data.mainPopularTours.subtitle,
      );
  }

  if (data.mainLatestNews) {
    if (data.mainLatestNews.title !== undefined)
      formData.append('mainLatestNews[title]', data.mainLatestNews.title);
    if (data.mainLatestNews.subtitle !== undefined)
      formData.append('mainLatestNews[subtitle]', data.mainLatestNews.subtitle);
  }

  if (data.toursPage) {
    if (data.toursPage.badge !== undefined)
      formData.append('toursPage[badge]', data.toursPage.badge);
    if (data.toursPage.title !== undefined)
      formData.append('toursPage[title]', data.toursPage.title);
    if (data.toursPage.subtitle !== undefined)
      formData.append('toursPage[subtitle]', data.toursPage.subtitle);
  }

  if (data.newsPage) {
    if (data.newsPage.badge !== undefined)
      formData.append('newsPage[badge]', data.newsPage.badge);
    if (data.newsPage.title !== undefined)
      formData.append('newsPage[title]', data.newsPage.title);
    if (data.newsPage.subtitle !== undefined)
      formData.append('newsPage[subtitle]', data.newsPage.subtitle);
  }

if (data.advantages && Array.isArray(data.advantages)) {
  data.advantages.forEach((advantage, index) => {
    if (advantage._id) {
      formData.append(`advantages[${index}][_id]`, advantage._id);
    }

    if (advantage.title !== undefined) {
      formData.append(`advantages[${index}][title]`, advantage.title);
    }
    if (advantage.body !== undefined) {
      formData.append(`advantages[${index}][body]`, advantage.body);
    }

    if (advantage.image instanceof File) {
      formData.append(`advantages[${index}][file]`, advantage.image);
    } else if (advantage.image === null || advantage.image === undefined) {
      formData.append(`advantages[${index}][imageString]`, '');
    } else if (typeof advantage.image === 'string') {
      formData.append(`advantages[${index}][imageString]`, advantage.image);
    }
  });
}

  return formData;
};

export const fetchHomepageSettings = async () => {
  const result = await axiosApi.get<HomepageSettingsFields>('/homepage-settings');
  return result.data;
};

export const createHomepageSettings = async (data: HomepageSettingsMutationData) => {
  const formData = makeHomepageFormData(data);
  const result = await axiosApi.post<HomepageSettingsFields>('/homepage-settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return result.data;
};

export const editHomepageSettings = async (data: HomepageSettingsMutationData) => {
  const formData = makeHomepageFormData(data);

  const result = await axiosApi.put<{ message: string; settings: HomepageSettingsFields }>(
    '/homepage-settings',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return result.data.settings;
};