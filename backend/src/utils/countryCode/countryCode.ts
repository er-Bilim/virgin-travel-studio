import countries from 'i18n-iso-countries';

const isValidCountry = (code: string): boolean => {
  return countries.isValid(code);
};

export default isValidCountry;