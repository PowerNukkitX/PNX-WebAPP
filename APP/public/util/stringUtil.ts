/**
 *
 * @param str A multiline string
 * @return A string that be left-trimmed with `|` and joined into one line
 * @example {
 *     trimMultiLineString(`Hello
 *      | how are
 *   |you`) === "Hello how are you"
 * };
 */
export function trimMultiLineString(str: string): string {
    const lines = str.split("|");
    let sb = "";
    for (const line of lines) {
        sb += line.trimEnd();
    }
    return sb;
}

export function sizeToString(size: number): string {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
    } else {
        return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }
}