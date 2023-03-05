import {LocationProvider, Router, Route, ErrorBoundary, hydrate} from 'preact-iso';
import Home from './pages/home';
import NotFound from './pages/_404';
import About from "./pages/about";
import HeadBar from './components/headbar';

export function App() {
    return (
        <LocationProvider>
            <HeadBar/>
            <div class="app mdui-typo">
                <ErrorBoundary>
                    <Router>
                        <Route path="/" component={Home}/>
                        <Route path="/about" component={About}/>
                        <Route default component={NotFound}/>
                    </Router>
                </ErrorBoundary>
            </div>
        </LocationProvider>
    );
}

hydrate(<App/>);