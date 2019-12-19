import * as React from 'react';
import { Stage, Sprite } from '@inlet/react-pixi';
import './Pixie.css';

interface PixieProps {
}

class Pixie extends React.Component<PixieProps> {

    componentDidMount() {
    }

    render() {
        return (
            <Stage>
                <Sprite image="./objets.png" x={100} y={100} />
            </Stage>
        );
    }
}

export default Pixie;
