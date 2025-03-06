#!/usr/bin/env python

import json
import sys
from shapely.geometry import shape, MultiPolygon, Polygon
from polylabel import polylabel

def main():
    if len(sys.argv) != 3:
        print("Usage: python add_visual_center.py input.geojson output.geojson")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    # Read the input GeoJSON file
    with open(input_file, 'r') as f:
        data = json.load(f)

    # Function to extract coordinates
    def extract_coords(geom):
        if isinstance(geom, Polygon):
            exterior = list(geom.exterior.coords)
            interiors = [list(ring.coords) for ring in geom.interiors]
            return [exterior] + interiors
        elif isinstance(geom, MultiPolygon):
            coords = []
            for polygon in geom.geoms:
                coords.extend(extract_coords(polygon))
            return coords

    # Process each feature in the FeatureCollection
    for feature in data['features']:
        geom = shape(feature['geometry'])
        if isinstance(geom, (Polygon, MultiPolygon)):
            # Prepare coordinates for polylabel
            polygons = extract_coords(geom)
            # Calculate the pole of inaccessibility (visual center)
            center = polylabel(polygons, 1e-10)
            # Round the coordinates to 4 decimal places
            lat = round(center[1], 4)
            lng = round(center[0], 4)
            # Add the center coordinates to the feature's properties
            feature['properties']['poly_center_lat'] = lat
            feature['properties']['poly_center_lng'] = lng
        else:
            print(f"Feature ID {feature.get('id', 'unknown')} is not a Polygon or MultiPolygon, skipping.")

    # Write the updated GeoJSON to the output file
    with open(output_file, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Updated GeoJSON has been written to {output_file}")

if __name__ == '__main__':
    main()
