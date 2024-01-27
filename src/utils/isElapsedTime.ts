export const isElapsedTime = (time: Date) => {
  const differentFromDate = new Date().getTime() - time.getTime();
  const minutes = Math.floor(differentFromDate / 60000);
  return minutes < 15;
};
