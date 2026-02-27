import { addTowHours, reduceTowHours } from "./dateHelpers"

export const generatingClassQuery = (trainer: string, time: string, id?: string) => {
    const addedHrs = addTowHours(time, 2);
    const reducedHrs = reduceTowHours(time, 2)
    let query
    if (reducedHrs < addedHrs) {
        query = {
            trainer,
            status: 'active',
            ...(id && { _id: { $ne: id } }),
            time: { $gt: reducedHrs, $lt: addedHrs }

        }
    }
    else {
        // this query is used to handle mid night logic 
        // cause if time get reduce then reducedHrs is Gt addHrs (eg:23:00 > 01:00)
        query = {
            trainer,
            status: 'active',
            ...(id && { _id: { $ne: id } }),
            $or: [
                { time: { $gt: reducedHrs } },
                { time: { $lt: addedHrs } }
            ]
        }
    }

    return query
}