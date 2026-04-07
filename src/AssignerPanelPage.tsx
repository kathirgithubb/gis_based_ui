import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Attribute = { field: string; value: string };
type Pole = { id: string; lat: number; lon: number; attributes: Attribute[] };
type ActiveTab = 'Details' | 'Layers';
type ExpandedGroups = Record<string, boolean>;
type ProjectTab = 'dashboard' | 'project';
type BottomRow = {
  key: string; id: string; type: string; status: string; owner: string;
  material: string; height: string; municipality: string; designId: string;
  onClick?: () => void; selected?: boolean;
};
type Project = { name: string; desc: string; date: string; status: string; assignTo?: string; dueDate?: string };
type Assignment = { project: string; user: string; status: string; due: string; created: string };

const poles: Pole[] = [
  { id: 'PL-00231', lat: 14.5943, lon: 121.1866, attributes: [{ field: 'asset_id', value: 'PL-00231' }, { field: 'feature_type', value: 'Pole' }, { field: 'status', value: 'Active' }, { field: 'owner', value: 'Utility Network' }, { field: 'material', value: 'Concrete' }, { field: 'height_m', value: '10.5' }, { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: 'DSN-1045' }] },
  { id: 'PL-00232', lat: 14.5951, lon: 121.1882, attributes: [{ field: 'asset_id', value: 'PL-00232' }, { field: 'feature_type', value: 'Pole' }, { field: 'status', value: 'Active' }, { field: 'owner', value: 'City Grid' }, { field: 'material', value: 'Steel' }, { field: 'height_m', value: '11.0' }, { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: 'DSN-1046' }] },
  { id: 'PL-00233', lat: 14.5928, lon: 121.1848, attributes: [{ field: 'asset_id', value: 'PL-00233' }, { field: 'feature_type', value: 'Pole' }, { field: 'status', value: 'Proposed' }, { field: 'owner', value: 'Utility Network' }, { field: 'material', value: 'Concrete' }, { field: 'height_m', value: '9.8' }, { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: 'DSN-1047' }] },
  { id: 'PL-00234', lat: 14.5964, lon: 121.1854, attributes: [{ field: 'asset_id', value: 'PL-00234' }, { field: 'feature_type', value: 'Pole' }, { field: 'status', value: 'Inactive' }, { field: 'owner', value: 'North Utility' }, { field: 'material', value: 'Wood' }, { field: 'height_m', value: '8.9' }, { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: 'DSN-1048' }] },
  { id: 'PL-00235', lat: 14.5936, lon: 121.1902, attributes: [{ field: 'asset_id', value: 'PL-00235' }, { field: 'feature_type', value: 'Pole' }, { field: 'status', value: 'Active' }, { field: 'owner', value: 'Metro Utility' }, { field: 'material', value: 'Steel' }, { field: 'height_m', value: '12.1' }, { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: 'DSN-1049' }] },
];

