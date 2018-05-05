import React from 'react';
import ReactDOM from 'react-dom';
import WorldWind from '@nasaworldwind/worldwind';

import App from './App';
import './index.css';

// Initialize WorldWind URL for library resources
WorldWind.configuration.baseUrl = 'https://files.worldwind.arc.nasa.gov/artifactory/web/0.9.0/';

// Render the App into the #root element
ReactDOM.render(<App />, document.getElementById('root'));
