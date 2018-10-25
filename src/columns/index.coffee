import React, {Component} from 'react'

import {Route} from 'react-router'
import {MacrostratColumnManager} from './column-data'
import ColumnIndexMap from './column-map'
import {HoveredColumnLegend} from './legend'
import {SelectionPanel} from './selection-panel'
import './main.styl'

###
# TODO:
# - Cookies for settings
# - Routing for selected sections
###

class ColumnPage extends Component
  render: ->
    <MacrostratColumnManager>
      <div id="column-page">
        <ColumnIndexMap />
        <HoveredColumnLegend />
        <div className="header">
          <h1>Macrostrat <span className="subtitle">Column Explorer</span></h1>
        </div>
        <SelectionPanel />
      </div>
    </MacrostratColumnManager>
  componentDidMount: ->
    # This is a hack to prevent long hash strings from moving
    # over from the geologic map side of the app
    window.location.hash = ""

export default ColumnPage

