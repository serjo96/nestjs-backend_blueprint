import dayjs from 'dayjs';

export const isElapsedTime = (time: Date) => {
  // Get the current time and the time passed to the function using dayjs
  const now = dayjs();
  const passedTime = dayjs(time);

  // Calculate the difference in minutes between the current time and the transmitted time
  const differenceInMinutes = now.diff(passedTime, 'minute');

  // Check that less than 15 minutes have passed
  return differenceInMinutes < 15;
};
