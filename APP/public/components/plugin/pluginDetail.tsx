import {Component, RenderableProps} from "preact";
import RepoDataBean from "../../data/RepoDataBean";

interface Props {
    path: string
}

interface State {
    repoData: RepoDataBean | null | undefined
    renderedReadme: string | null | undefined
}

export default class PluginDetail extends Component<Props, State> {
    get pluginID(): string {
        const path = this.props.path;
        if (path.endsWith("/")) {
            return path.substring(0, path.length - 1);
        }
        return path.substring(8);
    }

    componentDidMount() {

    }

    updateInfo() {
        if (!this.state.repoData) {

        }
    }

    render(props: RenderableProps<Props> | undefined, state: Readonly<any> | undefined) {
        return (
            <>
                <div className="mdui-container">
                    <br/>
                    <div className="mdui-row">
                        <button className="mdui-btn mdui-ripple icon-span-btn" onClick={() => history.back()}>
                            <i className="mdui-icon material-icons">&#xe5c4;</i>
                            <span>返回 {this.pluginID}</span>
                        </button>
                    </div>
                </div>
            </>
        );
    }

}