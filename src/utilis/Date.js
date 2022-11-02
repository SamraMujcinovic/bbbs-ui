export function dateToString(date) {
  const selectedDate = new Date(date);
  const day =
    selectedDate.getDate() < 10
      ? `0${selectedDate.getDate()}`
      : selectedDate.getDate();
  const month =
    selectedDate.getMonth() + 1 < 10
      ? `0${selectedDate.getMonth() + 1}`
      : selectedDate.getMonth() + 1;

  return `${day}.${month}.${selectedDate.getFullYear()}`;
}

export function stringToDate(string) {
  const dateList = string.split(".");
  const day = Number(dateList[0]);
  const month = Number(dateList[1]) - 1; // month starts from 0
  const year = Number(dateList[2]);

  return new Date(year, month, day);
}

export const days = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
export const months = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "August",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

// TODO:
// testirati kako sada ovaj date radi sa dodavanjem
// uraditi time picker ovako kao ovaj date
// i one godine sto sam ja stavila kao dropdown promijeniti da budu isti ovaj date picker samo za godine!
// uraditi validacije na ostalim poljima
