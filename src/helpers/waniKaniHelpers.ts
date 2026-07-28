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