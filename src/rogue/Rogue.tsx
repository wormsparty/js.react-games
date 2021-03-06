// @ts-ignore
import * as React from 'react';
// @ts-ignore
import * as FontFaceObserver from 'fontfaceobserver';

import { Labyrinth } from './labyrinth';

import './Rogue.css';

interface RogueProps {
}

class Rogue extends React.Component<RogueProps> {
    private labyrinth: Labyrinth | null = null;

    componentDidMount() {
        document.body.style.overflow = 'hidden';
        const labyrinth = new Labyrinth();
        this.labyrinth = labyrinth;
        this.labyrinth.resize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', this.onResize);
        window.addEventListener('keydown', this.onKeydown);

        const font = new FontFaceObserver('Inconsolata');

        font.load().then(() => {
            labyrinth.draw();
        });
    }

    doUpdate = () => {
        if (this.labyrinth == null) {
            return;
        }

        this.labyrinth.doUpdate();
        this.labyrinth.draw();
    };

    onResize = () => {
        if (this.labyrinth == null) {
            return;
        }

        this.labyrinth.resize(window.innerWidth, window.innerHeight);
    };

    onKeydown = (event: KeyboardEvent) => {
        if (this.labyrinth == null) {
            return;
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

export default Rogue;
