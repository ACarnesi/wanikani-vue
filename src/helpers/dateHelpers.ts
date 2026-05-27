import { isDate } from "@/@types/waniKaniTypeGuards";

export const dateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/;

export function getWeekday(date: Date): string
{
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const formatter = new Intl.DateTimeFormat('en-US', options);

    return formatter.format(date);
}

export function dateReviver(key: string, value: any) 
{
    if (isDate(value)) 
    {
        return new Date(value);
    }

    return value;
};