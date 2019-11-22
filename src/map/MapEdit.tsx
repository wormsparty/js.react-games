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

        document.addEventListener("dragover", function( event ) {
            event.preventDefault();
        }, false);

        document.addEventListener("drop", this.onDrop, false);

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

        this.game.setMousePos(event.pageX, event.pageY, event.which);
    };

    onMouseDown = (event: MouseEvent) => {
        if (this.game == null) {
            return;
        }

        this.game.mouseDown(event.pageX, event.pageY, event.which);
    };

    onMouseUp = (event: MouseEvent) => {
        if (this.game == null) {
            return;
        }

        this.game.mouseUp();
    };

    onDrop = (event: DragEvent) => {
        event.preventDefault();

        if (event.dataTransfer !== null && event.dataTransfer.items) {
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    const file = event.dataTransfer.items[i].getAsFile()!;
                    console.log('Importing ' + file.name + '...');

                    const reader = new FileReader();

                    reader.onload = (e) => {
                        if (this.game == null) {
                            return;
                        }

                        if (typeof e.target!.result === 'string') {
                            this.game.import(e.target!.result!);
                        }
                    };

                    reader.readAsText(file);
                }
            }
        }
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
