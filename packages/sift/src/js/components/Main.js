import React from 'react';
import Stats from './Stats';
import RandomColumn from './RandomColumn';

class Main extends React.Component {

  render() {
    var options = [78, 137, 144, 434, 468, 474, 486, 488, 521, 1472, 1643];
    var randomColID = options[Math.floor(Math.random() * (10 - 1) + 1) + 1]

    return (
      <div className='main'>
        <div className='main-search' style={{backgroundImage: 'url(dist/img/' + randomColID + '.jpg);'}}>
          <div className='main-title'>
            <div className='main-title-container'>
              <h3>SIFT</h3>
              <p className='winnow'>& winnow</p>
              <p className='macrostrat'>MACROSTRAT</p>
            </div>
          </div>
        </div>
        <Stats/>
        <RandomColumn colID={randomColID}/>
      </div>
    );
  }
}

export default Main;
