/// <reference types="leaflet" />

// Renders one Leaflet map per `.slab-map` element on the page. Tile servers
// are Pl3xMap instances, one per Survival season, each exposing three worlds
// (overworld / nether / end) that share a base name with `_nether` /
// `_the_end` suffixes. CRS.Simple maps a Minecraft world coordinate (x, z)
// 1:1 onto Leaflet's (lng, lat).
type Dimension = 'overworld' | 'nether' | 'the_end';

interface SlabMapMarker {
  t: string; // title
  u: string; // link (page URL)
  x: number;
  z: number;
  d?: Dimension; // dimension the marker's location is in, defaults to overworld
}

interface SlabMapPath {
  name: string;
  length: number;
  points: [number, number][]; // world [x, z], overworld only
}

const DIMENSION_SUFFIX: Record<Dimension, string> = {
  overworld: '',
  nether: '_nether',
  the_end: '_the_end',
};

const DIMENSION_LABEL: Record<Dimension, string> = {
  overworld: 'Overworld',
  nether: 'Nether',
  the_end: 'The End',
};

const DIMENSION_ICON: Record<Dimension, string> = {
  overworld: 'grass-block',
  nether: 'netherrack',
  the_end: 'end-stone',
};

const SCALE_FACTOR = 0.0625; // matches Pl3xMap's default world-to-pixel ratio

function worldToLatLng(x: number, z: number): L.LatLngTuple {
  return [z, x];
}

// Tile layer that fetches tiles and shows them as data: URL images, since the site CSP's img-src blocks
// the tile host (and blob:). Must stay <img>, not <canvas>: Leaflet's tile-seam CSS only targets img tiles.
// Needs CORS on the tile server.
const FetchTileLayer = L.TileLayer.extend({
  createTile(this: L.TileLayer, coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('img');
    tile.alt = '';
    tile.setAttribute('role', 'presentation');
    tile.onload = () => done(undefined, tile);
    tile.onerror = () => done(new Error('tile decode failed'), tile);
    fetch(this.getTileUrl(coords))
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => (tile.src = String(reader.result));
        reader.readAsDataURL(blob);
      })
      .catch((e: Error) => done(e, tile));
    return tile;
  },
}) as unknown as new (url: string, options?: L.TileLayerOptions) => L.TileLayer;

