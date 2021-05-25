export const createId = () => {
  const str = Math.random().toString(36).substr(2);
  return str.substr(0, 10);
};
export default {
  createId
};
