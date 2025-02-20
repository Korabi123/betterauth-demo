import IPData from 'ipdata';

const ipData = new IPData("e7076cf0d14f5c639f77dfc6b468309401567e934119e3d465bff858");

export const ipToLocation = async (ip: string) => {
  const location = await ipData.lookup(ip);

  return location;
};
