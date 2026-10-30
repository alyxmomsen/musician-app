export function targetsEqual<T extends { type: string }>(a: T, b: T): boolean {
    if (a.type !== b.type) return false;
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (
            (a as Record<string, unknown>)[key] !==
            (b as Record<string, unknown>)[key]
        ) {
            return false;
        }
    }
    return true;
}
