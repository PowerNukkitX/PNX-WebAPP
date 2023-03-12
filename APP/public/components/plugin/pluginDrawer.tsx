import MDUI from "../../util/mduiHelper";
import { Component } from "preact";
import { translate } from "../../util/language";
import { useLocation } from "preact-iso";
import { getCookie, setCookie } from "../../util/commonUtil";

export default class PluginDrawer extends Component<{}, { mduiDrawer }> {

    render() {
        const { route } = useLocation();
        return (
            <div className="mdui-drawer mdui-drawer-close" id="plugin-drawer">
                <ul className="mdui-list" style={{
                    paddingLeft: 0
                }}>
                    <li onClick={() => route("/hub/plugin/hub")} className="mdui-list-item mdui-ripple">
                        <i className="mdui-list-item-avatar mdui-icon material-icons">extension</i>
                        <div className="mdui-list-item-content">{translate("plugin-hub")}</div>
                    </li>
                </ul>
            </div>
        )
    }

    componentDidMount() {
        const drawer = new MDUI.Drawer('#plugin-drawer', { swipe: true });
        this.setState({
            mduiDrawer: drawer
        });
        // 可通过设置第一次浏览cookie来解决
        // @f_T: first time
        if (getCookie("f_T") === null) {
            if (window.innerWidth > 1024) {
                drawer.open();
            } else if (location.href.endsWith("/hub/plugin/hub") || location.href.endsWith("/hub/plugin")) {
                drawer.open();
            }
            setCookie("f_T", new Date().getTime(), 7);
        } else {
            if (window.innerWidth > 1024) {
                drawer.open();
            }
        }
        drawer.$element.on('close.mdui.drawer', () => {
            if (window.innerWidth <= 1024) {
                MDUI.snackbar({
                    message: translate("plugin-drawer-close"),
                    buttonText: translate("ok")
                })
            }
        })
    }

    componentWillUnmount() {
        this.state.mduiDrawer.close();
    }
}