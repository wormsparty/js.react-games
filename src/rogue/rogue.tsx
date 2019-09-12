// @ts-ignore
import * as React from 'react';
// @ts-ignore
import * as FontFaceObserver from 'fontfaceobserver';

import { Labyrinth } from './labyrinth';

import './Rogue.css';

interface RogueProps {
}

class Rogue extends React.Component<RogueProps> {
    private labyrinth: Labyrinth;

    constructor(props: Readonly<RogueProps>) {
        super(props);
        document.body.style.overflow = 'hidden';

        const labyrinth = new Labyrinth();
        this.labyrinth = labyrinth;
        this.labyrinth.resize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', this.onResize);

        setInterval(() => {
            if (labyrinth.persistedData !== undefined && labyrinth.persistedData.isRt) {
                this.doUpdate();
            }
        }, 1000 / labyrinth.fps);

        const font = new FontFaceObserver('Inconsolata');

        font.load().then(() => {
            labyrinth.draw();
        });
    }

    doUpdate() {
        this.labyrinth.do_update();
        this.labyrinth.draw();

        for (const [key] of this.labyrinth.pressed) {
            this.labyrinth.pressed.set(key, false);
        }
    }

    onResize() {
        this.labyrinth.resize(window.innerWidth, window.innerHeight);
    }

    onKeydown(event: React.KeyboardEvent<HTMLDivElement>) {
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

        if (update && (this.labyrinth.persistedData === undefined || !this.labyrinth.persistedData.isRt)) {
            this.doUpdate();
        }
    }

    render() {
        return (
            <div id='canvasContainer' onKeyDown={this.onKeydown}>
                <canvas id='canvas'>
                    Your browser doesn't seem to support HTML5. Please upgrade your browser.
                </canvas>
            </div>
        );
    }
}

export default Rogue;
