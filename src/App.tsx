import React from 'react';
import './App.css';
import Rogue from "./rogue/Rogue";
import MapEdit from "./map/MapEdit";

interface AppProps {
    view: string
}

export default class App extends React.Component<AppProps, AppProps> {
    static defaultProps: AppProps = { view: "Rogue" };

    constructor(props: AppProps) {
        super(props);
        this.state = App.defaultProps;
    }

    render() {
        return (
            <div>
                {(this.state.view === "Rogue") && <Rogue />}
                {(this.state.view === "MapEdit") && <MapEdit />}
            </div>
        );
    }
}
