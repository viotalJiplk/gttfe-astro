export function isIterable(variable: any) {
    return variable != null && typeof variable[Symbol.iterator] === 'function';
}