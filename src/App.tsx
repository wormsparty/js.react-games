import React, {CSSProperties} from 'react';
import './App.css';
import Rogue from "./rogue/Rogue";
import MapEdit from "./map/MapEdit";
import Pixie from "./pixie/Pixie";

interface AppProps {
}

interface AppState {
    view: string
}

const buttonStyle: CSSProperties = {
    position: 'absolute',
    left: 20,
    top: 20,
    fontSize: '30px',
    userSelect: "none",
    cursor: "pointer"
};

export default class App extends React.Component<AppProps, AppState> {
    static defaultProps: AppState = { view: "Pixie" };

    constructor(props: AppProps) {
        super(props);
        this.state = App.defaultProps;
    }

    switchToRogue = () => {
        this.setState({ view: "Rogue" });
    };

    switchToMap = () => {
        this.setState({ view: "MapEdit" });
    };

    switchToPixie = () => {
        this.setState({ view: "Pixie" });
    };

    render() {
        return (
            <div>
                <div style={buttonStyle}>
                    <span role={'img'} aria-label={'Switch to Pixie'} onClick={this.switchToRogue}>
                        🧙‍♂
                    </span>
                    <br/>
                    <span role={'img'} aria-label={'Switch to MapEdit'} onClick={this.switchToMap}>
                        👩‍🎨
                    </span>
                    <br/>
                    <span role={'img'} aria-label={'Switch to Pixie'} onClick={this.switchToPixie}>
                        🧚
                    </span>
                </div>
                {(this.state.view === "Rogue") && <Rogue />}
                {(this.state.view === "MapEdit") && <MapEdit />}
                {(this.state.view === "Pixie") && <Pixie />}
            </div>
        );
    }
}
