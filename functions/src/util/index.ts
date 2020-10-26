export {externalRequestExecutor} from './externalRequestExecutor';

export const addMonth = (date: Date) => {
  if (date) {
    let m, d = (date = new Date(+date)).getDate();

    date.setMonth(date.getMonth() + 1, 1);
    m = date.getMonth();
    date.setDate(d);
    if (date.getMonth() !== m) date.setDate(0);
  }

  return date;
};
