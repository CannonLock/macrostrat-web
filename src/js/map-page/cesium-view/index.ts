import { useEffect } from 'react'
import "cesiumSource/Widgets/widgets.css"
import * as Cesium from "cesiumSource/Cesium"
import {hyperStyled} from '@macrostrat/hyper'
import styles from "./main.styl"
const h = hyperStyled(styles)
import {useSelector, useDispatch } from 'react-redux'
import NavigationMixin from "@znemz/cesium-navigation"
import "@znemz/cesium-navigation/dist/index.css"
import {
  queryMap
} from '../../actions'

const CesiumView = (props)=>{
  const mapOpts = useSelector(s => s.update)
  const {mapXYZ} = mapOpts

  const dispatchAction = useDispatch()

  useEffect(()=>{
    var geology = new Cesium.WebMapTileServiceImageryProvider({
  		url : 'https://macrostrat.org/api/v2/maps/burwell/emphasized/{TileMatrix}/{TileCol}/{TileRow}/tile.png',
  		style : 'default',
  		format : 'image/png',
  		maximumLevel : 19,
      layer: "",
      tileMatrixSetID: "",
  		credit : new Cesium.Credit('UW-Madison, Macrostrat Lab'),
  	})


    var opts = {
      terrainProvider: Cesium.createWorldTerrain(),
      imageryProvider : Cesium.createWorldImagery({
        style : Cesium.IonWorldImageryStyle.AERIAL
      }),
      baseLayerPicker : false,
      fullscreenButton: false,
      homeButton: false,
      infoBox: false,
      navigationInstructionsInitiallyVisible: false,
      navigationHelpButton: false,
      scene3DOnly: true,
      vrButton: false,
      geocoder: false,
      //skyAtmosphere: true,
      animation: false,
      timeline: false,
      // Makes cesium not render high fps all the time
      requestRenderMode : true,
      // Use full scene buffer (respecting pixel ratio) if this is false
      useBrowserRecommendedResolution: false
    }


    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzODk2OGM4ZS1mMzlkLTRlNjAtYWQxZS1mODU3YWJjMWFhNzQiLCJpZCI6MjYwODYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODcxOTU1MTh9._ILy51LI2aF7Nxvas9RQDkhqOP4Tp92uTYAtvewVvNE';
    var viewer = new Cesium.Viewer('cesiumContainer', opts)
    //viewer.resolutionScale = 2
    //viewer.scene.globe.enableLighting = true
    //viewer.canvas.style.imageRendering = false

    viewer.extend(NavigationMixin, {})

    var geoLayer = viewer.imageryLayers.addImageryProvider(geology);
    geoLayer.alpha = 0.5;

    const clon = parseFloat(mapXYZ.x)
    const clat = parseFloat(mapXYZ.y)
    var extent = Cesium.Cartesian3.fromDegrees(clon, clat, 800000)
    viewer.camera.setView({
        destination : extent,
        orientation: {
            heading : Cesium.Math.toRadians(0), // east, default value is 0.0 (north)
            pitch : Cesium.Math.toRadians(-90),    // default value (looking down)
            roll : 0.0                             // default value
        }
    });

    var clickedPoint = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());

    const addPoint = (x: number, y: number)=>{
      clickedPoint.removeAll()
      clickedPoint.add({
          position : new Cesium.Cartesian3.fromDegrees(x, y),
          color : Cesium.Color.DODGERBLUE,
          outlineColor : Cesium.Color.WHITE,
          outlineWidth : 2
      });
    }

    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  	handler.setInputAction(function(movement) {
  		var cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
  		if (cartesian) {
  			var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  			const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  			const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        console.log(longitude, latitude);
        dispatchAction(queryMap(longitude, latitude, 7, null))
        addPoint(longitude, latitude)
  		}
  	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);



  })
  return h("div.cesium-container#cesiumContainer")
}

export default CesiumView;