function initMap(el: HTMLElement): void {
  const tilesBase = el.dataset.tilesBase;
  const world = el.dataset.world;
  if (!tilesBase || !world) return;

  const mini = el.dataset.mini === 'true';
  const autofit = el.dataset.autofit === 'true';
  const zoom = Number(el.dataset.zoom || 4);
  const detailZoom = Number(el.dataset.detailZoom || 7);
  const [cx, cz] = (el.dataset.center || '0,0').split(',').map(Number);
  const markers: SlabMapMarker[] = el.dataset.markers ? JSON.parse(el.dataset.markers) : [];
  const paths: SlabMapPath[] = el.dataset.paths ? JSON.parse(el.dataset.paths) : [];

  const params = new URLSearchParams(window.location.search);
  const qx = params.has('x') ? Number(params.get('x')) : null;
  const qz = params.has('z') ? Number(params.get('z')) : null;

  const isDimension = (v: string | null): v is Dimension =>
    v === 'overworld' || v === 'nether' || v === 'the_end';
  const qDim = params.get('dim');
  const initialDim: Dimension = isDimension(qDim)
    ? qDim
    : isDimension(el.dataset.dim ?? null)
      ? (el.dataset.dim as Dimension)
      : 'overworld';

  const focusAttr = el.dataset.focus;
  const [fx, fz] = focusAttr ? focusAttr.split(',').map(Number) : [NaN, NaN];
  const hasFocus = mini && !Number.isNaN(fx) && !Number.isNaN(fz);

  const crs = L.Util.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(SCALE_FACTOR, 0, SCALE_FACTOR, 0),
  }) as L.CRS;

  const initialCenter = hasFocus ? worldToLatLng(fx, fz) : worldToLatLng(qx ?? cx, qz ?? cz);
  // A shared view link carries zoom; plain ?x=&z= links (coord chips, "Open full map") don't.
  const qZoom = params.has('zoom') ? Number(params.get('zoom')) : null;
  const initialZoom = mini ? detailZoom : qZoom ?? (qx !== null ? Math.max(zoom, detailZoom) : zoom);

  const map = L.map(el, {
    crs,
    preferCanvas: true,
    zoomControl: !mini,
    dragging: !mini,
    scrollWheelZoom: !mini,
    doubleClickZoom: !mini,
    boxZoom: !mini,
    keyboard: !mini,
    touchZoom: !mini,
  }).setView(initialCenter, initialZoom, { animate: false });

  const tileUrl = (dim: Dimension) =>
    `${tilesBase}/${encodeURIComponent(world + DIMENSION_SUFFIX[dim])}/{z}/vanilla/{x}_{y}.png`;

  let currentLayer: L.TileLayer | null = null;
  let currentDim: Dimension = initialDim;
  // Kept for the page's lifetime so the layers control can toggle them; refilled per dimension.
  const markerGroup = L.layerGroup().addTo(map);
  const routeGroup = L.layerGroup().addTo(map);
  function setDimension(dim: Dimension): void {
    currentDim = dim;
    if (currentLayer) map.removeLayer(currentLayer);
    currentLayer = new FetchTileLayer(tileUrl(dim), {
      tileSize: 512,
      noWrap: true,
      minNativeZoom: 0,
      maxNativeZoom: 4,
      maxZoom: 8,
      zoomOffset: -4,
      zoomReverse: true,
      tms: true,
      attribution: '<a href="https://modrinth.com/plugin/pl3xmap/">Pl3xMap</a>',
    }).addTo(map);

    markerGroup.clearLayers();
    routeGroup.clearLayers();
    markers
      .filter((m) => (m.d ?? 'overworld') === dim)
      .forEach((m) => {
        const marker = L.marker(worldToLatLng(m.x, m.z));
        if (!mini) {
          const label = m.u ? `<a href="${m.u}">${m.t}</a>` : m.t;
          marker.bindPopup(`${label}<br><span class="text-faint">${m.x}, ${m.z}</span>`);
        }
        marker.addTo(markerGroup);
      });
    if (dim === 'overworld') {
      paths.forEach((p) =>
        L.polyline(
          p.points.map(([x, z]) => worldToLatLng(x, z)),
          { color: '#c00', weight: 3, interactive: false },
        ).addTo(routeGroup),
      );
    }
  }
  setDimension(initialDim);

  L.control.scale({ imperial: false }).addTo(map);

  if (!mini) {
    const DimensionControl = L.Control.extend({
      onAdd(): HTMLElement {
        const wrap = L.DomUtil.create('div', 'leaflet-bar slab-dimension-control');
        L.DomEvent.disableClickPropagation(wrap);
        (Object.keys(DIMENSION_SUFFIX) as Dimension[]).forEach((dim) => {
          const btn = L.DomUtil.create('a', '', wrap);
          btn.href = '#';
          btn.title = DIMENSION_LABEL[dim];
          L.DomUtil.create('span', `icon-minecraft icon-minecraft-${DIMENSION_ICON[dim]}`, btn).setAttribute(
            'aria-hidden',
            'true',
          );
          if (dim === initialDim) btn.classList.add('active');
          L.DomEvent.on(btn, 'click', (e: Event) => {
            L.DomEvent.preventDefault(e);
            wrap.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
            btn.classList.add('active');
            setDimension(dim);
          });
        });
        return wrap;
      },
    });
    new DimensionControl({ position: 'topright' }).addTo(map);

    L.control
      .layers(undefined, { Locations: markerGroup, Routes: routeGroup }, { position: 'topright' })
      .addTo(map);
  }

  // getBoundsZoom degenerates to maxZoom if the container is still
  // display:none (e.g. a collapsed toggle) when this runs, since it measures
  // a 0x0 viewport - only autofit once the container has real dimensions.
  function applyAutofit(): void {
    if (!autofit || qx !== null) return;
    const dimMarkers = markers.filter((m) => (m.d ?? 'overworld') === initialDim);
    if (!dimMarkers.length) return;
    map.stop();
    map.invalidateSize({ animate: false });
    const bounds = L.latLngBounds(dimMarkers.map((m) => worldToLatLng(m.x, m.z)));
    map.fitBounds(bounds, { padding: [4, 4], animate: false });
  }

  if (el.offsetParent !== null) applyAutofit();

  if (!mini && qx !== null && qz !== null && qZoom === null) {
    L.marker(worldToLatLng(qx, qz), { title: 'Location' })
      .addTo(map)
      .bindPopup(`${qx}, ${qz}`)
      .openPopup();
  }

  if (!mini) {
    // Bottom-left readout of the world coords under the cursor; also flashes copy confirmations.
    const readout = L.DomUtil.create('div', 'slab-map-readout');
    let flashTimer = 0;
    const flash = (text: string) => {
      readout.textContent = text;
      clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => {
        flashTimer = 0;
        readout.textContent = '';
      }, 1200);
    };
    const ReadoutControl = L.Control.extend({ onAdd: () => readout });
    new ReadoutControl({ position: 'bottomleft' }).addTo(map);
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (flashTimer) return;
      readout.textContent = `X ${Math.round(e.latlng.lng)}  Z ${Math.round(e.latlng.lat)}`;
    });
    map.on('mouseout', () => (readout.textContent = ''));

    map.on('click', (e: L.LeafletMouseEvent) => {
      const x = Math.round(e.latlng.lng);
      const z = Math.round(e.latlng.lat);
      navigator.clipboard?.writeText(`${x} ${z}`).then(() => flash(`Copied ${x} ${z}`));
    });

    const ToolsControl = L.Control.extend({
      onAdd(): HTMLElement {
        const wrap = L.DomUtil.create('div', 'leaflet-bar slab-map-tools');
        L.DomEvent.disableClickPropagation(wrap);
        const button = (title: string, icon: string, onClick: () => void) => {
          const btn = L.DomUtil.create('a', '', wrap);
          btn.href = '#';
          btn.title = title;
          btn.setAttribute('role', 'button');
          btn.setAttribute('aria-label', title);
          L.DomUtil.create('span', `icon-minecraft icon-minecraft-${icon}`, btn).setAttribute('aria-hidden', 'true');
          L.DomEvent.on(btn, 'click', (e: Event) => {
            L.DomEvent.preventDefault(e);
            onClick();
          });
        };
        button('Fullscreen', 'spyglass', () => {
          if (document.fullscreenElement) document.exitFullscreen();
          else el.requestFullscreen();
        });
        button('Copy link to this view', 'lead', () => {
          const c = map.getCenter();
          const q = new URLSearchParams({
            x: String(Math.round(c.lng)),
            z: String(Math.round(c.lat)),
            zoom: String(map.getZoom()),
            dim: currentDim,
          });
          const url = `${location.origin}${location.pathname}?${q}`;
          navigator.clipboard?.writeText(url).then(() => flash('Copied link'));
        });
        return wrap;
      },
    });
    new ToolsControl({ position: 'topleft' }).addTo(map);
    document.addEventListener('fullscreenchange', () => map.invalidateSize({ animate: false }));
  }

  // Maps rendered inside a collapsed <details>/toggle section start out
  // display:none, so Leaflet measures a 0x0 viewport and only loads one
  // tile (and getBoundsZoom degenerates for autofit). Re-measure once the
  // container becomes visible.
  if (el.offsetParent === null) {
    const observer = new MutationObserver(() => {
      if (el.offsetParent !== null) {
        applyAutofit();
        map.invalidateSize({ animate: false });
        observer.disconnect();
      }
    });
    let node: HTMLElement | null = el;
    while (node) {
      observer.observe(node, { attributes: true, attributeFilter: ['class', 'style'] });
      node = node.parentElement;
    }
  }
}

document.querySelectorAll<HTMLElement>('.slab-map').forEach(initMap);
