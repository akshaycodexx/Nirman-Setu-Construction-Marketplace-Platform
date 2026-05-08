import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomer } from '../context/CustomerContext';
import WhatsAppButton from '../components/WhatsAppButton';
import { Plus, Trash2, CheckCircle, ArrowLeft, ArrowRight, Loader2, User, Copy, Check } from 'lucide-react';
import useT from '../i18n/useT';

// ── All units pool ───────────────────────────────────────────────────────────
const ALL_UNITS = [
  'Piece', 'Set', 'Unit', 'Kg', 'Ton', 'Bag (50kg)', 'Bag (25kg)', 'Bag (20kg)',
  'Bag (40kg)', 'Litre', 'Bucket (20L)', 'Tin', 'Roll (90m)', 'Bundle',
  'CFT', 'Cubic Meter', 'Brass', 'Sqft', 'Sheet', 'Box', 'Slab', 'Panel',
  'Meter', 'Running Feet', 'Feet',
  'Day', 'Hour', 'Week', 'Month',
  'Trip', 'KL', 'KW', 'Thousand', 'Lakh',
  'Project', 'Room', 'Point', 'View',
];

// ── 21 Categories ────────────────────────────────────────────────────────────
const MASTER_CATEGORIES = [
  { id: 'basic_materials',    emoji: '🧱', label: 'Basic Materials',        desc: 'Cement, Sand, Bricks, Steel' },
  { id: 'structural',         emoji: '🏗️', label: 'Structural',             desc: 'Blocks, Slabs, Roofing' },
  { id: 'wood_carpentry',     emoji: '🪵', label: 'Wood & Carpentry',       desc: 'Timber, Plywood, Doors' },
  { id: 'chemicals',          emoji: '🧪', label: 'Chemicals',              desc: 'Waterproofing, Adhesive, Putty' },
  { id: 'paint_finishing',    emoji: '🎨', label: 'Paint & Finishing',      desc: 'Primer, Paint, Polish' },
  { id: 'flooring_tiling',    emoji: '🪟', label: 'Flooring & Tiling',      desc: 'Tiles, Marble, Granite' },
  { id: 'doors_windows',      emoji: '🚪', label: 'Doors & Windows',        desc: 'Wood, Steel, UPVC, Glass' },
  { id: 'interior_furniture', emoji: '🛋️', label: 'Interior & Furniture',   desc: 'Kitchen, Wardrobe, False Ceiling' },
  { id: 'electrical',         emoji: '💡', label: 'Electrical',             desc: 'Wires, Switches, Lights, Fans' },
  { id: 'plumbing_sanitary',  emoji: '🚿', label: 'Plumbing & Sanitary',    desc: 'Pipes, Fittings, Tanks' },
  { id: 'machinery',          emoji: '🚜', label: 'Machinery (Rental)',     desc: 'JCB, Crane, Mixer, Lift' },
  { id: 'transport',          emoji: '🚚', label: 'Transport',              desc: 'Truck, Dumper, Delivery' },
  { id: 'labour',             emoji: '👷', label: 'Labour & Workforce',     desc: 'Mason, Helper, Painter' },
  { id: 'contractors',        emoji: '🧑‍💼', label: 'Contractors',           desc: 'Civil, Interior, Architect' },
  { id: 'design_planning',    emoji: '📐', label: 'Design & Planning',      desc: 'House map, 3D design' },
  { id: 'shuttering',         emoji: '🔩', label: 'Shuttering & Scaffolding', desc: 'Plates, Pipes, Props' },
  { id: 'water_utilities',    emoji: '💧', label: 'Water & Utilities',      desc: 'Tanker, Borewell, Drainage' },
  { id: 'smart_features',     emoji: '🔌', label: 'Smart Features',         desc: 'Solar, CCTV, Automation' },
  { id: 'complete_services',  emoji: '🏡', label: 'Complete Services',      desc: 'Full construction, Renovation' },
  { id: 'commercial',         emoji: '🏢', label: 'Commercial & Industrial', desc: 'Warehouse, Factory, Office' },
  { id: 'support_services',   emoji: '🧠', label: 'Support Services',       desc: 'Estimation, Cleaning, Safety' },
];

