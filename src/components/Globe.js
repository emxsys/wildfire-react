import React, {Component} from 'react';
import WorldWind from '@nasaworldwind/worldwind';
import PropTypes from 'prop-types';
import './Globe.css';

export default class Globe extends Component {

    constructor(props) {
        super(props);
        this.wwd = null;
        this.nextLayerId = 1;
    }

    redraw() {
        this.wwd.redraw();
    }

    initializeLayers() {
        // Define the layers to be added to the globe.
        let layerConfig = [
            {layer: new WorldWind.BMNGOneImageLayer(),
                options: {category: "background", enabled: true, minActiveAltitude: 0}}, // override the default value of 3e6;
            {layer: new WorldWind.BMNGLayer(),
                options: {category: "base", enabled: true}},
            {layer: new WorldWind.BMNGLandsatLayer(),
                options: {category: "base", enabled: false}},
            {layer: new WorldWind.BingAerialLayer(),
                options: {category: "base", enabled: false}},
            {layer: new WorldWind.BingAerialWithLabelsLayer(),
                options: {category: "base", enabled: false}},
            {layer: new WorldWind.BingRoadsLayer(),
                options: {category: "overlay", enabled: false, opacity: 0.8}},
            {layer: new WorldWind.ShowTessellationLayer(),
                options: {category: "setting", enabled: false}},
            {layer: new WorldWind.CompassLayer(),
                options: {category: "setting", enabled: false}},
            {layer: new WorldWind.CoordinatesDisplayLayer(this.wwd),
                options: {category: "setting", enabled: true}},
            {layer: new WorldWind.ViewControlsLayer(this.wwd),
                options: {category: "setting", enabled: true}},
            {layer: new WorldWind.StarFieldLayer(),
                options: {category: "setting", enabled: false}},
            {layer: new WorldWind.AtmosphereLayer(),
                options: {category: "setting", enabled: false}}
        ];

        // Add the layers to the globe
        layerConfig.forEach(config => this.addLayer(config.layer, config.options));
    }

    addLayer(layer, options) {
        // Copy all properties defined on the options object to the layer
        if (options) {
            for (let prop in options) {
                if (!options.hasOwnProperty(prop)) {
                    continue; // skip inherited props
                }
                layer[prop] = options[prop];
            }
        }
        // Assign a category property for layer management 
        if (typeof layer.category === 'undefined') {
            layer.category = 'overlay'; // the default category
        }

        // Assign a unique layer ID to ease layer management 
        layer.uniqueId = this.nextLayerId++;
        // Add the layer to the globe
        this.wwd.addLayer(layer);
        // Publish the changes
        this.publishUpdate(layer.category);
    }

    toggleLayer(layer) {
        // Rule: only one "base" layer can be enabled at a time
        if (layer.category === 'base') {
            this.wwd.layers.forEach(function (item) {
                if (item.category === 'base' && item !== layer) {
                    item.enabled = false;
                }
            })
        }
        // Toggle the selected layer's visibility
        layer.enabled = !layer.enabled;
        // Trigger a redraw so the globe shows the new layer state ASAP
        this.wwd.redraw();
        this.publishUpdate(layer.category);
    }

    getLayers(category) {
        if (this.wwd) {
            return this.wwd.layers.filter(layer => layer.category === category);
        } else {
            return [];
        }
    }

    publishUpdate(category) {
        // Lift-up the layer category state to the parent via a props function
        const timestamp = new Date();
        switch (category) {
            case 'base':
                this.props.onUpdate({baseLayers: {layers: this.getLayers('base'), lastUpdated: timestamp}});
                break;
            case 'overlay':
                this.props.onUpdate({overlayLayers: {layers: this.getLayers('overlay'), lastUpdated: timestamp}});
                break;
            case 'setting':
                this.props.onUpdate({settingLayers: {layers: this.getLayers('setting'), lastUpdated: timestamp}});
                break;
            default:
        }
    }

    shouldComponentUpdate() {
        // WorldWind is not a regular React UI component. It should
        // be loaded once and never be updated again
        return false;
    }

    componentDidMount() {
        // Code to execute when the component is called and mounted.
        // Usual WorldWind boilerplate (creating WorldWindow, 
        // adding layers, etc.) applies here.

        // Create a World Window for the canvas. Note passing the
        // Canvas id through a React ref.
        this.wwd = new WorldWind.WorldWindow(this.refs.globeCanvas.id);
        this.initializeLayers();
        if (this.props.onMapCreated && typeof this.props.onMapCreated === "function") {
            this.props.onMapCreated(this.wwd);
        }
    }

    render() {
        // JSX code to create canvas for the WorldWindow using a ref attribute
        return(
            <canvas id="globe-canvas" ref="globeCanvas" className="globe-canvas d-block">
                Your browser does not support HTML5 Canvas.
            </canvas>
            );
    }
};

