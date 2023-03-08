import {LocationProvider, Router, Route, ErrorBoundary, hydrate} from 'preact-iso';
import Home from './pages/home';
import NotFound from './pages/_404';
import About from "./pages/about";
import HeadBar from './components/headbar';
import PluginHub from "./pages/plugin";

export function App() {
    return (
        <LocationProvider>
            <HeadBar/>
            <div class="app mdui-typo">
                <ErrorBoundary>
                    <Router>
                        <Route path="/" component={Home}/>
                        <Route path="/hub" component={Home}/>
                        <Route path="/hub/about" component={About}/>
                        <Route path="/hub/plugin" component={PluginHub}/>
                        <Route path="/hub/plugin/*" component={PluginHub}/>
                        <Route default component={NotFound}/>
                    </Router>
                </ErrorBoundary>
            </div>
        </LocationProvider>
    );
}

hydrate(<App/>);
