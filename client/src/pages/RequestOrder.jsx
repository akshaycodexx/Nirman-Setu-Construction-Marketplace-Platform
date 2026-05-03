import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomer } from '../context/CustomerContext';
import WhatsAppButton from '../components/WhatsAppButton';
import { Plus, Trash2, CheckCircle, ArrowLeft, ArrowRight, Loader2, User } from 'lucide-react';

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

const SLOTS = [
  { id: 'morning', label: 'Morning', time: '7 AM – 12 PM' },
  { id: 'evening', label: 'Evening', time: '12 PM – 6 PM' },
  { id: 'anytime', label: 'Anytime', time: 'Flexible' },
];

const TOTAL_STEPS = 4;

const emptyItem = () => ({ name: '', customName: '', quantity: '', unit: '' });

const getItemData = (categoryId, itemName) =>
  (ITEMS_MAP[categoryId] || []).find(it => it.name === itemName);

export default function RequestOrder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { customer } = useCustomer();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState(null);
  const [catSearch, setCatSearch] = useState('');

  const [form, setForm] = useState({
    category: params.get('category') || '',
    items: [emptyItem()],
    delivery: { address: '', city: '', pincode: '', date: '', slot: 'anytime' },
    customer: { name: '', phone: '', email: '' },
    notes: '',
  });

  useEffect(() => {
    if (params.get('category')) setStep(2);
  }, []);

  useEffect(() => {
    if (customer) {
      setForm(f => ({
        ...f,
        customer: { name: customer.name || '', phone: customer.phone || '', email: customer.email || '' },
      }));
    }
  }, [customer]);

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

  const canNext = () => {
    if (step === 1) return !!form.category;
    if (step === 2) return form.items.every(it => {
      const name = it.name === 'Other' ? it.customName : it.name;
      return name && it.quantity && Number(it.quantity) > 0 && it.unit;
    });
    if (step === 3) return form.delivery.address && form.delivery.city && form.delivery.date;
    if (step === 4) return form.customer.name && /^[6-9]\d{9}$/.test(form.customer.phone);
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        items: form.items.map(it => ({
          name: it.name === 'Other' ? it.customName : it.name,
          quantity: Number(it.quantity),
          unit: it.unit,
        })),
      };
      const customerToken = localStorage.getItem('customerToken');
      const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
      const { data } = await axios.post('/api/orders/request', payload, { headers });
      setSubmittedOrderId(data.orderId);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Request Submitted!</h1>
            <p className="text-gray-500 mb-6">Hum 2 ghante ke andar call/WhatsApp karenge best quote ke saath.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Tumhara Order ID</p>
              <p className="text-2xl font-black text-orange-500 tracking-wider">{submittedOrderId}</p>
              <p className="text-xs text-gray-400 mt-1">Is ID se order track kar sakte ho</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate(`/track/${submittedOrderId}`)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
                Track Order
              </button>
              <button onClick={() => { setSubmittedOrderId(null); setStep(1); setForm({ category: '', items: [emptyItem()], delivery: { address: '', city: '', pincode: '', date: '', slot: 'anytime' }, customer: { name: '', phone: '', email: '' }, notes: '' }); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
                Nayi Request
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
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-sm text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            {['Category', 'Items', 'Delivery', 'Contact'].map((label, i) => (
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
              <h2 className="text-xl font-bold text-gray-900 mb-1">Kya chahiye?</h2>
              <p className="text-gray-500 text-sm mb-4">Category select karo — 21 options available hain</p>

              {/* Search */}
              <input
                type="text"
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                placeholder="Search category..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

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
                  <div className="col-span-2 py-8 text-center text-gray-400 text-sm">No category found</div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Items ── */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">Kya kya chahiye?</h2>
              <p className="text-gray-500 text-sm mb-1">
                Category: <span className="font-medium text-orange-600">{selectedCat?.emoji} {selectedCat?.label}</span>
              </p>
              <p className="text-gray-400 text-xs mb-5">Items aur quantity batao</p>

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
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Item {i + 1}</p>
                      <div className="space-y-3">
                        {/* Item Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                          <select value={item.name} onChange={e => updateItem(i, 'name', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                            <option value="">-- Select Item --</option>
                            {itemOptions.map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                          </select>
                        </div>

                        {/* Custom name for Other */}
                        {item.name === 'Other' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item ka naam batao</label>
                            <input type="text" value={item.customName}
                              onChange={e => updateItem(i, 'customName', e.target.value)}
                              placeholder="Jaise: Fly Ash Brick"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                          </div>
                        )}

                        {/* Quantity + Unit */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" min="1" value={item.quantity}
                              onChange={e => updateItem(i, 'quantity', e.target.value)}
                              placeholder="e.g. 50"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                          </div>
                          <div className="w-36">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                              {!item.unit && <option value="">-- Unit --</option>}
                              {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={addItem}
                className="mt-3 flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium">
                <Plus className="w-4 h-4" /> Aur item add karo
              </button>
            </div>
          )}

          {/* ── Step 3: Delivery ── */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Delivery Details</h2>
              <p className="text-gray-500 text-sm mb-6">Kahan aur kab chahiye?</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Address <span className="text-red-400">*</span></label>
                  <textarea value={form.delivery.address} onChange={e => updateDelivery('address', e.target.value)}
                    placeholder="Gali, mohalla, landmark..." rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-400">*</span></label>
                    <input type="text" value={form.delivery.city} onChange={e => updateDelivery('city', e.target.value)}
                      placeholder="Ranchi"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input type="text" maxLength={6} value={form.delivery.pincode} onChange={e => updateDelivery('pincode', e.target.value)}
                      placeholder="834001"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery / Service Date <span className="text-red-400">*</span></label>
                  <input type="date" min={minDateStr} value={form.delivery.date} onChange={e => updateDelivery('date', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Slot</label>
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
              </div>
            </div>
          )}

          {/* ── Step 4: Contact ── */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Details</h2>
              <p className="text-gray-500 text-sm mb-4">Quote is number pe milega</p>
              {customer && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700">
                  <User className="w-4 h-4 shrink-0" />
                  <span>Logged in as <strong>{customer.name}</strong> — details pre-filled</span>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aapka Naam <span className="text-red-400">*</span></label>
                  <input type="text" value={form.customer.name} onChange={e => updateCustomer('name', e.target.value)}
                    placeholder="Poora naam"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Phone <span className="text-red-400">*</span></label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                    <input type="tel" maxLength={10} value={form.customer.phone}
                      onChange={e => updateCustomer('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  {form.customer.phone && !/^[6-9]\d{9}$/.test(form.customer.phone) && (
                    <p className="text-red-400 text-xs mt-1">Valid 10-digit number daalo</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="email" value={form.customer.email} onChange={e => updateCustomer('email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Koi special requirement hai toh batao..." rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>

                {/* Summary */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Order Summary</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="text-gray-400">Category:</span> {selectedCat?.emoji} {selectedCat?.label}</p>
                    <p><span className="text-gray-400">Items:</span> {form.items.map(it => `${it.name === 'Other' ? it.customName : it.name} (${it.quantity} ${it.unit})`).join(', ')}</p>
                    <p><span className="text-gray-400">Delivery:</span> {form.delivery.city}, {form.delivery.date && new Date(form.delivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canNext() || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : <><CheckCircle className="w-4 h-4" /> Submit Request</>}
            </button>
          )}
        </div>
      </div>

      <WhatsAppButton message="Nirman Setu pe order place karna chahta hoon, help chahiye" />
      <Footer />
    </div>
  );
}
