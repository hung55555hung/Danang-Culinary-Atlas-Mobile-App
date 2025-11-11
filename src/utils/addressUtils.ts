export const getAddressBeforeCity = (
  address: string,
  city: string = 'Đà Nẵng',
): string => {
  if (!address) return '';

  const index = address.indexOf(city);
  return index !== -1
    ? address.slice(0, index + city.length).trim()
    : address.trim();
};
