export function sortBySubjectId(ascending: boolean)
{
    return function (a: WaniKani.SubjectAssignmentPair, b: WaniKani.SubjectAssignmentPair)
    {
        let aVal = a.subject?.data.lessonPosition ?? null;
        let bVal = b.subject?.data.lessonPosition ?? null;

        if (aVal === bVal)
        {
            return 0;
        }

        // nulls sort after anything else
        if (aVal === null)
        {
            return 1;
        }
        if (bVal === null)
        {
            return -1;
        }

        if (a.assignment?.data.startedAt != null && b.assignment?.data.startedAt == null)
        {
            return -1;
        }
        else if (a.assignment?.data.startedAt == null && b.assignment?.data.startedAt != null)
        {
            return 1;
        }

        // otherwise, if we're ascending, lowest sorts first
        if (ascending)
        {
            return aVal < bVal ? -1 : 1;
        }

        // if descending, highest sorts first
        return aVal < bVal ? 1 : -1;
    }
}

export function getVisibleReadings(subject: WaniKani.Kanji | WaniKani.Vocabulary) 
{
    return subject.readings.filter(x => x.acceptedAnswer).map(x => x.reading);
}

export function getVisibleMeanings(subject: WaniKani.Subject)
{
    return subject.meanings.filter(x => x.acceptedAnswer).map(x => x.meaning)
        .concat(subject.auxiliaryMeanings.filter(y => y.type === 'whitelist').map(y => y.meaning));
}

export function getBlockedMeanings(subject: WaniKani.Subject)
{
    return subject.auxiliaryMeanings.filter(x => x.type === 'blacklist').map(x => x.meaning);
}