export function pickNextRobot(idle) {
    if (idle.length === 0)
        return undefined;
    // sort by "how long they've been idle"
    // we approximate with older lastUpdated first, then id
    const sorted = [...idle].sort((a, b) => {
        if (a.lastUpdated !== b.lastUpdated)
            return a.lastUpdated - b.lastUpdated;
        return a.id.localeCompare(b.id);
    });
    return sorted[0];
}
