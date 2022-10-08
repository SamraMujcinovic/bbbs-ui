export function numberToTimeString(number) {
  const hours = parseInt(number);
  const hoursToString = hours < 10 ? `0${hours}` : `${hours}`;

  const minutes = Math.round((number - hours) * 60);
  const minutesToString = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hoursToString}:${minutesToString}`;
}

export function timeStringToNumber(timeString) {
  const time = timeString.split(":");
  const hours = Number(time[0]);
  const minutes = Number(time[1]);

  return (hours * 60 + minutes) / 60;
}
