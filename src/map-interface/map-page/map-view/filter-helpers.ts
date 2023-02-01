import { FilterData } from "~/map-interface/app-state/handlers/filters";
import { SETTINGS } from "../../Settings";

export function getExpressionForFilters(
  filters: FilterData[]
): mapboxgl.Expression {
  // Separate time filters and other filters for different rules
  // i.e. time filters are <interval> OR <interval> and all others are AND
  // Keep track of name: index values of time filters for easier removing
  let expr: mapboxgl.Expression = ["all", ["!=", "color", ""]];

  const timeFilters = filters
    .filter((f) => f.type === "intervals")
    .map(buildFilterExpression);
  if (timeFilters.length > 0) {
    expr.push(["any", ...timeFilters]);
  }

  const otherFilters = filters
    .filter((f) => f.type !== "intervals")
    .map(buildFilterExpression);
  if (otherFilters.length > 0) {
    expr.push(["any", ...otherFilters]);
  }
  return expr;
}

function buildFilterClasses(
  type: string,
  name: string | number
): mapboxgl.Expression {
  /* This function implements filtering over numbered classes.
   It is used to provide filtering over the complex structure created for
   MVT tiles of the 'carto' style. */
  let filter: mapboxgl.Expression = ["any"];
  for (let i = 1; i < 14; i++) {
    filter.push(["==", `${type}${i}`, name]);
  }
  return filter;
}

function buildFilterExpression(filter: FilterData): mapboxgl.Expression {
  // Check which kind of filter it is
  switch (filter.type) {
    case "intervals":
      // These should be added to the timeFilters array
      // Everything else goes in normal filters
      return [
        "all",
        [">", "best_age_bottom", filter.t_age],
        ["<", "best_age_top", filter.b_age],
      ];
    case "lithology_classes":
      return buildFilterClasses("lith_class", filter.name ?? filter.id);
    case "lithology_types":
      return buildFilterClasses("lith_type", filter.name ?? filter.id);
    case "lithologies":
    case "all_lithologies":
    case "all_lithology_types":
    case "all_lithology_classes":
      return ["in", "legend_id", ...filter.legend_ids];
    case "strat_name_orphans":
    case "strat_name_concepts":
      return ["in", "legend_id", ...filter.legend_ids];
  }
}

function PBDBHelper(map, bounds, zoom, maxClusterZoom = 7): void {
  // One for time, one for everything else because
  // time filters require a separate request for each filter
  let timeQuery = [];
  let queryString = [];

  if (map.timeFilters.length) {
    map.timeFilters.forEach((f) => {
      timeQuery.push(`max_ma=${f[2][2]}`, `min_ma=${f[1][2]}`);
    });
  }
  // lith filters broken on pbdb (500 error returned)
  // if (map.lithFilters.length) {
  //   let filters = map.lithFilters.filter((f) => f != "sedimentary");
  //   if (filters.length) {
  //     queryString.push(`lithology=${filters.join(",")}`);
  //   }
  // }
  if (map.stratNameFilters.length) {
    queryString.push(`strat=${map.stratNameFilters.join(",")}`);
  }

  // Define the pbdb cluster level
  let level = zoom < 3 ? "&level=2" : "&level=3";

  let urls = [];
  // Make sure lngs are between -180 and 180
  const lngMin = bounds._sw.lng < -180 ? -180 : bounds._sw.lng;
  const lngMax = bounds._ne.lng > 180 ? 180 : bounds._ne.lng;
  // If more than one time filter is present, multiple requests are needed

  /* Currently there is a limitation in the globe for the getBounds function that
  resolves incorrect latitude ranges for low zoom levels.
  - https://docs.mapbox.com/mapbox-gl-js/guides/globe/#limitations-of-globe
  - https://github.com/mapbox/mapbox-gl-js/issues/11795
  -   https://github.com/UW-Macrostrat/web/issues/68

  This is a workaround for that issue.
  */
  let latMin = bounds._sw.lat;
  let latMax = bounds._ne.lat;

  if (zoom < 5) {
    latMin = Math.max(Math.min(latMin, latMin * 5), -85);
    latMax = Math.min(Math.max(latMax, latMax * 5), 85);
  }

  if (map.timeFilters.length && map.timeFilters.length > 1) {
    urls = map.timeFilters.map((f) => {
      let url = `${SETTINGS.pbdbDomain}/data1.2/colls/${
        zoom < maxClusterZoom ? "summary" : "list"
      }.json?lngmin=${lngMin}&lngmax=${lngMax}&latmin=${latMin}&latmax=${latMax}&max_ma=${
        f[2][2]
      }&min_ma=${f[1][2]}${zoom < maxClusterZoom ? level : ""}`;
      if (queryString.length) {
        url += `&${queryString.join("&")}`;
      }
      return url;
    });
  } else {
    let url = `${SETTINGS.pbdbDomain}/data1.2/colls/${
      zoom < maxClusterZoom ? "summary" : "list"
    }.json?lngmin=${lngMin}&lngmax=${lngMax}&latmin=${latMin}&latmax=${latMax}${
      zoom < maxClusterZoom ? level : ""
    }`;
    if (timeQuery.length) {
      url += `&${timeQuery.join("&")}`;
    }
    if (queryString.length) {
      url += `&${queryString.join("&")}`;
    }
    urls = [url];
  }

  // Fetch the data
  Promise.all(
    urls.map((url) => fetch(url).then((response) => response.json()))
  ).then((responses) => {
    // Ignore data that comes with warnings, as it means nothing was
    // found under most conditions
    let data = responses
      .filter((res) => {
        if (!res.warnings) return res;
      })
      .map((res) => res.records)
      .reduce((a, b) => {
        return [...a, ...b];
      }, []);

    map.pbdbPoints = {
      type: "FeatureCollection",
      features: data.map((f, i) => {
        return {
          type: "Feature",
          properties: f,
          id: i,
          geometry: {
            type: "Point",
            coordinates: [f.lng, f.lat],
          },
        };
      }),
    };
    // Show or hide the proper PBDB layers
    if (zoom < maxClusterZoom) {
      map.map.getSource("pbdb-clusters").setData(map.pbdbPoints);
      map.map.setLayoutProperty("pbdb-clusters", "visibility", "visible");
      map.map.setLayoutProperty("pbdb-points-clustered", "visibility", "none");
      //  map.map.setLayoutProperty('pbdb-point-cluster-count', 'visibility', 'none')
      map.map.setLayoutProperty("pbdb-points", "visibility", "none");
    } else {
      map.map.getSource("pbdb-points").setData(map.pbdbPoints);

      //map.map.getSource("pbdb-clusters").setData(map.pbdbPoints);
      map.map.setLayoutProperty("pbdb-clusters", "visibility", "none");
      map.map.setLayoutProperty(
        "pbdb-points-clustered",
        "visibility",
        "visible"
      );
      //    map.map.setLayoutProperty('pbdb-point-cluster-count', 'visibility', 'visible')
      // map.map.setLayoutProperty("pbdb-points", "visibility", "visible");
    }
  });
}

export { PBDBHelper };
