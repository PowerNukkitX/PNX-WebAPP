import MDUI from "../../util/mduiHelper";
import {Component} from "preact";
import {translate} from "../../util/language";
import {useLocation, useRoute} from "preact-iso";

export default class PluginDrawer extends Component<{}, { mduiDrawer }> {

    render() {
        const { route } = useLocation();
        return (
            <div className="mdui-drawer mdui-drawer-close" id="plugin-drawer">
                <ul className="mdui-list" style={{
                    paddingLeft: 0
                }}>
                    <li onClick={() => route("/plugin/hub")} className="mdui-list-item mdui-ripple">
                        <i className="mdui-list-item-avatar mdui-icon material-icons">extension</i>
                        <div className="mdui-list-item-content">{translate("plugin-hub")}</div>
                    </li>
                </ul>
            </div>
        )
    }

    componentDidMount() {
        const drawer = new MDUI.Drawer('#plugin-drawer', {swipe: true});
        this.setState({
            mduiDrawer: drawer
        });
        drawer.open();
    }

    componentWillUnmount() {
        this.state.mduiDrawer.close();
    }
}