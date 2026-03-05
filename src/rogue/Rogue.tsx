import { useEffect, useRef } from 'react';
import FontFaceObserver from 'fontfaceobserver';

import { Labyrinth } from './labyrinth';
import './Rogue.css';

const Rogue = () => {
    const labyrinthRef = useRef<Labyrinth | null>(null);

    const doUpdate = () => {
        const labyrinth = labyrinthRef.current;
        if (labyrinth == null) return;

        labyrinth.do_update();
        labyrinth.draw();

        for (const [key] of labyrinth.pressed) {
            labyrinth.pressed.set(key, false);
        }
    };

    const onResize = () => {
        const labyrinth = labyrinthRef.current;
        if (labyrinth == null) return;

        labyrinth.resize(window.innerWidth, window.innerHeight);
    };

    const onKeydown = (event: KeyboardEvent) => {
        const labyrinth = labyrinthRef.current;
        if (labyrinth == null) return;

        let update = false;

        if (labyrinth.pressed.has(event.key)) {
            labyrinth.pressed.set(event.key, true);
            update = true;
        } else {
            const arrowMap: Record<string, string> = {
                ArrowLeft:  '4',
                ArrowRight: '6',
                ArrowUp:    '8',
                ArrowDown:  '2',
                Enter:      '5',
            };

            const mapped = arrowMap[event.key];
            if (mapped) {
                labyrinth.pressed.set(mapped, true);
                update = true;
            }
        }

        if (update) {
            doUpdate();
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const labyrinth = new Labyrinth();
        labyrinthRef.current = labyrinth;
        labyrinth.resize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', onResize);
        window.addEventListener('keydown', onKeydown);

        const font = new FontFaceObserver('Inconsolata');
        font.load().then(() => {
            labyrinth.draw();
        });

        // Nettoyage au démontage
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('keydown', onKeydown);
            document.body.style.overflow = '';
        };
    }, []); // [] = exécuté une seule fois, équivalent à componentDidMount

    return (
        <div id="canvasContainer">
            <canvas id="canvas">
                Your browser doesn't seem to support HTML5. Please upgrade your browser.
            </canvas>
        </div>
    );
};

export default Rogue;
