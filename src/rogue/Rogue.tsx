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

    constructor(props: Readonly<RogueProps>) {
        super(props);
        document.body.style.overflow = 'hidden';
    }

    doUpdate = () => {
        if (this.labyrinth == null) {
            return;
        }

        this.labyrinth.do_update();
        this.labyrinth.draw();

        for (const [key] of this.labyrinth.pressed) {
            this.labyrinth.pressed.set(key, false);
        }
    }

    onResize = () => {
        if (this.labyrinth == null) {
            return;
        }

        this.labyrinth.resize(window.innerWidth, window.innerHeight);
    }

    onKeydown = (event: KeyboardEvent) => {
        if (this.labyrinth == null) {
            return;
        }

        let update = false;

        if (this.labyrinth.pressed.has(event.key)) {
            this.labyrinth.pressed.set(event.key, true);
            update = true;
        } else {
            if (event.key === 'ArrowLeft') {
                this.labyrinth.pressed.set('4', true);
                update = true;
            } else if (event.key === 'ArrowRight') {
                this.labyrinth.pressed.set('6', true);
                update = true;
            } else if (event.key === 'ArrowUp') {
                this.labyrinth.pressed.set('8', true);
                update = true;
            } else if (event.key === 'ArrowDown') {
                this.labyrinth.pressed.set('2', true);
                update = true;
            } else if (event.key === 'Enter') {
                this.labyrinth.pressed.set('5', true);
                update = true;
            }
        }

        if (update) {
            this.doUpdate();
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
