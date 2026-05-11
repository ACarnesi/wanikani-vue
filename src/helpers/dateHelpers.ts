export function getWeekday(date: Date): string
{
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const formatter = new Intl.DateTimeFormat('en-US', options);

    return formatter.format(date);
}
