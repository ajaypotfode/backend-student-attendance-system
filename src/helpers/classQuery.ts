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