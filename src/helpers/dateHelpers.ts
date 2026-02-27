
export const addTowHours = (time: string, hour: number) => {
    const [h, m] = time.split(':');
    const newhour = (Number(h) + hour) % 24;
    return `${String(newhour).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export const reduceTowHours = (time: string, hour: number) => {
    const [h, m] = time.split(':');
    const newhour = (Number(h) - hour + 24) % 24;
    return `${String(newhour).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}