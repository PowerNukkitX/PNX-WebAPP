import {useLocation} from 'preact-iso';
import {HeadBarLogo} from "./logo"
import {translate} from "../util/language";
import {switchTheme} from "../util/theme";
import {Component, createRef, RefObject} from "preact";
import MDUI from "../util/mduiHelper";

export default class HeadBar extends Component {
    private readonly toolbarRef: RefObject<HTMLDivElement> = createRef();

    private readonly windowSizeListener = () => this.resizeUpdate();

    constructor() {
        super();
        this.state = {
            width: 0,
            needsMutation: false
        }
    }

    private pageInfos = [
        {
            href: "/plugin",
            icon: "extension"
        },
        {
            href: "/about",
            icon: "supervisor_account"
        }
    ]

    private buttonFragments = [];
    private listMenuFragments = [];

    /**
     * 自适应工具栏，屏幕过窄的时候将响应式将按钮收入···中
     */
    renderButtonFragments() {
        let width = this.toolbarRef.current.clientWidth;
        for (const eachEle of this.toolbarRef.current.children) {
            if (eachEle.classList.contains("mdui-toolbar-spacer") || eachEle.classList.contains("mdui-btn")) continue;
            width -= eachEle.clientWidth;
        }
        const itemCount = Math.min((width - 12) / 48, this.pageInfos.length);
        const oldItemCount = Math.min((this.state['width'] - 12) / 48, this.pageInfos.length);
        this.setState({
            width: width
        });
        if (Math.floor(itemCount) === Math.floor(oldItemCount)) {
            this.setState({
                needsMutation: false
            })
            return;
        } else {
            this.buttonFragments = [];
            this.listMenuFragments = [];
        }
        for (let i = 0; i < itemCount; ++i) {
            const infoEntry = this.pageInfos[i];
            this.buttonFragments.push(<a href={infoEntry.href} className="mdui-btn mdui-btn-icon"
                                         mdui-tooltip={`{content: '${translate("route:" + infoEntry.href)}'}`}>
                <i className="mdui-icon material-icons">{infoEntry.icon}</i>
            </a>);
        }
        for (let i = Math.max(0, Math.floor(itemCount) + 1); i < this.pageInfos.length; ++i) {
            const infoEntry = this.pageInfos[i];
            this.listMenuFragments.push(<li className="mdui-menu-item">
                <a className="mdui-ripple" href={infoEntry.href}>
                    <i className="mdui-menu-item-icon mdui-icon material-icons">{infoEntry.icon}</i>
                    <span>{translate("route:" + infoEntry.href)}</span>
                </a>
            </li>);
        }
        this.setState({
            needsMutation: true
        })
    }

    resizeUpdate() {
        this.renderButtonFragments();
    }

    componentDidMount() {
        this.setState({
            width: this.toolbarRef.current.clientWidth
        })
        this.renderButtonFragments();
        window.addEventListener('resize', this.windowSizeListener);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowSizeListener);
    }

    render() {
        const url = useLocation().url;
        return (
            <header className="appbar mdui-appbar mdui-appbar-fixed">
                <div className="mdui-appbar mdui-color-theme">
                    <div className="mdui-container">
                        <div className="mdui-toolbar" id="app-toolbar" ref={this.toolbarRef}>
                            <HeadBarLogo></HeadBarLogo>
                            <span className="mdui-typo-title"> {translate("route:" + url)} </span>
                            <div className="mdui-toolbar-spacer"></div>
                            {this.buttonFragments}
                            <a href="javascript:" className="mdui-btn mdui-btn-icon" mdui-menu="{target: '#more-menu'}"
                               mdui-tooltip={`{content: '${translate("route:/more")}'}`}>
                                <i className="mdui-icon material-icons">more_vert</i>
                            </a>
                            <ul className="mdui-menu" id="more-menu">
                                <li className="mdui-menu-item">
                                    <a className="mdui-ripple" onClick={() => switchTheme(false)}>
                                        <i className="mdui-menu-item-icon mdui-icon material-icons">timelapse</i>
                                        <span>{translate("switch-theme")}</span>
                                    </a>
                                </li>
                                {this.listMenuFragments}
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    componentDidUpdate() {
        if (this.state['needsMutation']) {
            MDUI.mutation("#app-toolbar");
        }
    }
}