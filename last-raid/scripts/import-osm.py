"""Convert a downloaded OSM API map extract to compact projected geometry.
Usage: python scripts/import-osm.py source.osm public/map.json
Source https://www.openstreetmap.org/api/0.6/map?bbox=37.779,55.710,37.807,55.727
OSM contributors / ODbL 1.0. No raster tiles or photographs are used.
"""
import xml.etree.ElementTree as E,json,math,sys
r=E.parse(sys.argv[1]).getroot();nodes={n.attrib['id']:n for n in r.findall('node')}
scale=3; xmin=37.779;ymax=55.727
project=lambda n:[round((float(n['lon'])-xmin)*111320*math.cos(math.radians(55.718))*scale,1),round((ymax-float(n['lat']))*111320*scale,1)]
features=[]
for w in r.findall('way'):
 t={x.attrib['k']:x.attrib['v'] for x in w.findall('tag')}
 kind='building' if 'building' in t else t.get('highway','')
 if not kind or t.get('area')=='yes' and kind!='building':continue
 ps=[project(nodes[n.attrib['ref']].attrib) for n in w.findall('nd') if n.attrib['ref'] in nodes]
 if len(ps)<2:continue
 features.append(dict(id=int(w.attrib['id']),kind=kind,name=t.get('name',''),points=ps,minX=min(p[0] for p in ps),maxX=max(p[0] for p in ps),minY=min(p[1] for p in ps),maxY=max(p[1] for p in ps)))
for n in nodes.values():
 t={x.attrib['k']:x.attrib['v'] for x in n.findall('tag')}
 if t.get('railway')=='subway_entrance':
  x,y=project(n.attrib);features.append(dict(id=int(n.attrib['id']),kind='metro',name=t.get('name',''),points=[[x,y]],minX=x,maxX=x,minY=y,maxY=y))
def pt(lat,lon):
 x,y=project(dict(lat=lat,lon=lon));return dict(x=x,y=y)
data=dict(width=round((37.807-xmin)*111320*math.cos(math.radians(55.718))*scale),height=round((ymax-55.710)*111320*scale),features=features,metro=pt(55.71705,37.794463),university=pt(55.7181,37.7956),source='© OpenStreetMap contributors, ODbL 1.0; retrieved 2026-09-14',bounds=[37.779,55.710,37.807,55.727],metersToPixels=scale)
uni=next(f for f in features if f['id']==129710008)
data['university']={'x':round(sum(p[0] for p in uni['points'])/len(uni['points']),1),'y':round(sum(p[1] for p in uni['points'])/len(uni['points']),1)}
json.dump(data,open(sys.argv[2],'w'),ensure_ascii=False,separators=(',',':'));print(len(features),'features',data['width'],data['height'])
