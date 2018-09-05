import React, { Component } from 'react';
import './Game.css';

import Acard from '../Acard/Acard';

export default class Game extends Component {
    render() {
        return (
            <div className='Game-App'>
                <div className="game">

                    <div className="Qcard">
                        {/* Import Q Card Component */}
                    </div>
                    <div className="border"></div>

                    <div className="Acard">
                        <Acard />
                    </div>

                </div>
            </div>
        );
    }
}