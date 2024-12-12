export function numberToTimeString(number) {
  const hours = parseInt(number / 60);
  const hoursToString = hours < 10 ? `0${hours}` : `${hours}`;

  const minutes = number - hours * 60;
  const minutesToString = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hoursToString}:${minutesToString}`;
}

export function timeStringToNumber(timeString) {
  if (timeString) {
    const time = timeString.split(":");
    const hours = Number(time[0]);
    const minutes = Number(time[1]);

    return Number(hours * 60 + minutes);
  }

  return undefined;
}
