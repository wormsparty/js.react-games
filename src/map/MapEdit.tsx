// @ts-ignore
import * as React from 'react';

import './MapEdit.css';
import {Game} from "./game";

interface MapProps {
}

class MapEdit extends React.Component<MapProps> {
    private game: Game | null = null;

    componentDidMount() {
        document.body.style.overflow = 'hidden';

        window.addEventListener('resize', this.onResize);
        window.addEventListener('keydown', this.onKeydown);
        window.addEventListener('keyup', this.onKeyup);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);

        const game = new Game(true);
        this.game = game;
        this.game.resize(window.innerWidth, window.innerHeight);
        game.loop();
    }

    onResize = () => {
        if (this.game == null) {
            return;
        }

        this.game.resize(window.innerWidth, window.innerHeight);
    };

    onKeydown = (event: KeyboardEvent) => {
        if (this.game == null) {
            return;
        }

        if (this.game.pressed.has(event.key)) {
            this.game.pressed.set(event.key, {pressed: true, prevPressed: this.game.pressed.get(event.key)!.pressed});
        }
    };

    onKeyup = (event: KeyboardEvent) => {
        if (this.game == null) {
            return;
        }

        if (this.game.pressed.has(event.key)) {
            this.game.pressed.set(event.key, {pressed: false, prevPressed: this.game.pressed.get(event.key)!.pressed});
        }
    };

    onMouseMove = (event: MouseEvent) => {
        if (this.game == null) {
            return;
        }

        this.game.setMousePos(event.pageX, event.pageY);
    };

    onMouseDown = (event: MouseEvent) => {
        if (this.game == null) {
            return;
        }

        this.game.mouseDown(event.pageX, event.pageY);
    };

    onMouseUp = (event: MouseEvent) => {
        if (this.game == null) {
            return;
        }

        this.game.mouseUp();
    };

    render() {
        return (
            <div id='canvasContainer'>
                <canvas id='canvas'>
                    Your browser doesn't seem to support HTML5. Please upgrade your browser.
                </canvas>
            </div>
        );
    }
}

export default MapEdit;