export default function AssignerPanelPage() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  const tools = [
    { icon: '⌖', label: 'Locate' }, { icon: '⬚', label: 'Select' }, { icon: '✚', label: 'Draw' },
    { icon: '📏', label: 'Measure' }, { icon: '🧭', label: 'Pan' }, { icon: '⚙', label: 'Plugins' },
  ];
  const baseMaps = ['OSM', 'Google', 'Google Satellite'];

  const [activeTab, setActiveTab] = useState<ActiveTab>('Details');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBaseMap, setSelectedBaseMap] = useState('OSM');
  const [showBaseMapDropdown, setShowBaseMapDropdown] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [draftAttributes, setDraftAttributes] = useState<Attribute[]>([]);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [latLon, setLatLon] = useState({ lat: 14.5943, lon: 121.1866 });
  const [showOC, setShowOC] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({ Segment: false, 'Distribution Structure': false, Equipment: false });
  const [selectedObjectItem, setSelectedObjectItem] = useState('');
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [tableFilterMode] = useState('By ID');
  const [tableFilterInput, setTableFilterInput] = useState('');
  const [appliedTableFilter, setAppliedTableFilter] = useState('');
  const [compassAngle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [projectTab, setProjectTab] = useState<ProjectTab>('dashboard');
  const [projects, setProjects] = useState<Project[]>([{ name: 'Pole_test', desc: 'Condition of the pole', date: '6/4/2026', status: 'Active' }]);
  const [assignments, _setAssignments] = useState<Assignment[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStatus, setProjStatus] = useState('New');
  const [projAssignTo, setProjAssignTo] = useState('');
  const [projDueDate, setProjDueDate] = useState('');
  const [showUserPopup, setShowUserPopup] = useState(false);
  const ocGroups: { key: string; items: string[] }[] = [
    { key: 'Segment', items: ['Segment 1', 'Segment 2', 'Segment 3'] },
    { key: 'Distribution Structure', items: ['DS 1', 'DS 2'] },
    { key: 'Equipment', items: ['Eq 1', 'Eq 2', 'Eq 3'] },
  ];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([14.5943, 121.1866], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map);
    poles.forEach((pole) => {
      const m = L.circleMarker([pole.lat, pole.lon], { radius: 5, color: '#555', weight: 2, fillColor: '#111', fillOpacity: 0.85 }).addTo(map);
      m.bindTooltip(pole.id, { direction: 'top', offset: [0, -8] });
      m.on('click', (e: L.LeafletMouseEvent) => { L.DomEvent.stopPropagation(e); openPole(pole); });
    });
    map.on('move', () => { const c = map.getCenter(); setLatLon({ lat: c.lat, lon: c.lng }); });
    map.on('zoomend', () => setZoomLevel(map.getZoom()));
    map.on('click', () => { setSelectedObjectId(null); setIsEditing(false); setShowSaveMenu(false); setShowTopMenu(false); setShowBaseMapDropdown(false); setShowUserPopup(false); });
    leafletMapRef.current = map;
    return () => { map.remove(); leafletMapRef.current = null; };
  }, []);

  useEffect(() => {
    if (leafletMapRef.current && leafletMapRef.current.getZoom() !== zoomLevel)
      leafletMapRef.current.setZoom(zoomLevel);
  }, [zoomLevel]);

  useEffect(() => {
    setTimeout(() => leafletMapRef.current?.invalidateSize(), 320);
  }, [showOC, selectedObjectId, showBottomPanel, showProject, isMobile]);

  const getPoleValue = (pole: Pole, field: string) => pole.attributes.find((a) => a.field === field)?.value || '-';
  const getDisplayLabel = () => { const n = selectedObjectItem || 'Object'; return selectedObjectId ? `${n} (${selectedObjectId})` : n; };
  const getSelectedPole = () => poles.find((p) => p.id === selectedObjectId) || null;
  const zoomToSelected = () => { const p = getSelectedPole(); if (p) leafletMapRef.current?.setView([p.lat, p.lon], 18); };
  const startEditing = () => { setDraftAttributes(attributes.map((i) => ({ ...i }))); setIsEditing(true); setShowSaveMenu(false); };
  const cancelEditing = () => { setDraftAttributes(attributes.map((i) => ({ ...i }))); setIsEditing(false); setShowSaveMenu(false); };
  const handleDraft = (field: string, value: string) => setDraftAttributes((prev) => prev.map((i) => (i.field === field ? { ...i, value } : i)));
  const saveChanges = (cont: boolean) => { setAttributes(draftAttributes.map((i) => ({ ...i }))); setIsEditing(cont); setShowSaveMenu(false); };
  const deleteObj = () => { setSelectedObjectId(null); setAttributes([]); setDraftAttributes([]); setIsEditing(false); setShowSaveMenu(false); };
  const closeEditor = () => { setSelectedObjectId(null); setIsEditing(false); setShowSaveMenu(false); };
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 1, 20));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 1, 1));
  const toggleGroup = (g: keyof ExpandedGroups) => setExpandedGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  const openPole = (pole: Pole) => {
    setSelectedObjectItem('Pole'); setSelectedObjectId(pole.id);
    setAttributes(pole.attributes.map((i) => ({ ...i }))); setDraftAttributes(pole.attributes.map((i) => ({ ...i })));
    setIsEditing(false); setShowSaveMenu(false);
    if (isMobile) { setShowOC(false); setShowProject(false); }
    leafletMapRef.current?.setView([pole.lat, pole.lon], 16);
  };

  const createObjectData = (name: string) => {
    const code = name.toUpperCase().slice(0, 2);
    const objectId = `${code}-001`;
    const data: Attribute[] = [
      { field: 'asset_id', value: objectId }, { field: 'feature_type', value: name },
      { field: 'status', value: 'Active' }, { field: 'owner', value: 'Utility Network' },
      { field: 'material', value: name === 'Manhole' ? 'Concrete' : 'Steel' },
      { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: `${code}-1001` },
    ];
    setSelectedObjectItem(name); setSelectedObjectId(objectId);
    setAttributes(data); setDraftAttributes(data);
    setIsEditing(false); setShowSaveMenu(false);
    if (isMobile) { setShowOC(false); setShowProject(false); }
  };

  const selectObjectItem = (name: string) => {
    setSelectedObjectItem(name); setShowBottomPanel(true);
    setAppliedTableFilter(''); setTableFilterInput('');
    setShowProject(false);
    if (name === 'Pole') { setSelectedObjectId(null); setAttributes([]); setDraftAttributes([]); setIsEditing(false); setShowSaveMenu(false); return; }
    createObjectData(name);
  };

  const makeMH = (id: string, status: string, designId: string, extra?: Partial<BottomRow>): BottomRow => ({ key: id, id, type: 'Manhole', status, owner: 'Utility Network', material: 'Concrete', height: '-', municipality: 'Quezon City', designId, ...extra });
  const makeCB = (id: string, status: string, designId: string, extra?: Partial<BottomRow>): BottomRow => ({ key: id, id, type: 'Cabinate', status, owner: 'Metro Utility', material: 'Steel', height: '-', municipality: 'Quezon City', designId, ...extra });

  const bottomPanelRows: BottomRow[] = selectedObjectItem === 'Pole'
    ? poles.map((pole) => ({ key: pole.id, id: pole.id, type: getPoleValue(pole, 'feature_type'), status: getPoleValue(pole, 'status'), owner: getPoleValue(pole, 'owner'), material: getPoleValue(pole, 'material'), height: getPoleValue(pole, 'height_m'), municipality: getPoleValue(pole, 'municipality'), designId: getPoleValue(pole, 'design_id'), selected: selectedObjectId === pole.id, onClick: () => openPole(pole) }))
    : selectedObjectItem === 'Manhole'
    ? [makeMH('MH-001', 'Active', 'MH-2101', { selected: selectedObjectId === 'MH-001', onClick: () => createObjectData('Manhole') }), makeMH('MH-002', 'Proposed', 'MH-2102', { onClick: () => { setSelectedObjectItem('Manhole'); setSelectedObjectId('MH-002'); const d: Attribute[] = [{ field: 'asset_id', value: 'MH-002' }, { field: 'feature_type', value: 'Manhole' }, { field: 'status', value: 'Proposed' }, { field: 'owner', value: 'Utility Network' }, { field: 'material', value: 'Concrete' }, { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: 'MH-2102' }]; setAttributes(d); setDraftAttributes(d); setIsEditing(false); setShowSaveMenu(false); } })]
    : selectedObjectItem === 'Cabinate'
    ? [makeCB('CB-001', 'Active', 'CB-3101', { selected: selectedObjectId === 'CB-001', onClick: () => createObjectData('Cabinate') }), makeCB('CB-002', 'Inactive', 'CB-3102', { onClick: () => { setSelectedObjectItem('Cabinate'); setSelectedObjectId('CB-002'); const d: Attribute[] = [{ field: 'asset_id', value: 'CB-002' }, { field: 'feature_type', value: 'Cabinate' }, { field: 'status', value: 'Inactive' }, { field: 'owner', value: 'Metro Utility' }, { field: 'material', value: 'Steel' }, { field: 'municipality', value: 'Quezon City' }, { field: 'design_id', value: 'CB-3102' }]; setAttributes(d); setDraftAttributes(d); setIsEditing(false); setShowSaveMenu(false); } })]
    : [];

  const filteredRows = useMemo(() => {
    if (!appliedTableFilter.trim()) return bottomPanelRows;
    const q = appliedTableFilter.trim().toLowerCase();
    return tableFilterMode === 'By ID' ? bottomPanelRows.filter((r) => r.id.toLowerCase().includes(q)) : bottomPanelRows;
  }, [bottomPanelRows, appliedTableFilter, tableFilterMode]);

  const downloadTable = () => {
    const headers = ['ID', 'Type', 'Status', 'Owner', 'Material', 'Height', 'Municipality', 'Design ID'];
    const rows = filteredRows.map((r) => [r.id, r.type, r.status, r.owner, r.material, r.height, r.municipality, r.designId]);
    const csv = [headers, ...rows].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = `${selectedObjectItem || 'objects'}-table.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const saveProject = () => {
    if (!projName.trim()) return;
    const today = new Date().toLocaleDateString('en-US');
    setProjects((prev) => [...prev, { name: projName.trim(), desc: projDesc.trim(), date: today, status: projStatus, assignTo: projAssignTo, dueDate: projDueDate }]);
    setProjName(''); setProjDesc(''); setProjStatus('New'); setProjAssignTo(''); setProjDueDate(''); setShowProjectForm(false);
  };

  // Desktop layout
  const ocPanelWidth = !isMobile && showOC ? 250 : 0;
  const projectPanelWidth = !isMobile && showProject ? 250 : 0;
  const leftPanelWidth = ocPanelWidth + projectPanelWidth;
  const topLeftLeft = leftPanelWidth + 12;
  const botLeftLeft = leftPanelWidth + 12;
  const rightShift = !isMobile && selectedObjectId ? 'right-[332px]' : 'right-3 sm:right-4';

  const activeBottomPanel = showBottomPanel ? 'table' : null;
  const mobileMapControlsOffset = isMobile
    ? selectedObjectId ? 'bottom-[calc(50vh+10px)]' : activeBottomPanel ? 'bottom-[calc(30vh+8px)]' : 'bottom-3'
    : activeBottomPanel ? 'bottom-[calc(20vh+8px)]' : 'bottom-4';
  const mobileLatLonOffset = isMobile
    ? selectedObjectId ? 'bottom-[calc(50vh+14px)]' : activeBottomPanel ? 'bottom-[calc(30vh+10px)]' : 'bottom-3'
    : activeBottomPanel ? 'bottom-[calc(20vh+8px)]' : 'bottom-4';

  const ib = 'flex items-center justify-center border border-[#c8c8c8] bg-[#e8e8e8] text-[#111] shadow-sm transition-all hover:bg-[#d4d4d4] active:bg-[#c0c0c0]';
  const pb = 'border border-[#111] bg-[#111] text-white hover:bg-[#333] transition-all';
  const gb = 'border border-[#c8c8c8] bg-[#e8e8e8] text-[#111] hover:bg-[#d4d4d4] transition-all';

  const fontN = 5.5;
  const fontSm = 5;

  const SmallCompass = ({ size = 48 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 54 54" style={{ transform: `rotate(${compassAngle}deg)`, transition: 'transform 0.4s ease', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}>
      <circle cx="27" cy="27" r="26" fill="#e8e8e8" stroke="#c8c8c8" strokeWidth="0.8" />
      <circle cx="27" cy="27" r="22" fill="none" stroke="#d4d4d4" strokeWidth="0.4" />
      {Array.from({ length: 16 }, (_, i) => { const deg = i * 22.5; const rad = (deg * Math.PI) / 180; const isMaj = i % 4 === 0; const isMid = i % 2 === 0 && !isMaj; const r1 = isMaj ? 18 : isMid ? 19.5 : 20.5; return <line key={i} x1={27 + r1 * Math.sin(rad)} y1={27 - r1 * Math.cos(rad)} x2={27 + 23 * Math.sin(rad)} y2={27 - 23 * Math.cos(rad)} stroke={isMaj ? '#666' : '#bbb'} strokeWidth={isMaj ? 1 : 0.55} />; })}
      <circle cx="27" cy="27" r="16" fill="#dedede" stroke="#c8c8c8" strokeWidth="0.6" />
      {[45, 135, 225, 315].map((deg) => { const rad = (deg * Math.PI) / 180; const tip = { x: 27 + 12 * Math.sin(rad), y: 27 - 12 * Math.cos(rad) }; const l = { x: 27 + 3.2 * Math.sin(rad + Math.PI / 2), y: 27 - 3.2 * Math.cos(rad + Math.PI / 2) }; const r = { x: 27 + 3.2 * Math.sin(rad - Math.PI / 2), y: 27 - 3.2 * Math.cos(rad - Math.PI / 2) }; return <polygon key={deg} points={`${tip.x},${tip.y} ${l.x},${l.y} ${r.x},${r.y}`} fill="#c0c0c0" />; })}
      <polygon points="27,3.5 29.5,27 27,21 24.5,27" fill="#111" />
      <polygon points="27,50.5 29.5,27 27,33 24.5,27" fill="#bbb" />
      <polygon points="50.5,27 27,24.5 33,27 27,29.5" fill="#888" />
      <polygon points="3.5,27 27,24.5 21,27 27,29.5" fill="#888" />
      <circle cx="27" cy="27" r="6" fill="#e8e8e8" stroke="#c8c8c8" strokeWidth="0.6" />
      <circle cx="27" cy="27" r="2.8" fill="#222" />
      <circle cx="27" cy="27" r="1.2" fill="#e8e8e8" />
      <text x="27" y="15" textAnchor="middle" fontSize={fontN} fontWeight="700" fill="#111" fontFamily="sans-serif">N</text>
      <text x="27" y="44.5" textAnchor="middle" fontSize={fontSm} fontWeight="500" fill="#999" fontFamily="sans-serif">S</text>
      <text x="43.5" y="28.8" textAnchor="middle" fontSize={fontSm} fontWeight="500" fill="#999" fontFamily="sans-serif">E</text>
      <text x="10.5" y="28.8" textAnchor="middle" fontSize={fontSm} fontWeight="500" fill="#999" fontFamily="sans-serif">W</text>
    </svg>
  );

  const LayersIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L15 5L8 9L1 5L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      <path d="M1 9L8 13L15 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const renderDetails = (small: boolean) =>
    (isEditing ? draftAttributes : attributes).map((item, idx) => (
      <div key={item.field} className={`grid items-center border-b border-[#d4d4d4] leading-none ${small ? 'min-h-[24px] grid-cols-[82px_1fr] text-[11px]' : 'min-h-[26px] grid-cols-[100px_1fr] text-[12px]'} ${idx % 2 === 0 ? 'bg-[#e8e8e8]' : 'bg-[#efefef]'}`}>
        <div className="truncate border-r border-[#d4d4d4] px-2 py-[3px] font-medium text-[#111]">{item.field}</div>
        <div className="px-2 py-[2px]">
          {isEditing ? (item.field === 'status' ? (
            <select value={item.value} onChange={(e) => handleDraft(item.field, e.target.value)} className={`w-full rounded border border-[#c8c8c8] bg-white px-1.5 text-[#111] outline-none ${small ? 'h-[20px] text-[11px]' : 'h-6 text-[12px]'}`}>
              <option>Active</option><option>Proposed</option><option>Inactive</option>
            </select>
          ) : (
            <input value={item.value} onChange={(e) => handleDraft(item.field, e.target.value)} className={`w-full rounded border border-[#c8c8c8] bg-white px-1.5 text-[#111] outline-none ${small ? 'h-[20px] text-[11px]' : 'h-6 text-[12px]'}`} />
          )) : (
            <div className={`truncate text-[#333] ${small ? 'text-[11px]' : 'text-[12px]'}`}>{item.value}</div>
          )}
        </div>
      </div>
    ));

  const renderLayers = (small: boolean) =>
    ['Pole', 'Substation', 'Cabinate', 'Cable'].map((layer, idx) => (
      <div key={layer} className={`grid grid-cols-[1fr_auto] items-center border-b border-[#d4d4d4] px-3 leading-none ${small ? 'min-h-[24px] py-[3px] text-[11px]' : 'min-h-[26px] py-[4px] text-[12px]'} ${idx % 2 === 0 ? 'bg-[#e8e8e8]' : 'bg-[#efefef]'}`}>
        <span className="truncate text-[#555]">{layer}</span>
        <input type="checkbox" defaultChecked className="accent-[#111]" />
      </div>
    ));

  const dashboardStats = [
    { label: 'Total Project', value: projects.length, icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke="#555" strokeWidth="1.3"/><path d="M4 8h8M4 5h5M4 11h6" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/></svg>, accent: '#111' },
    { label: 'Pending', value: assignments.filter((a) => a.status === 'Pending').length, icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#888" strokeWidth="1.3"/><path d="M8 5v3.5l2 2" stroke="#888" strokeWidth="1.3" strokeLinecap="round"/></svg>, accent: '#888' },
    { label: 'In Progress', value: assignments.filter((a) => a.status === 'In Progress').length, icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 016-6v2a4 4 0 00-4 4H2z" fill="#555"/><circle cx="8" cy="8" r="6" stroke="#555" strokeWidth="1.3" strokeDasharray="3 2"/></svg>, accent: '#555' },
    { label: 'Completed', value: assignments.filter((a) => a.status === 'Completed').length, icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#3a7a3a" strokeWidth="1.3"/><path d="M5 8l2 2 4-4" stroke="#3a7a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, accent: '#3a7a3a' },
  ];

  const projectTabs: { key: ProjectTab; label: string }[] = [{ key: 'dashboard', label: 'Dashboard' }, { key: 'project', label: 'Projects' }];

  const renderProjectContent = () => {
    if (projectTab === 'dashboard') {
      return (
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {dashboardStats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-[#d0d0d0] bg-white shadow-sm p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold text-[#666] uppercase tracking-wide leading-tight break-words pr-1 w-full">{stat.label}</span>
                  <span className="shrink-0 opacity-70">{stat.icon}</span>
                </div>
                <div className="text-[20px] font-bold leading-none" style={{ color: stat.accent }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (projectTab === 'project') {
      return (
        <div className="h-full overflow-auto p-3 space-y-2">
          {showProjectForm && (
            <div className="rounded-xl border border-[#c8c8c8] bg-white p-3 shadow-sm">
              <div className="text-[13px] font-semibold text-[#111] mb-2">New Project</div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-[#555] mb-1">Project name</label>
                  <input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="Enter project name" className="w-full rounded-lg border border-[#c8c8c8] bg-[#f8f8f8] px-3 py-2 text-[12px] text-[#111] outline-none focus:border-[#999]" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#555] mb-1">Description</label>
                  <textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="Brief description..." rows={2} className="w-full rounded-lg border border-[#c8c8c8] bg-[#f8f8f8] px-3 py-2 text-[12px] text-[#111] outline-none resize-none focus:border-[#999]" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#555] mb-1">Status</label>
                  <select value={projStatus} onChange={(e) => setProjStatus(e.target.value)} className="w-full rounded-lg border border-[#c8c8c8] bg-[#f8f8f8] px-3 py-2 text-[12px] text-[#111] outline-none focus:border-[#999]">
                    <option>New</option>
                    <option>Designing</option>
                    <option>Awaiting Approval</option>
                    <option>Approved</option>
                    <option>Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#555] mb-1">Assign To</label>
                  <select value={projAssignTo} onChange={(e) => setProjAssignTo(e.target.value)} className="w-full rounded-lg border border-[#c8c8c8] bg-[#f8f8f8] px-3 py-2 text-[12px] text-[#111] outline-none focus:border-[#999]">
                    <option value="">Select assignee</option>
                    <option>user@redplanet.com</option>
                    <option>user2</option>
                    <option>user3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#555] mb-1">Due Date</label>
                  <input type="date" value={projDueDate} onChange={(e) => setProjDueDate(e.target.value)} className="w-full rounded-lg border border-[#c8c8c8] bg-[#f8f8f8] px-3 py-2 text-[12px] text-[#111] outline-none focus:border-[#999]" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#555] mb-1">Boundary</label>
                  <div className="rounded-lg border border-dashed border-[#bbb] bg-[#f4f4f4] px-3 py-2 text-[11px] text-[#666] flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke="#888" strokeWidth="1" strokeDasharray="3 2"/><circle cx="1" cy="1" r="1.5" fill="#888"/><circle cx="15" cy="1" r="1.5" fill="#888"/><circle cx="15" cy="15" r="1.5" fill="#888"/><circle cx="1" cy="15" r="1.5" fill="#888"/></svg>
                    Draw a boundary on the map using the draw tool
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => { setProjName(''); setProjDesc(''); setProjStatus('New'); setProjAssignTo(''); setProjDueDate(''); setShowProjectForm(false); }} className={`${gb} rounded-lg px-3 py-2 text-[12px] font-medium`}>Clear</button>
                  <button type="button" onClick={saveProject} className={`${pb} rounded-lg px-3 py-2 text-[12px] font-semibold`}>Save project</button>
                </div>
              </div>
            </div>
          )}
          {projects.length === 0 && !showProjectForm && (
            <div className="text-center text-[12px] text-[#888] py-8">No projects yet. Click + New to create one.</div>
          )}
          {projects.map((p, i) => (
            <div key={i} className="rounded-xl border border-[#c8c8c8] bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#111] truncate">{p.name}</div>
                  <div className="text-[11px] text-[#666] truncate mt-0.5">{p.desc || 'No description'}</div>
                </div>
                <span className="shrink-0 rounded-full bg-[#111] px-2 py-0.5 text-[10px] font-semibold text-white">{p.status}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                <span className="text-[11px] text-[#888]">Created: {p.date}</span>
                {p.dueDate && <span className="text-[11px] text-[#888]">Due: {p.dueDate}</span>}
                <span className="text-[11px] font-medium text-green-600">Boundary defined</span>
              </div>
              <button type="button" className="w-full rounded-lg bg-black hover:bg-gray-800 text-white py-2 text-[12px] font-semibold transition-colors" onClick={() => leafletMapRef.current?.setView([14.5943, 121.1866], 13)}>GoTo Project</button>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // ── MOBILE BOTTOM SHEET for OC & Project panels ──
  const mobileSheetOpen = isMobile && (showOC || showProject);
  const mobileSheetTitle = showProject ? 'Project' : 'Object Controller';

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f2f2f2] font-sans text-[#111]">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Mobile backdrop */}
      {mobileSheetOpen && (
        <div className="absolute inset-0 z-[38] bg-black/30" onClick={() => { setShowOC(false); setShowProject(false); }} />
      )}

      {/* ── DESKTOP LEFT PANEL: Object Controller ── */}
      {!isMobile && (
        <div className={`absolute inset-y-0 left-0 z-30 border-r border-[#c8c8c8] bg-[#e8e8e8]/98 shadow-xl transition-transform duration-300 ease-in-out ${showOC ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: '250px' }}>
          <div className="flex items-center justify-between border-b border-[#c8c8c8] bg-[#dedede] px-3 py-2 text-[13px] font-semibold text-[#111]">
            <span>Object Controller</span>
            <button type="button" onClick={() => setShowOC(false)} className={`${ib} h-6 w-6 shrink-0 rounded-md text-xs font-bold`}>←</button>
          </div>
          <div className="h-[calc(100%-41px)] overflow-y-auto px-2 py-2">
            {[{ key: 'Segment' as keyof ExpandedGroups, items: ['Cable', 'Cable Segment', 'Fiber Optic', 'Wire'] }, { key: 'Distribution Structure' as keyof ExpandedGroups, items: ['Pole', 'Manhole', 'Cabinate'] }, { key: 'Equipment' as keyof ExpandedGroups, items: ['Power Transformer', 'Service Point', 'Light', 'Meter'] }].map((group, gi) => (
              <div key={group.key} className={gi > 0 ? 'mt-1 space-y-0.5' : 'space-y-0.5'}>
                <button type="button" onClick={() => toggleGroup(group.key)} className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left font-medium text-[#111] transition-all hover:bg-[#d4d4d4]">
                  <span className="text-[13px] leading-tight">{group.key}</span>
                  <span className="shrink-0 text-[10px]">{expandedGroups[group.key] ? '▾' : '▸'}</span>
                </button>
                {expandedGroups[group.key] && (
                  <div className="ml-3 space-y-0.5 border-l border-[#c8c8c8] pl-2.5">
                    {group.items.map((item) => (
                      <button key={item} type="button" onClick={() => selectObjectItem(item)} className={`block w-full rounded-md px-2.5 py-1.5 text-left text-[12px] transition-all ${selectedObjectItem === item ? 'bg-[#111] text-white' : 'text-[#555] hover:bg-[#d4d4d4] hover:text-[#111]'}`}>{item}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM SHEET: OC or Project ── */}
      {isMobile && (
        <div className={`absolute left-0 top-0 bottom-0 z-[39] flex flex-col border-r border-[#c8c8c8] bg-[#f0f0f0] shadow-2xl transition-transform duration-300 ease-in-out ${mobileSheetOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: '75vw', maxWidth: '280px' }}>
          <div className="flex items-center justify-between border-b border-[#c8c8c8] bg-[#dedede] px-3 py-2.5 shrink-0">
            <span className="text-[13px] font-semibold text-[#111]">{mobileSheetTitle}</span>
            <button type="button" onClick={() => { setShowOC(false); setShowProject(false); }} className={`${ib} h-7 w-7 rounded-md text-xs font-bold`}>←</button>
          </div>

          {/* OC content */}
          {showOC && !showProject && (
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {ocGroups.map((group, gi) => (
                <div key={group.key} className={gi > 0 ? 'mt-1 space-y-0.5' : 'space-y-0.5'}>
                  <button type="button" onClick={() => toggleGroup(group.key)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left font-medium text-[#111] bg-[#e8e8e8] hover:bg-[#d4d4d4] transition-all">
                    <span className="text-[11px] leading-tight truncate pr-1">{group.key}</span>
                    <span className="shrink-0 text-[10px]">{expandedGroups[group.key] ? '▾' : '▸'}</span>
                  </button>
                  {expandedGroups[group.key] && (
                    <div className="ml-2 space-y-0.5 border-l border-[#c8c8c8] pl-2">
                      {group.items.map((item) => (
                        <button key={item} type="button" onClick={() => { selectObjectItem(item); setShowOC(false); setShowProject(false); }} className={`block w-full rounded-md px-2 py-1.5 text-left text-[11px] transition-all ${selectedObjectItem === item ? 'bg-[#111] text-white' : 'bg-[#e8e8e8] text-[#555] hover:bg-[#d4d4d4] hover:text-[#111]'}`}>{item}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Project content */}
          {showProject && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Tab switcher */}
              <div className="px-3 pt-2.5 pb-2 shrink-0">
                <div className="flex rounded-xl border border-[#c8c8c8] bg-[#d8d8d8] p-[3px] gap-[3px]">
                  {projectTabs.map((t) => (
                    <button key={t.key} type="button" onClick={() => { setProjectTab(t.key); setShowProjectForm(false); }} className={`flex-1 rounded-lg py-2 text-center text-[13px] font-semibold transition-all duration-150 ${projectTab === t.key ? 'bg-white text-[#111] shadow-sm' : 'text-[#666] hover:text-[#333]'}`}>{t.label}</button>
                  ))}
                </div>
              </div>
              {/* + New button */}
              {projectTab === 'project' && (
                <div className="border-b border-[#c8c8c8] px-3 pb-2.5 shrink-0">
                  <button type="button" onClick={() => setShowProjectForm((p) => !p)} className={`${pb} w-full rounded-xl py-2 text-[13px] font-semibold`}>+ New</button>
                </div>
              )}
              {/* Content */}
              <div className="flex-1 overflow-y-auto">{renderProjectContent()}</div>
            </div>
          )}
        </div>
      )}

      {/* ── DESKTOP LEFT PANEL: Project ── */}
      {!isMobile && showProject && (
        <div className="absolute inset-y-0 z-30 border-r border-[#c8c8c8] bg-[#e8e8e8]/98 shadow-xl transition-transform duration-300 ease-in-out translate-x-0" style={{ left: `${ocPanelWidth}px`, width: '250px' }}>
          <div className="flex items-center justify-between border-b border-[#c8c8c8] bg-[#dedede] px-3 py-2 text-[13px] font-semibold text-[#111]">
            <span>Project</span>
            <button type="button" onClick={() => setShowProject(false)} className={`${ib} h-6 w-6 shrink-0 rounded-md text-xs font-bold`}>←</button>
          </div>
          <div className="px-2 pt-2 pb-1.5 shrink-0">
            <div className="flex rounded-xl border border-[#c8c8c8] bg-[#d8d8d8] p-[3px] gap-[3px]">
              {projectTabs.map((t) => (
                <button key={t.key} type="button" onClick={() => { setProjectTab(t.key); setShowProjectForm(false); }} className={`flex-1 rounded-lg py-1 text-center text-[10px] font-semibold transition-all duration-150 ${projectTab === t.key ? 'bg-white text-[#111] shadow-sm' : 'text-[#666] hover:text-[#333]'}`}>{t.label}</button>
              ))}
            </div>
          </div>
          {projectTab === 'project' && (
            <div className="border-b border-[#c8c8c8] px-2 py-1.5">
              <button type="button" onClick={() => setShowProjectForm((p) => !p)} className={`${pb} w-full rounded-lg py-1.5 text-[11px] font-semibold`}>+ New</button>
            </div>
          )}
          <div className="overflow-y-auto" style={{ height: projectTab === 'project' ? 'calc(100% - 110px)' : 'calc(100% - 80px)' }}>
            {renderProjectContent()}
          </div>
        </div>
      )}

      {/* TOP LEFT: hamburger + search */}
      <div className="absolute top-2 z-30 flex items-center gap-1.5 transition-all duration-300" style={{ left: `${topLeftLeft}px` }}>
        <button type="button" title="Menu" onClick={() => { setShowTopMenu((p) => !p); setShowBaseMapDropdown(false); }} className={`${ib} h-8 w-8 sm:h-9 sm:w-9 rounded-full`}>
          <div className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-[14px] rounded bg-current" />
            <span className="block h-[2px] w-[14px] rounded bg-current" />
            <span className="block h-[2px] w-[14px] rounded bg-current" />
          </div>
        </button>
        <div className="hidden sm:block">
          <div className="flex h-9 w-[240px] items-center rounded-full border border-[#c8c8c8] bg-[#f2f2f2]/98 px-3 shadow-sm">
            <input className="w-full bg-transparent text-[12px] text-[#111] outline-none placeholder:text-[#888]" placeholder="Search asset, pole, address..." />
          </div>
        </div>
        {showTopMenu && (
          <div className={`absolute left-0 z-50 overflow-hidden rounded-xl border border-[#c8c8c8] bg-[#e8e8e8] shadow-lg ${isMobile ? 'top-10 min-w-[160px]' : 'top-11 min-w-[170px]'}`}>
            {[
              { label: 'Home', action: () => { leafletMapRef.current?.setView([14.5943, 121.1866], 13); setShowTopMenu(false); } },
              { label: 'Bookmark', action: () => setShowTopMenu(false) },
              { label: 'Object Controller', action: () => { setShowOC((p) => !p); if (isMobile) setShowProject(false); setShowTopMenu(false); } },
              { label: 'Project', action: () => { setShowProject((p) => !p); if (isMobile) setShowOC(false); if (!showProject) setShowBottomPanel(false); setShowTopMenu(false); } },
            ].map((item, i) => (
              <button key={item.label} type="button" onClick={item.action} className={`flex w-full items-center text-left text-[#111] hover:bg-[#d4d4d4] ${isMobile ? 'px-4 py-3 text-[13px]' : 'px-4 py-2.5 text-[13px]'} ${i > 0 ? 'border-t border-[#c8c8c8]' : ''}`}>{item.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* TOP RIGHT: logo + user */}
      <div className={`absolute top-2 z-[60] flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${rightShift}`}>
        <a href="https://redplanetgrp.com" target="_blank" rel="noreferrer" className="block">
          <img src="https://redplanetgrp.com/wp-content/uploads/2025/04/Redplanet-Solutions.webp" alt="RedPlanet" className="h-8 sm:h-10 w-auto object-contain" />
        </a>
        <div className="relative">
          <button type="button" title="User" onClick={() => { setShowUserPopup((p) => !p); setShowBaseMapDropdown(false); setShowTopMenu(false); }} className={`${ib} h-8 w-8 sm:h-9 sm:w-9 rounded-full`}>
            <span className="text-sm">👤</span>
          </button>
          {showUserPopup && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-[70] w-[210px] overflow-hidden rounded-xl border border-[#c8c8c8] bg-white shadow-xl">
              <div className="flex items-center gap-2.5 px-3 py-3 border-b border-[#eee]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111] text-white text-[13px] font-bold select-none">A</div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-[#111]">Assigner</div>
                  <div className="truncate text-[10px] text-[#888]">assigner@redplanet.com</div>
                </div>
              </div>
              <button type="button" onClick={() => { setShowUserPopup(false); navigate('/'); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#c0392b] font-medium hover:bg-[#fff0ee] transition-colors">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: basemap + tools */}
      <div className={`absolute z-20 flex flex-col gap-1.5 transition-all duration-200 ${rightShift} ${showUserPopup ? 'top-[58px] sm:top-[64px]' : 'top-[46px] sm:top-[52px]'}`}>
        <div className="relative">
          <button type="button" title="Base Map" onClick={() => { setShowBaseMapDropdown((p) => !p); setShowTopMenu(false); }} className={`${ib} h-8 w-8 sm:h-9 sm:w-9 rounded-xl`}><LayersIcon /></button>
          {showBaseMapDropdown && (
            <div className="absolute right-0 top-10 sm:top-11 z-50 min-w-[150px] overflow-hidden rounded-xl border border-[#c8c8c8] bg-[#e8e8e8] shadow-lg">
              <div className="border-b border-[#c8c8c8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#555]">Base Map</div>
              {baseMaps.map((map, i) => (
                <button key={map} type="button" onClick={() => { setSelectedBaseMap(map); setShowBaseMapDropdown(false); }} className={`flex w-full items-center justify-between px-3 py-2 text-left text-[12px] transition-all ${selectedBaseMap === map ? 'bg-[#111] text-white' : 'text-[#111] hover:bg-[#d4d4d4]'} ${i > 0 ? 'border-t border-[#c8c8c8]' : ''}`}>
                  <span>{map}</span>{selectedBaseMap === map && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {tools.map((tool) => (
          <button key={tool.label} type="button" title={tool.label} className={`${ib} h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-xs sm:text-sm font-bold`}>{tool.icon}</button>
        ))}
      </div>

      {/* BOTTOM LEFT: Zoom + Compass */}
      <div className={`absolute z-30 flex flex-col items-center gap-1.5 transition-all duration-300 ${mobileMapControlsOffset}`} style={{ left: `${botLeftLeft}px` }}>
        <div className="flex flex-col items-center overflow-hidden rounded-2xl border border-[#c8c8c8] bg-[#e8e8e8]/95 shadow-sm">
          <button type="button" onClick={zoomIn} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center border-b border-[#c8c8c8] text-sm sm:text-base font-bold text-[#111] hover:bg-[#d4d4d4] transition-all">+</button>
          <div className="flex items-center justify-center px-1 py-1.5">
            <input type="range" min="1" max="20" value={zoomLevel} onChange={(e) => setZoomLevel(Number(e.target.value))} className="vertical-zoom-slider cursor-pointer appearance-none bg-transparent" style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '7px', height: isMobile ? '42px' : '48px' }} />
          </div>
          <button type="button" onClick={zoomOut} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center border-t border-[#c8c8c8] text-sm sm:text-base font-bold text-[#111] hover:bg-[#d4d4d4] transition-all">−</button>
        </div>
        <SmallCompass size={isMobile ? 44 : 48} />
      </div>

      {/* BOTTOM RIGHT: Lat/Lon */}
      <div className={`absolute z-30 rounded-xl border border-[#c8c8c8] bg-[#e8e8e8]/95 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-[11px] text-[#555] shadow-sm transition-all duration-300 ${rightShift} ${mobileLatLonOffset}`}>
        <span className="font-bold text-[#111]">Lat:</span> {latLon.lat.toFixed(4)}{' '}<span className="text-[#c8c8c8]">|</span>{' '}<span className="font-bold text-[#111]">Lon:</span> {latLon.lon.toFixed(4)}
      </div>

      {/* OBJECT EDITOR – mobile */}
      {selectedObjectId && isMobile && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-xl border-t border-[#c8c8c8] bg-[#e8e8e8]/98 shadow-2xl" style={{ maxHeight: '50vh' }}>
          <div className="flex shrink-0 justify-center pb-1 pt-2"><div className="h-[3px] w-8 rounded-full bg-[#c0c0c0]" /></div>
          <div className="flex shrink-0 items-center justify-between border-b border-[#c8c8c8] bg-[#dedede] px-3 py-1.5">
            <span className="text-[12px] font-semibold text-[#111]">Object Editor</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={zoomToSelected} className={`${ib} h-6 w-6 rounded-md text-xs`}>⌖</button>
              {!isEditing && <button onClick={startEditing} className={`${gb} rounded-md px-2 py-1 text-[11px] font-medium`}>Edit</button>}
              <button type="button" onClick={closeEditor} className={`${ib} h-6 w-6 rounded-md text-xs font-bold`}>↓</button>
            </div>
          </div>
          <div className="shrink-0 border-b border-[#c8c8c8] px-3 py-1">
            <span className="text-[11px] text-[#555]">Selected: </span>
            <span className="text-[11px] font-semibold text-[#111]">{getDisplayLabel()}</span>
          </div>
          <div className="flex shrink-0 border-b border-[#c8c8c8] bg-[#dedede] text-[11px]">
            {(['Details', 'Layers'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 transition ${activeTab === tab ? 'border-b-2 border-[#111] bg-[#e8e8e8] font-semibold text-[#111]' : 'text-[#555] hover:bg-[#d4d4d4]'}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto bg-[#e8e8e8]">{activeTab === 'Details' ? renderDetails(true) : renderLayers(true)}</div>
          {isEditing && (
            <div className="flex shrink-0 items-center justify-end gap-1.5 border-t border-[#c8c8c8] bg-[#dedede] px-2 py-1.5">
              <button onClick={cancelEditing} className={`${gb} rounded-md px-2 py-1 text-[11px] font-medium`}>Cancel</button>
              <button onClick={deleteObj} className={`${gb} rounded-md px-2 py-1 text-[11px] font-medium`}>Delete</button>
              <div className="relative">
                <button type="button" onClick={() => setShowSaveMenu((p) => !p)} className={`${pb} rounded-md px-2 py-1 text-[11px] font-medium`}>Save ▾</button>
                {showSaveMenu && (
                  <div className="absolute bottom-full right-0 mb-1 min-w-[140px] overflow-hidden rounded-md border border-[#c8c8c8] bg-[#e8e8e8] shadow-lg">
                    <button type="button" onClick={() => saveChanges(false)} className="block w-full px-3 py-2 text-left text-[11px] text-[#111] hover:bg-[#d4d4d4]">Save</button>
                    <button type="button" onClick={() => saveChanges(true)} className="block w-full border-t border-[#c8c8c8] px-3 py-2 text-left text-[11px] text-[#111] hover:bg-[#d4d4d4]">Save & Continue</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* OBJECT EDITOR – desktop */}
      {selectedObjectId && !isMobile && (
        <div className="absolute inset-y-0 right-0 z-30 flex w-[320px] flex-col border-l border-[#c8c8c8] bg-[#e8e8e8]/98 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#c8c8c8] bg-[#dedede] px-3 py-2">
            <div className="text-sm font-semibold text-[#111]">Object Editor</div>
            <button type="button" onClick={closeEditor} className={`${ib} h-7 w-7 rounded-md text-sm font-bold`}>→</button>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-[#c8c8c8] bg-[#e8e8e8] px-3 py-2">
            <div className="truncate text-xs text-[#555]">Selected: <span className="font-semibold text-[#111]">{getDisplayLabel()}</span></div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={zoomToSelected} className={`${ib} h-8 w-8 rounded-md text-sm font-bold`}>⌖</button>
              {!isEditing && <button onClick={startEditing} className={`${gb} rounded-md px-3 py-1.5 text-xs font-medium`}>Edit</button>}
            </div>
          </div>
          <div className="flex border-b border-[#c8c8c8] bg-[#dedede] text-xs">
            {(['Details', 'Layers'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 transition ${activeTab === tab ? 'border-b-2 border-[#111] bg-[#e8e8e8] font-semibold text-[#111]' : 'text-[#555] hover:bg-[#d4d4d4]'}`}>{tab}</button>
            ))}
          </div>
          <div className={`${isEditing ? 'h-[calc(100%-120px)]' : 'h-[calc(100%-96px)]'} overflow-y-auto bg-[#e8e8e8]`}>{activeTab === 'Details' ? renderDetails(false) : renderLayers(false)}</div>
          {isEditing && (
            <div className="flex items-center justify-end gap-2 border-t border-[#c8c8c8] bg-[#dedede] px-2 py-2">
              <button onClick={cancelEditing} className={`${gb} rounded-md px-2.5 py-1.5 text-xs font-medium`}>Cancel</button>
              <button onClick={deleteObj} className={`${gb} rounded-md px-2.5 py-1.5 text-xs font-medium`}>Delete</button>
              <div className="relative">
                <button type="button" onClick={() => setShowSaveMenu((p) => !p)} className={`${pb} rounded-md px-2.5 py-1.5 text-xs font-medium`}>Save ▾</button>
                {showSaveMenu && (
                  <div className="absolute bottom-full right-0 mb-2 min-w-[160px] overflow-hidden rounded-md border border-[#c8c8c8] bg-[#e8e8e8] shadow-lg">
                    <button type="button" onClick={() => saveChanges(false)} className="block w-full px-3 py-2 text-left text-xs text-[#111] hover:bg-[#d4d4d4]">Save</button>
                    <button type="button" onClick={() => saveChanges(true)} className="block w-full border-t border-[#c8c8c8] px-3 py-2 text-left text-xs text-[#111] hover:bg-[#d4d4d4]">Save & Continue</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM PANEL: Object Table */}
      {showBottomPanel && !showProject && (
        <div className={`absolute bottom-0 left-0 right-0 z-40 border-t border-[#c8c8c8] bg-[#e8e8e8]/98 shadow-xl ${isMobile ? 'h-[30vh]' : 'h-[20vh] min-h-[140px] max-h-[190px]'}`}>
          <div className="flex items-center gap-1.5 border-b border-[#c8c8c8] bg-[#dedede] px-2 py-1.5 flex-wrap">
            <div className="mr-auto shrink-0 truncate text-[12px] font-semibold text-[#111]">{selectedObjectItem || 'Objects'}</div>
            <select value={tableFilterMode} onChange={() => {}} className="h-7 rounded-md border border-[#c8c8c8] bg-[#e8e8e8] px-1.5 text-[11px] font-medium text-[#111] outline-none"><option>By ID</option></select>
            <input value={tableFilterInput} onChange={(e) => setTableFilterInput(e.target.value)} placeholder="Filter…" className="h-7 w-[80px] rounded-md border border-[#c8c8c8] bg-white px-2 text-[11px] text-[#111] outline-none placeholder:text-[#888]" />
            <button type="button" onClick={() => setAppliedTableFilter(tableFilterInput)} className={`${pb} h-7 rounded-md px-2.5 text-[11px] font-semibold`}>Run</button>
            <button type="button" onClick={downloadTable} className={`${gb} h-7 rounded-md px-2.5 text-[11px] font-semibold`}>Download</button>
            <button onClick={() => setShowBottomPanel(false)} className={`${ib} h-7 w-7 rounded-md text-xs font-bold`}>↓</button>
          </div>
          <div className="h-[calc(100%-42px)] overflow-auto">
            <table className="min-w-full table-fixed text-[11px]">
              <thead className="sticky top-0 bg-[#dedede]">
                <tr className="text-left text-[#111]">
                  {['ID', 'Type', 'Status', 'Owner', 'Material', 'Height', 'Municipality', 'Design ID'].map((h) => (
                    <th key={h} className="truncate whitespace-nowrap px-2 py-[3px] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row.key} onClick={row.onClick} className={`h-[23px] leading-none transition-colors ${row.onClick ? 'cursor-pointer' : ''} ${row.selected ? 'border-l-2 border-l-[#111] bg-[#d4d4d4]' : idx % 2 === 0 ? 'bg-[#e8e8e8] hover:bg-[#d4d4d4]' : 'bg-[#efefef] hover:bg-[#d4d4d4]'}`}>
                    <td className="truncate px-2 py-[3px] font-medium text-[#111]">{row.id}</td>
                    <td className="truncate px-2 py-[3px] text-[#555]">{row.type}</td>
                    <td className="truncate px-2 py-[3px] text-[#555]">{row.status}</td>
                    <td className="truncate px-2 py-[3px] text-[#555]">{row.owner}</td>
                    <td className="truncate px-2 py-[3px] text-[#555]">{row.material}</td>
                    <td className="truncate px-2 py-[3px] text-[#555]">{row.height}</td>
                    <td className="truncate px-2 py-[3px] text-[#555]">{row.municipality}</td>
                    <td className="truncate px-2 py-[3px] text-[#555]">{row.designId}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (<tr><td colSpan={8} className="px-3 py-4 text-center text-[11px] text-[#888]">No records found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .vertical-zoom-slider::-webkit-slider-runnable-track { width:5px; border-radius:9999px; background:#c8c8c8; }
        .vertical-zoom-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:10px; height:10px; border-radius:9999px; background:#111; border:2px solid #e8e8e8; box-shadow:0 1px 3px rgba(0,0,0,.3); margin-left:-3px; }
        .vertical-zoom-slider::-moz-range-track { width:5px; border-radius:9999px; background:#c8c8c8; }
        .vertical-zoom-slider::-moz-range-thumb { width:10px; height:10px; border-radius:9999px; background:#111; border:2px solid #e8e8e8; box-shadow:0 1px 3px rgba(0,0,0,.3); }
      `}</style>
    </div>
  );
}