export function requestObjectToQuery(requestObject: Record<string, any>,
    datesToIsoString: boolean = true): string
{
    let returnString = '?';

    for (const key in requestObject)
    {
        if (requestObject[key] !== undefined && requestObject[key] !== null) 
        {
            let value = requestObject[key];
            if (datesToIsoString && value instanceof Date)
            {
                value = value.toISOString();
            }
            returnString += `${encodeURIComponent(toSnakeCase(key))}=${encodeURIComponent(value)}&`;
        }
    }

    return returnString.slice(0, -1);
}

export function toSnakeCase(str: string): string
{
    return str.replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`);
}