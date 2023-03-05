import {translate} from "../../util/language";

export default function About() {
    return (
        <section class={`mdui-container`}>
            <h1>{translate("about-us")}</h1>
            <p>{translate("pnx-team")}</p>
        </section>
    )
};