// ── Items per category: { name, unit (default), units[] } ───────────────────
const ITEMS_MAP = {
  basic_materials: [
    { name: 'Cement OPC 43 Grade',       unit: 'Bag (50kg)',    units: ['Bag (50kg)', 'Ton'] },
    { name: 'Cement OPC 53 Grade',       unit: 'Bag (50kg)',    units: ['Bag (50kg)', 'Ton'] },
    { name: 'Cement PPC',                unit: 'Bag (50kg)',    units: ['Bag (50kg)', 'Ton'] },
    { name: 'White Cement',              unit: 'Bag (40kg)',    units: ['Bag (40kg)', 'Kg'] },
    { name: 'River Sand / Balu',         unit: 'CFT',           units: ['CFT', 'Ton', 'Brass', 'Cubic Meter'] },
    { name: 'M-Sand',                    unit: 'CFT',           units: ['CFT', 'Ton', 'Brass', 'Cubic Meter'] },
    { name: 'Aggregate 10mm (Gitti)',    unit: 'CFT',           units: ['CFT', 'Ton', 'Brass'] },
    { name: 'Aggregate 20mm (Gitti)',    unit: 'CFT',           units: ['CFT', 'Ton', 'Brass'] },
    { name: 'Aggregate 40mm (Gitti)',    unit: 'CFT',           units: ['CFT', 'Ton', 'Brass'] },
    { name: 'Red Bricks (Lal Eent)',     unit: 'Thousand',      units: ['Thousand', 'Piece', 'Lakh'] },
    { name: 'Fly Ash Bricks',           unit: 'Thousand',      units: ['Thousand', 'Piece', 'Lakh'] },
    { name: 'TMT Steel Fe500 (Sariya)',  unit: 'Kg',            units: ['Kg', 'Ton', 'Bundle'] },
    { name: 'TMT Steel Fe550',          unit: 'Kg',            units: ['Kg', 'Ton', 'Bundle'] },
    { name: 'Binding Wire',             unit: 'Kg',            units: ['Kg', 'Roll (90m)'] },
    { name: 'Stone / Boulder',          unit: 'CFT',           units: ['CFT', 'Ton', 'Brass'] },
    { name: 'RMC Concrete',             unit: 'Cubic Meter',   units: ['Cubic Meter', 'CFT'] },
    { name: 'Other',                    unit: 'Unit',          units: ALL_UNITS },
  ],
  structural: [
    { name: 'AAC Blocks',               unit: 'Cubic Meter',   units: ['Cubic Meter', 'Piece'] },
    { name: 'Hollow Blocks (Concrete)', unit: 'Piece',         units: ['Piece', 'Thousand'] },
    { name: 'Precast Slab',             unit: 'Sqft',          units: ['Sqft', 'Piece'] },
    { name: 'Cement Sheet',             unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Roofing Sheet (GI / Tin)', unit: 'Sheet',         units: ['Sheet', 'Sqft', 'Kg'] },
    { name: 'Fiber Roofing Sheet',      unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Shuttering / Centering Material', unit: 'Sqft',  units: ['Sqft', 'Set'] },
    { name: 'Other',                    unit: 'Unit',          units: ALL_UNITS },
  ],
  wood_carpentry: [
    { name: 'Timber / Wood',            unit: 'CFT',           units: ['CFT', 'Cubic Meter', 'Running Feet'] },
    { name: 'Plywood 6mm (4×8)',        unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Plywood 12mm (4×8)',       unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Plywood 18mm (4×8)',       unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'MDF Board',               unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Particle Board',          unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Laminates',               unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Veneer',                  unit: 'Sheet',         units: ['Sheet', 'Sqft'] },
    { name: 'Wooden Door',             unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Flush Door',              unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Window Frame (Wood)',     unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Other',                   unit: 'Unit',          units: ALL_UNITS },
  ],
  chemicals: [
    { name: 'Waterproofing Chemical',  unit: 'Litre',         units: ['Litre', 'Kg', 'Bucket (20L)'] },
    { name: 'Tile Adhesive',           unit: 'Bag (25kg)',    units: ['Bag (25kg)', 'Kg'] },
    { name: 'Wall Putty',              unit: 'Bag (20kg)',    units: ['Bag (20kg)', 'Kg'] },
    { name: 'Concrete Admixture',      unit: 'Litre',         units: ['Litre', 'Kg'] },
    { name: 'Grout (Tile Grout)',      unit: 'Kg',            units: ['Kg', 'Piece'] },
    { name: 'Sealant',                 unit: 'Piece',         units: ['Piece', 'Litre'] },
    { name: 'Epoxy',                   unit: 'Kg',            units: ['Kg', 'Set'] },
    { name: 'Curing Compound',         unit: 'Litre',         units: ['Litre', 'Kg'] },
    { name: 'POP (Plaster of Paris)',  unit: 'Bag (25kg)',    units: ['Bag (25kg)', 'Kg'] },
    { name: 'Other',                   unit: 'Unit',          units: ALL_UNITS },
  ],
  paint_finishing: [
    { name: 'Wall Primer',             unit: 'Litre',         units: ['Litre', 'Bucket (20L)'] },
    { name: 'Interior Wall Paint',     unit: 'Litre',         units: ['Litre', 'Bucket (20L)'] },
    { name: 'Exterior Wall Paint',     unit: 'Litre',         units: ['Litre', 'Bucket (20L)'] },
    { name: 'Distemper',               unit: 'Kg',            units: ['Kg', 'Bucket (20L)', 'Piece'] },
    { name: 'Texture Paint',           unit: 'Kg',            units: ['Kg', 'Bucket (20L)'] },
    { name: 'Wood Polish / Varnish',   unit: 'Litre',         units: ['Litre', 'Tin'] },
    { name: 'Metal / Iron Paint',      unit: 'Litre',         units: ['Litre', 'Tin'] },
    { name: 'Enamel Paint',            unit: 'Litre',         units: ['Litre', 'Tin'] },
    { name: 'Other',                   unit: 'Unit',          units: ALL_UNITS },
  ],
  flooring_tiling: [
    { name: 'Ceramic Floor Tiles',     unit: 'Sqft',          units: ['Sqft', 'Box', 'Piece'] },
    { name: 'Vitrified Floor Tiles',   unit: 'Sqft',          units: ['Sqft', 'Box', 'Piece'] },
    { name: 'Wall Tiles',              unit: 'Sqft',          units: ['Sqft', 'Box', 'Piece'] },
    { name: 'Marble',                  unit: 'Sqft',          units: ['Sqft', 'Slab', 'Piece'] },
    { name: 'Granite',                 unit: 'Sqft',          units: ['Sqft', 'Slab', 'Piece'] },
    { name: 'Stone Flooring',          unit: 'Sqft',          units: ['Sqft', 'Piece'] },
    { name: 'Anti-skid Tiles',         unit: 'Sqft',          units: ['Sqft', 'Box'] },
    { name: 'Tile Spacers',            unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Tile Grout',              unit: 'Kg',            units: ['Kg', 'Piece'] },
    { name: 'Other',                   unit: 'Unit',          units: ALL_UNITS },
  ],
  doors_windows: [
    { name: 'Wooden Door (with frame)',unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Flush Door',             unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Steel Security Door',    unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Aluminum Window',        unit: 'Piece',         units: ['Piece', 'Sqft', 'Set'] },
    { name: 'UPVC Window',            unit: 'Piece',         units: ['Piece', 'Sqft', 'Set'] },
    { name: 'Sliding Window',         unit: 'Piece',         units: ['Piece', 'Sqft'] },
    { name: 'Glass Panel (Plain)',    unit: 'Sqft',          units: ['Sqft', 'Piece'] },
    { name: 'Toughened Glass',        unit: 'Sqft',          units: ['Sqft', 'Piece'] },
    { name: 'Mosquito Net / Mesh',    unit: 'Sqft',          units: ['Sqft', 'Piece', 'Set'] },
    { name: 'Door Hardware (Handle, Lock, Hinge)', unit: 'Set', units: ['Set', 'Piece'] },
    { name: 'Other',                  unit: 'Unit',          units: ALL_UNITS },
  ],
  interior_furniture: [
    { name: 'Modular Kitchen',        unit: 'Project',       units: ['Project', 'Running Feet'] },
    { name: 'Wardrobe',               unit: 'Piece',         units: ['Piece', 'Running Feet'] },
    { name: 'Bed (Single)',           unit: 'Piece',         units: ['Piece'] },
    { name: 'Bed (Double)',           unit: 'Piece',         units: ['Piece'] },
    { name: 'Sofa',                   unit: 'Set',           units: ['Set', 'Piece'] },
    { name: 'Dining Table Set',       unit: 'Set',           units: ['Set', 'Piece'] },
    { name: 'Office Furniture',       unit: 'Set',           units: ['Set', 'Piece'] },
    { name: 'False Ceiling (POP)',    unit: 'Sqft',          units: ['Sqft', 'Project'] },
    { name: 'False Ceiling (Gypsum)',unit: 'Sqft',          units: ['Sqft', 'Project'] },
    { name: 'Wall Panel / Cladding', unit: 'Sqft',          units: ['Sqft', 'Panel'] },
    { name: 'Curtain / Blind',       unit: 'Set',           units: ['Set', 'Piece'] },
    { name: 'Other',                 unit: 'Unit',          units: ALL_UNITS },
  ],
  electrical: [
    { name: 'Electrical Wire / Cable', unit: 'Meter',        units: ['Meter', 'Roll (90m)', 'Running Feet'] },
    { name: 'Conduit Pipe (Electric)', unit: 'Meter',        units: ['Meter', 'Bundle', 'Running Feet'] },
    { name: 'Switches & Sockets Set', unit: 'Set',           units: ['Set', 'Piece'] },
    { name: 'MCB / Circuit Breaker',   unit: 'Piece',        units: ['Piece', 'Set'] },
    { name: 'DB Box / Panel Board',    unit: 'Piece',        units: ['Piece'] },
    { name: 'LED Bulb / Light',        unit: 'Piece',        units: ['Piece', 'Set'] },
    { name: 'Tube Light / Batten',    unit: 'Piece',        units: ['Piece', 'Set'] },
    { name: 'Ceiling Fan',            unit: 'Piece',        units: ['Piece'] },
    { name: 'Exhaust Fan',            unit: 'Piece',        units: ['Piece'] },
    { name: 'Inverter / UPS',         unit: 'Piece',        units: ['Piece'] },
    { name: 'Generator',              unit: 'Piece',        units: ['Piece'] },
    { name: 'Other',                  unit: 'Unit',         units: ALL_UNITS },
  ],
  plumbing_sanitary: [
    { name: 'PVC Pipe',               unit: 'Running Feet',  units: ['Running Feet', 'Meter', 'Piece'] },
    { name: 'CPVC Pipe (Hot/Cold)',   unit: 'Running Feet',  units: ['Running Feet', 'Meter', 'Piece'] },
    { name: 'GI / MS Pipe',          unit: 'Running Feet',  units: ['Running Feet', 'Meter'] },
    { name: 'Plumbing Fittings (Set)',unit: 'Set',           units: ['Set', 'Piece'] },
    { name: 'Water Tank 500L',        unit: 'Piece',         units: ['Piece'] },
    { name: 'Water Tank 1000L',       unit: 'Piece',         units: ['Piece'] },
    { name: 'Overhead Water Tank',    unit: 'Piece',         units: ['Piece', 'Litre'] },
    { name: 'Bathroom Fittings (Tap, Shower)', unit: 'Set', units: ['Set', 'Piece'] },
    { name: 'Indian Toilet (WC)',     unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Western Commode',        unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Wash Basin',            unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'Water Pump / Motor',    unit: 'Piece',         units: ['Piece'] },
    { name: 'Drainage Pipe',         unit: 'Running Feet',  units: ['Running Feet', 'Meter'] },
    { name: 'Other',                 unit: 'Unit',          units: ALL_UNITS },
  ],
  machinery: [
    { name: 'JCB (Mini Excavator)',  unit: 'Hour',          units: ['Hour', 'Day', 'Week'] },
    { name: 'JCB (Standard)',        unit: 'Hour',          units: ['Hour', 'Day', 'Week'] },
    { name: 'Excavator (Large)',     unit: 'Hour',          units: ['Hour', 'Day', 'Week'] },
    { name: 'Crane',                 unit: 'Hour',          units: ['Hour', 'Day', 'Week'] },
    { name: 'Concrete Mixer Machine',unit: 'Day',           units: ['Day', 'Hour', 'Week'] },
    { name: 'Vibrator Machine',      unit: 'Day',           units: ['Day', 'Hour'] },
    { name: 'Drill Machine',         unit: 'Day',           units: ['Day', 'Hour'] },
    { name: 'Cutting Machine',       unit: 'Day',           units: ['Day', 'Hour'] },
    { name: 'Lift / Material Hoist', unit: 'Day',           units: ['Day', 'Hour', 'Week'] },
    { name: 'Road Roller',           unit: 'Hour',          units: ['Hour', 'Day'] },
    { name: 'Piling Machine',        unit: 'Hour',          units: ['Hour', 'Day'] },
    { name: 'Other',                 unit: 'Day',           units: ['Day', 'Hour', 'Week'] },
  ],
  transport: [
    { name: 'Mini Truck / Chhota Hathi', unit: 'Trip',      units: ['Trip', 'Day'] },
    { name: '10-Wheeler Truck',      unit: 'Trip',          units: ['Trip', 'Day'] },
    { name: '12-Wheeler Truck',      unit: 'Trip',          units: ['Trip', 'Day'] },
    { name: 'Dumper',                unit: 'Trip',          units: ['Trip', 'Day'] },
    { name: 'Tractor',               unit: 'Trip',          units: ['Trip', 'Day'] },
    { name: 'Pickup Van',            unit: 'Trip',          units: ['Trip', 'Day', 'Hour'] },
    { name: 'Water Tanker',          unit: 'Trip',          units: ['Trip', 'KL', 'Day'] },
    { name: 'Material Delivery Service', unit: 'Trip',      units: ['Trip', 'Day'] },
    { name: 'Other',                 unit: 'Trip',          units: ['Trip', 'Day', 'Hour'] },
  ],
  labour: [
    { name: 'Mason / Mistri',        unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Helper / Labour',       unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Carpenter',             unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Painter',               unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Electrician',           unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Plumber',               unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Welder',                unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Tile Worker',           unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Bar Bender (Rod Worker)', unit: 'Day',         units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Skilled Labour',        unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
    { name: 'Security Guard',        unit: 'Month',         units: ['Month', 'Day', 'Week'] },
    { name: 'Other',                 unit: 'Day',           units: ['Day', 'Hour', 'Week', 'Month'] },
  ],
  contractors: [
    { name: 'Civil Contractor',      unit: 'Project',       units: ['Project', 'Sqft', 'Month'] },
    { name: 'Interior Contractor',   unit: 'Project',       units: ['Project', 'Sqft', 'Month'] },
    { name: 'Architect',             unit: 'Project',       units: ['Project', 'Month'] },
    { name: 'Structural Engineer',   unit: 'Project',       units: ['Project', 'Month'] },
    { name: 'Site Supervisor',       unit: 'Month',         units: ['Month', 'Day', 'Project'] },
    { name: 'Project Manager',       unit: 'Month',         units: ['Month', 'Day', 'Project'] },
    { name: 'Other',                 unit: 'Project',       units: ['Project', 'Month', 'Day'] },
  ],
  design_planning: [
    { name: 'House Map / Blueprint (2D)', unit: 'Project',  units: ['Project', 'Sqft'] },
    { name: '3D Elevation Design',   unit: 'View',          units: ['View', 'Project'] },
    { name: 'Full 3D Design',        unit: 'Project',       units: ['Project'] },
    { name: 'Interior Design Plan',  unit: 'Room',          units: ['Room', 'Project'] },
    { name: 'Structural Design',     unit: 'Project',       units: ['Project'] },
    { name: 'Material Estimation Report', unit: 'Project',  units: ['Project'] },
    { name: 'Vastu Consultation',    unit: 'Project',       units: ['Project'] },
    { name: 'Other',                 unit: 'Project',       units: ['Project', 'Unit'] },
  ],
  shuttering: [
    { name: 'Steel Shuttering Plates', unit: 'Sqft',        units: ['Sqft', 'Set', 'Day'] },
    { name: 'Wooden Shuttering / Ply', unit: 'Sheet',       units: ['Sheet', 'Sqft'] },
    { name: 'Centering Material (Set)', unit: 'Set',        units: ['Set', 'Sqft', 'Day'] },
    { name: 'Scaffolding Pipes',     unit: 'Running Feet',  units: ['Running Feet', 'Piece', 'Set'] },
    { name: 'Acrow Props / Supports', unit: 'Piece',        units: ['Piece', 'Set', 'Day'] },
    { name: 'H-Frames (Scaffolding)', unit: 'Set',         units: ['Set', 'Piece'] },
    { name: 'Other',                 unit: 'Unit',          units: ALL_UNITS },
  ],
  water_utilities: [
    { name: 'Water Supply Tanker',   unit: 'Trip',          units: ['Trip', 'KL', 'Day'] },
    { name: 'Borewell Drilling',     unit: 'Feet',          units: ['Feet', 'Project'] },
    { name: 'Borewell Pump & Motor', unit: 'Project',       units: ['Project', 'Piece'] },
    { name: 'Overhead Water Tank',   unit: 'Piece',         units: ['Piece', 'Litre'] },
    { name: 'Underground Sump',      unit: 'Project',       units: ['Project', 'Litre'] },
    { name: 'Drainage / Sewage Line', unit: 'Running Feet', units: ['Running Feet', 'Meter', 'Project'] },
    { name: 'Rain Water Harvesting', unit: 'Project',       units: ['Project'] },
    { name: 'Other',                 unit: 'Unit',          units: ALL_UNITS },
  ],
  smart_features: [
    { name: 'Solar Panel',           unit: 'KW',            units: ['KW', 'Panel', 'Set'] },
    { name: 'Solar Inverter',        unit: 'KW',            units: ['KW', 'Piece'] },
    { name: 'CCTV Camera',           unit: 'Piece',         units: ['Piece', 'Set'] },
    { name: 'DVR / NVR',             unit: 'Piece',         units: ['Piece'] },
    { name: 'Home Automation System',unit: 'Project',       units: ['Project', 'Room'] },
    { name: 'Smart Lock / Door Lock', unit: 'Piece',        units: ['Piece'] },
    { name: 'Video Door Phone',       unit: 'Set',          units: ['Set', 'Piece'] },
    { name: 'Security Alarm System', unit: 'Set',           units: ['Set', 'Project'] },
    { name: 'Intercom System',       unit: 'Set',           units: ['Set', 'Project'] },
    { name: 'Other',                 unit: 'Unit',          units: ALL_UNITS },
  ],
  complete_services: [
    { name: 'Full House Construction', unit: 'Sqft',        units: ['Sqft', 'Project'] },
    { name: 'Turnkey Project',        unit: 'Project',       units: ['Project', 'Sqft'] },
    { name: 'Renovation / Remodeling', unit: 'Project',     units: ['Project', 'Sqft', 'Room'] },
    { name: 'Painting Service (Labour + Material)', unit: 'Sqft', units: ['Sqft', 'Room', 'Project'] },
    { name: 'Waterproofing Work',    unit: 'Sqft',          units: ['Sqft', 'Project'] },
    { name: 'Flooring Work',         unit: 'Sqft',          units: ['Sqft', 'Project'] },
    { name: 'Electrical Work (Complete)', unit: 'Point',    units: ['Point', 'Project'] },
    { name: 'Plumbing Work (Complete)', unit: 'Point',      units: ['Point', 'Project'] },
    { name: 'False Ceiling Work',    unit: 'Sqft',          units: ['Sqft', 'Room', 'Project'] },
    { name: 'Other',                 unit: 'Project',       units: ['Project', 'Sqft', 'Unit'] },
  ],
  commercial: [
    { name: 'Warehouse Construction', unit: 'Sqft',         units: ['Sqft', 'Project'] },
    { name: 'Factory Setup',         unit: 'Project',       units: ['Project', 'Sqft'] },
    { name: 'Office Fit-out',        unit: 'Sqft',          units: ['Sqft', 'Project'] },
    { name: 'Shop / Retail Setup',   unit: 'Project',       units: ['Project', 'Sqft'] },
    { name: 'Tin Shed Construction', unit: 'Sqft',          units: ['Sqft', 'Project'] },
    { name: 'Industrial Shed',       unit: 'Sqft',          units: ['Sqft', 'Project'] },
    { name: 'Other',                 unit: 'Project',       units: ['Project', 'Sqft', 'Unit'] },
  ],
  support_services: [
    { name: 'Material Estimation',   unit: 'Project',       units: ['Project'] },
    { name: 'Site Cleaning',         unit: 'Day',           units: ['Day', 'Project'] },
    { name: 'Construction Waste Disposal', unit: 'Trip',    units: ['Trip', 'Day', 'Project'] },
    { name: 'Equipment Rental Support', unit: 'Day',        units: ['Day', 'Project'] },
    { name: 'Safety Equipment (Helmet, Gloves, Boots)', unit: 'Set', units: ['Set', 'Piece'] },
    { name: 'Safety Net',            unit: 'Sqft',          units: ['Sqft', 'Set'] },
    { name: 'Temporary Labour Accommodation', unit: 'Month', units: ['Month', 'Day'] },
    { name: 'Other',                 unit: 'Unit',          units: ALL_UNITS },
  ],
};

// ── Popular brands per category ──────────────────────────────────────────────
const BRAND_MAP = {
  basic_materials:    ['Ultratech', 'JK Cement', 'ACC', 'Ambuja', 'Shree Cement', 'Wonder Cement', 'Tata Steel', 'SAIL', 'Hiscon'],
  structural:         ['Ultratech', 'ACC', 'Ambuja', 'JK Cement', 'Shree Cement'],
  wood_carpentry:     ['CenturyPly', 'Greenply', 'Kitply', 'National Plywood', 'Duratuf', 'Merino', 'Greenlam'],
  chemicals:          ['Dr. Fixit', 'Pidilite', 'Fosroc', 'STP', 'MYK Laticrete', 'Fevicol', 'Sika'],
  paint_finishing:    ['Asian Paints', 'Berger', 'Nerolac', 'Dulux', 'Indigo', 'Nippon Paint', 'Jotun'],
  flooring_tiling:    ['Kajaria', 'Somany', 'Johnson Tiles', 'Orient Bell', 'Nitco', 'RAK Ceramics', 'Simpolo'],
  doors_windows:      ['Godrej', 'Fenesta', 'Veka', 'Rehau', 'Alumil', 'Jindal', 'Yale'],
  interior_furniture: ['Hafele', 'Hettich', 'Godrej Interio', 'Nilkamal', 'Durian', 'Stanley'],
  electrical:         ['Havells', 'Polycab', 'Finolex', 'Schneider', 'Anchor', 'Legrand', 'Syska', 'Crompton', 'Bajaj'],
  plumbing_sanitary:  ['Jaquar', 'Hindware', 'Cera', 'Parryware', 'Astral', 'Finolex Pipes', 'Ashirvad', 'Supreme', 'VECTUS'],
  smart_features:     ['Havells', 'Schneider', 'Honeywell', 'Hikvision', 'CP Plus', 'Luminous', 'Microtek'],
};

const DRAFT_KEY = 'ns_order_draft';

// ── Compress image to ≤ 1200px / JPEG 0.72 ───────────────────────────────────
const compressImage = (file) => new Promise((resolve) => {
  const img = new Image();
  const blobUrl = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(blobUrl);
    const MAX = 1200;
    const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(img.width  * ratio);
    canvas.height = Math.round(img.height * ratio);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/jpeg', 0.72));
  };
  img.src = blobUrl;
});

const SLOTS = [
  { id: 'morning', label: 'Morning', time: '7 AM – 12 PM' },
  { id: 'evening', label: 'Evening', time: '12 PM – 6 PM' },
  { id: 'anytime', label: 'Anytime', time: 'Flexible' },
];

const TOTAL_STEPS = 4;

const emptyItem = () => ({ name: '', customName: '', quantity: '', unit: '', brandSel: '', brandCustom: '', itemNote: '' });

const getItemData = (categoryId, itemName) =>
  (ITEMS_MAP[categoryId] || []).find(it => it.name === itemName);

export default function RequestOrder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { customer } = useCustomer();
  const t = useT();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState(null);
  const [catSearch, setCatSearch] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const urlCat = params.get('category');
  const validUrlCat = urlCat && ITEMS_MAP[urlCat] ? urlCat : '';

  const [form, setForm] = useState({
    category: validUrlCat,
    items: [emptyItem()],
    delivery: { address: '', city: '', pincode: '', date: '', slot: 'anytime' },
    customer: { name: '', phone: '', email: '' },
    notes: '',
    isUrgent: false,
    budget: '',
    gstRequired: false,
    gstin: '',
    paymentPref: 'advance',
  });

  useEffect(() => {
    if (validUrlCat) setStep(2);
  }, []);

  useEffect(() => {
    if (customer) {
      setForm(f => ({
        ...f,
        customer: { name: customer.name || '', phone: customer.phone || '', email: customer.email || '' },
      }));
    }
  }, [customer]);

  // Draft check on mount
  useEffect(() => {
    setHasDraft(!!localStorage.getItem(DRAFT_KEY));
  }, []);

  // Recent orders for Quick Reorder (fetch once when customer is available)
  useEffect(() => {
    if (!customer) return;
    const token = localStorage.getItem('customerToken');
    if (!token) return;
    setRecentLoading(true);
    axios.get('/api/orders/my-orders?limit=5', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setRecentOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, [customer]);

  // Pincode availability check (debounced 800ms)
  useEffect(() => {
    const pc = form.delivery.pincode;
    if (pc.length !== 6) { setPincodeStatus(null); return; }
    setPincodeStatus('checking');
    const timer = setTimeout(() => {
      axios.get(`/api/check/pincode?pincode=${pc}`)
        .then(({ data }) => {
          if (data.supplierCount > 2 || data.available === true) setPincodeStatus('available');
          else if (data.supplierCount > 0 || data.limited === true) setPincodeStatus('limited');
          else setPincodeStatus('unavailable');
        })
        .catch(() => setPincodeStatus(null));
    }, 800);
    return () => clearTimeout(timer);
  }, [form.delivery.pincode]);

  const itemOptions = ITEMS_MAP[form.category] || [];

  const setCategory = (cat) => {
    setForm(f => ({ ...f, category: cat, items: [emptyItem()] }));
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const updateItem = (i, field, value) => {
    setForm(f => {
      const items = [...f.items];
      if (field === 'name') {
        const data = getItemData(f.category, value);
        items[i] = { ...items[i], name: value, unit: data?.unit || '', customName: '' };
      } else {
        items[i] = { ...items[i], [field]: value };
      }
      return { ...f, items };
    });
  };

  const updateDelivery = (field, value) => setForm(f => ({ ...f, delivery: { ...f.delivery, [field]: value } }));
  const updateCustomer = (field, value) => setForm(f => ({ ...f, customer: { ...f.customer, [field]: value } }));

  const copyOrderId = () => {
    navigator.clipboard.writeText(submittedOrderId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = 5 - photos.length;
    if (remaining <= 0) { toast.error(t('req.photo.maxErr')); return; }
    const oversized = files.some(f => f.size > 5 * 1024 * 1024);
    if (oversized) { toast.error(t('req.photo.sizeErr')); return; }
    const toAdd = files.slice(0, remaining).map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setPhotos(p => [...p, ...toAdd]);
    e.target.value = '';
  };

  const removePhoto = (id) => {
    setPhotos(p => {
      const found = p.find(ph => ph.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return p.filter(ph => ph.id !== id);
    });
  };

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
    toast.success(t('req.draft.saved'));
  };

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const { form: f, step: s } = JSON.parse(raw);
      setForm(f);
      setStep(s);
    } catch (_) {}
    setHasDraft(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  const quickReorder = (order) => {
    if (!ITEMS_MAP[order.category]) return;
    setForm(f => ({
      ...f,
      category: order.category,
      items: (order.items || []).slice(0, 8).map(it => ({
        ...emptyItem(),
        name: it.name || '',
        quantity: String(it.quantity || ''),
        unit: it.unit || '',
      })),
    }));
    setStep(2);
  };

  const canNext = () => {
    if (step === 1) return !!form.category;
    if (step === 2) return form.items.every(it => {
      const name = it.name === 'Other' ? it.customName : it.name;
      return name && it.quantity && Number(it.quantity) > 0 && it.unit;
    });
    if (step === 3) return form.delivery.address && form.delivery.city && form.delivery.date;
    if (step === 4) {
      const phoneOk = /^[6-9]\d{9}$/.test(form.customer.phone);
      const gstOk = !form.gstRequired || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(form.gstin);
      return form.customer.name && phoneOk && gstOk;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const compressedPhotos = photos.length > 0
        ? await Promise.all(photos.map(p => compressImage(p.file)))
        : [];
      const payload = {
        ...form,
        items: form.items.map(it => {
          const brand = it.brandSel === '__custom__' ? it.brandCustom : it.brandSel;
          return {
            name: it.name === 'Other' ? it.customName : it.name,
            quantity: Number(it.quantity),
            unit: it.unit,
            ...(brand      && { brand }),
            ...(it.itemNote && { note: it.itemNote }),
          };
        }),
        urgentDelivery: { isUrgent: form.isUrgent },
        ...(form.budget              && { budget: Number(form.budget) }),
        ...(form.gstRequired         && { gstin: form.gstin }),
        ...(compressedPhotos.length  && { photos: compressedPhotos }),
        paymentPref: form.paymentPref,
      };
      const customerToken = localStorage.getItem('customerToken');
      const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
      const { data } = await axios.post('/api/orders/request', payload, { headers });
      setSubmittedOrderId(data.orderId);
      localStorage.removeItem(DRAFT_KEY);
      toast.success('Order submitted! We will contact you shortly.');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const selectedCat = MASTER_CATEGORIES.find(c => c.id === form.category);
  const filteredCats = catSearch
    ? MASTER_CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(catSearch.toLowerCase()) ||
        c.desc.toLowerCase().includes(catSearch.toLowerCase()))
    : MASTER_CATEGORIES;

  // Success screen
  if (submittedOrderId) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('req.success.title')}</h1>
            <p className="text-gray-500 mb-6">{t('req.success.sub')}</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">{t('req.success.idLabel')}</p>
              <p className="text-2xl font-black text-orange-500 tracking-wider">{submittedOrderId}</p>
              <p className="text-xs text-gray-400 mt-1">{t('req.success.trackHint')}</p>
              <button onClick={copyOrderId}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                {copiedId
                  ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-medium">{t('req.success.copied')}</span></>
                  : <><Copy className="w-3.5 h-3.5" />{t('req.success.copyId')}</>}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate(`/track/${submittedOrderId}`)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
                {t('req.success.trackBtn')}
              </button>
              <button onClick={() => { photos.forEach(p => URL.revokeObjectURL(p.preview)); setPhotos([]); setSubmittedOrderId(null); setCopiedId(false); setStep(1); setForm({ category: '', items: [emptyItem()], delivery: { address: '', city: '', pincode: '', date: '', slot: 'anytime' }, customer: { name: '', phone: '', email: '' }, notes: '', isUrgent: false, budget: '', gstRequired: false, gstin: '', paymentPref: 'advance' }); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
                {t('req.success.newReq')}
              </button>
            </div>
          </div>
        </div>
        <WhatsAppButton message="Nirman Setu pe order place karna chahta hoon, help chahiye" />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Draft banner */}
        {hasDraft && (
          <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">📝</span>
            <p className="flex-1 text-sm text-amber-800 font-medium">{t('req.draft.banner')}</p>
            <button onClick={loadDraft}
              className="shrink-0 text-sm font-semibold text-amber-700 hover:text-amber-900 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors">
              {t('req.draft.continue')}
            </button>
            <button onClick={discardDraft}
              className="shrink-0 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              {t('req.draft.discard')}
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{t('req.step', { n: step, total: TOTAL_STEPS })}</span>
            <span className="text-sm text-gray-400">{t('req.complete', { pct: Math.round((step / TOTAL_STEPS) * 100) })}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            {[t('req.steps.category'), t('req.steps.items'), t('req.steps.delivery'), t('req.steps.contact')].map((label, i) => (
              <span key={label} className={`text-xs ${i + 1 <= step ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* ── Step 1: Category ── */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t('req.s1.title')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('req.s1.sub')}</p>

              {/* Search */}
              <input
                type="text"
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                placeholder={t('req.catSearch')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {/* Quick Reorder — only for logged-in customers with past orders */}
              {customer && (recentLoading || recentOrders.length > 0) && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {t('req.reorder.title')}
                  </p>
                  {recentLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('common.loading')}
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                      {recentOrders.map(order => {
                        const cat = MASTER_CATEGORIES.find(c => c.id === order.category);
                        return (
                          <button key={order.orderId || order._id}
                            onClick={() => quickReorder(order)}
                            className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-100 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left max-w-50">
                            <span className="text-xl shrink-0">{cat?.emoji || '📦'}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-700 truncate">{cat?.label || order.category}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {(order.items || []).slice(0, 2).map(it => it.name).join(', ')}
                              </p>
                            </div>
                            <span className="text-xs text-orange-500 font-semibold shrink-0">
                              {t('req.reorder.btn')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredCats.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                      form.category === cat.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{cat.emoji}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-tight ${form.category === cat.id ? 'text-orange-700' : 'text-gray-800'}`}>
                        {cat.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight line-clamp-2">{cat.desc}</p>
                    </div>
                  </button>
                ))}
                {filteredCats.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-gray-400 text-sm">{t('req.catNone')}</div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Items ── */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">{t('req.s2.title')}</h2>
              <p className="text-gray-500 text-sm mb-1">
                {t('req.steps.category')}: <span className="font-medium text-orange-600">{selectedCat?.emoji} {selectedCat?.label}</span>
              </p>
              <p className="text-gray-400 text-xs mb-5">{t('req.s2.sub')}</p>

              <div className="space-y-4">
                {form.items.map((item, i) => {
                  const itemData = getItemData(form.category, item.name);
                  const availableUnits = itemData?.units || ALL_UNITS;
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 relative">
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(i)}
                          className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">{t('req.item.label', { n: i + 1 })}</p>
                      <div className="space-y-3">
                        {/* Item Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.item.name')}</label>
                          <select value={item.name} onChange={e => updateItem(i, 'name', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                            <option value="">{t('req.item.select')}</option>
                            {itemOptions.map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                          </select>
                        </div>

                        {/* Custom name for Other */}
                        {item.name === 'Other' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.item.customName')}</label>
                            <input type="text" value={item.customName}
                              onChange={e => updateItem(i, 'customName', e.target.value)}
                              placeholder="Jaise: Fly Ash Brick"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                          </div>
                        )}

                        {/* Quantity + Unit */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.item.qty')}</label>
                            <input type="number" min="1" value={item.quantity}
                              onChange={e => updateItem(i, 'quantity', e.target.value)}
                              placeholder="e.g. 50"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                          </div>
                          <div className="w-36">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.item.unit')}</label>
                            <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                              {!item.unit && <option value="">{t('req.item.unitSelect')}</option>}
                              {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Brand preference — only for categories that have brands */}
                        {BRAND_MAP[form.category] && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.item.brand')}</label>
                            <select value={item.brandSel}
                              onChange={e => updateItem(i, 'brandSel', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                              <option value="">{t('req.item.brandSelect')}</option>
                              {BRAND_MAP[form.category].map(b => <option key={b} value={b}>{b}</option>)}
                              <option value="__custom__">{t('req.item.brandOther')}</option>
                            </select>
                            {item.brandSel === '__custom__' && (
                              <input type="text" value={item.brandCustom}
                                onChange={e => updateItem(i, 'brandCustom', e.target.value)}
                                placeholder={t('req.item.brandTypePh')}
                                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                            )}
                          </div>
                        )}

                        {/* Item note */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.item.note')}</label>
                          <input type="text" value={item.itemNote}
                            onChange={e => updateItem(i, 'itemNote', e.target.value)}
                            placeholder={t('req.item.notePh')}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={addItem}
                className="mt-3 flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium">
                <Plus className="w-4 h-4" /> {t('req.item.add')}
              </button>
            </div>
          )}

          {/* ── Step 3: Delivery ── */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t('req.s3.title')}</h2>
              <p className="text-gray-500 text-sm mb-6">{t('req.s3.sub')}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.del.address')} <span className="text-red-400">*</span></label>
                  <textarea value={form.delivery.address} onChange={e => updateDelivery('address', e.target.value)}
                    placeholder={t('req.del.addressPh')} rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>
                <div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.del.city')} <span className="text-red-400">*</span></label>
                      <input type="text" value={form.delivery.city} onChange={e => updateDelivery('city', e.target.value)}
                        placeholder="Ranchi"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.del.pincode')}</label>
                      <input type="text" maxLength={6} value={form.delivery.pincode}
                        onChange={e => updateDelivery('pincode', e.target.value.replace(/\D/g, ''))}
                        placeholder="834001"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                          pincodeStatus === 'available'   ? 'border-green-400' :
                          pincodeStatus === 'limited'     ? 'border-yellow-400' :
                          pincodeStatus === 'unavailable' ? 'border-red-300' : 'border-gray-200'
                        }`} />
                    </div>
                  </div>
                  {pincodeStatus && (
                    <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                      pincodeStatus === 'checking'    ? 'text-gray-400' :
                      pincodeStatus === 'available'   ? 'text-green-600' :
                      pincodeStatus === 'limited'     ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {pincodeStatus === 'checking'    && <Loader2 className="w-3 h-3 animate-spin" />}
                      {pincodeStatus === 'available'   && <CheckCircle className="w-3 h-3" />}
                      {pincodeStatus === 'limited'     && <span>⚠️</span>}
                      {pincodeStatus === 'unavailable' && <span>✕</span>}
                      <span>{t(`req.pincode.${pincodeStatus}`)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.del.date')} <span className="text-red-400">*</span></label>
                  <input type="date" min={minDateStr} value={form.delivery.date} onChange={e => updateDelivery('date', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('req.del.slot')}</label>
                  <div className="flex gap-3">
                    {SLOTS.map(s => (
                      <button key={s.id} onClick={() => updateDelivery('slot', s.id)}
                        className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm transition-all ${
                          form.delivery.slot === s.id ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                        }`}>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs opacity-70">{s.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgent delivery */}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isUrgent: !f.isUrgent }))}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    form.isUrgent
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    form.isUrgent ? 'bg-red-500 border-red-500' : 'border-gray-300'
                  }`}>
                    {form.isUrgent && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${form.isUrgent ? 'text-red-700' : 'text-gray-700'}`}>
                      {t('req.del.urgent')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t('req.del.urgentSub')}</p>
                  </div>
                </button>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.del.budget')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                    <input type="number" min="0" value={form.budget}
                      onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                      placeholder={t('req.del.budgetPh')}
                      className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('req.del.budgetNote')}</p>
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.photo.label')}</label>
                  <p className="text-xs text-gray-400 mb-3">{t('req.photo.sub')}</p>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {photos.map(ph => (
                        <div key={ph.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                          <img src={ph.preview} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(ph.id)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < 5 && (
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl text-sm text-gray-500 hover:text-orange-500 transition-colors">
                        <Plus className="w-4 h-4" />
                        {t('req.photo.add')} ({photos.length}/5)
                      </span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Contact ── */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t('req.s4.title')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('req.s4.sub')}</p>
              {customer && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{t('req.con.loggedIn', { name: customer.name })}</span>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.con.name')} <span className="text-red-400">*</span></label>
                  <input type="text" value={form.customer.name} onChange={e => updateCustomer('name', e.target.value)}
                    placeholder="Poora naam"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.con.phone')} <span className="text-red-400">*</span></label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                    <input type="tel" maxLength={10} value={form.customer.phone}
                      onChange={e => updateCustomer('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  {form.customer.phone && !/^[6-9]\d{9}$/.test(form.customer.phone) && (
                    <p className="text-red-400 text-xs mt-1">{t('req.phoneInvalid')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.con.email')} <span className="text-gray-400 font-normal">({t('common.optional')})</span></label>
                  <input type="email" value={form.customer.email} onChange={e => updateCustomer('email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.con.notes')} <span className="text-gray-400 font-normal">({t('common.optional')})</span></label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={t('req.con.notesPh')} rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>

                {/* GST Invoice toggle */}
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, gstRequired: !f.gstRequired, gstin: f.gstRequired ? '' : f.gstin }))}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    form.gstRequired ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    form.gstRequired ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {form.gstRequired && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${form.gstRequired ? 'text-blue-700' : 'text-gray-700'}`}>{t('req.gst.toggle')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t('req.gst.sub')}</p>
                  </div>
                </button>

                {form.gstRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('req.gst.gstin')} <span className="text-red-400">*</span></label>
                    <input type="text" maxLength={15} value={form.gstin}
                      onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                      placeholder={t('req.gst.gstinPh')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono tracking-wider" />
                    {form.gstin && form.gstin.length > 0 && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(form.gstin) && (
                      <p className="text-red-400 text-xs mt-1">{t('req.gst.invalid')}</p>
                    )}
                  </div>
                )}

                {/* Payment preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('req.pay.label')}</label>
                  <div className="space-y-2">
                    {[
                      { id: 'advance', key: 'req.pay.advance' },
                      { id: 'cod',     key: 'req.pay.cod' },
                      { id: 'credit',  key: 'req.pay.credit' },
                    ].map(opt => (
                      <button key={opt.id} type="button"
                        onClick={() => setForm(f => ({ ...f, paymentPref: opt.id }))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm transition-all ${
                          form.paymentPref === opt.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                            : 'border-gray-100 text-gray-600 hover:border-gray-200'
                        }`}>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          form.paymentPref === opt.id ? 'border-orange-500' : 'border-gray-300'
                        }`}>
                          {form.paymentPref === opt.id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                        </div>
                        {t(opt.key)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{t('req.con.summary')}</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="text-gray-400">{t('req.steps.category')}:</span> {selectedCat?.emoji} {selectedCat?.label}</p>
                    <p><span className="text-gray-400">{t('req.steps.items')}:</span> {form.items.map(it => `${it.name === 'Other' ? it.customName : it.name} (${it.quantity} ${it.unit})`).join(', ')}</p>
                    <p><span className="text-gray-400">{t('req.steps.delivery')}:</span> {form.delivery.city}, {form.delivery.date && new Date(form.delivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {form.budget && <p><span className="text-gray-400">Budget:</span> ₹{Number(form.budget).toLocaleString('en-IN')}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> {t('common.back')}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {t('common.next')} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canNext() || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('req.submitting')}</>
                : <><CheckCircle className="w-4 h-4" /> {t('req.submit')}</>}
            </button>
          )}
        </div>

        <div className="text-center mt-3">
          <button onClick={saveDraft}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline-offset-2 hover:underline">
            {t('req.draft.saveBtn')}
          </button>
        </div>
      </div>

      <WhatsAppButton message="Nirman Setu pe order place karna chahta hoon, help chahiye" />
      <Footer />
    </div>
  );
}
