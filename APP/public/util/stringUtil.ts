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