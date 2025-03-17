export const parseDateString = (dateString: string) => {
  return dateString.split("T")[0].split("-").reverse().join("-");
};
