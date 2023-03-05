import {translate} from "../util/language";

const NotFound = () => (
    <section class="mdui-text-center">
        <h1>404: Not Found</h1>
        <p>{translate("page-gone")}</p>
    </section>
);

export default NotFound;
