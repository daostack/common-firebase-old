export { externalRequestExecutor } from './externalRequestExecutor';

export const addMonth = (date: Date): Date => {
  if (date) {
    const d = (date = new Date(Number(date))).getDate();

    date.setMonth(date.getMonth() + 1, 1);
    const m = date.getMonth();

    date.setDate(d);

    if (date.getMonth() !== m)
      date.setDate(0);
  }

  return date;
};