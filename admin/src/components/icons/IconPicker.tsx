import { useState, useRef, useEffect } from "react";
import {
  Wrench, Cpu, Hammer, Droplets, Palette, Zap, Shield, Check,
  Search, Gauge, Wind, Volume2, Eye, Settings, Star, Heart,
  Truck, Package, Clock, Award, Users, Bike, Fuel,
  Thermometer, AlertTriangle, FileText, Phone, Mail, MapPin,
  Calendar, ArrowRight, ChevronRight, ChevronLeft, ChevronDown,
  ChevronUp, X, Plus, Minus, Edit, Trash2, Upload, Download,
  ExternalLink, Share2, Copy, RefreshCw, Loader2,
  Home, User, ShoppingCart, Menu, Filter, Grid, List,
  Image, Video, File, Folder, Save, Printer, PieChart, BarChart3,
  TrendingUp, DollarSign, Percent, Tag, Barcode, Box, Layers,
  Server, Database, Cloud, Lock, Unlock, Key, Bell, MessageCircle,
  Send, Inbox, Radio, Wifi, Bluetooth, Battery, Power, Play,
  Pause, VolumeX, Maximize, Minimize,
  ZoomIn, ZoomOut, Move, RotateCcw, RotateCw, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, Underline, Code, Terminal,
  GitBranch, GitCommit, GitMerge, GitPullRequest, Globe, Compass, Map,
  Navigation, Flag, Bookmark, Cog, CircuitBoard,
  Activity, LifeBuoy, Headphones, Mic, Camera, Film, Music,
  Tv, Monitor, Smartphone, Tablet, Watch, Speaker, HardDrive, Cable,
  Plug, Lightbulb, Flame, Snowflake, Sun, Moon, CloudRain, CloudSnow,
  CloudLightning, Umbrella, Tent, Mountain, Fish, Bird,
  Bug, Leaf, Flower2, Trophy, Medal, Crown, Gem, Diamond,
  Glasses, Dog, Cat, Dumbbell, Briefcase, Building, Factory, Car,
  FlaskConical, Frown, Angry, Brain, BookOpen, Gift, Ear, Footprints,
  HeartHandshake, FishSymbol, PawPrint, Smile, Skull,
  Stethoscope, Pill, ThumbsUp, Scale, Shirt, Sparkles, Paintbrush,
  Workflow, ScanLine, TreePine, Warehouse, SortAsc, MoreHorizontal,
  Store
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICON_LIBRARY: Record<string, LucideIcon> = {
  wrench: Wrench, cpu: Cpu, hammer: Hammer, droplets: Droplets,
  palette: Palette, zap: Zap, shield: Shield, check: Check,
  search: Search, gauge: Gauge, wind: Wind, volume2: Volume2,
  eye: Eye, settings: Settings, star: Star, heart: Heart,
  truck: Truck, package: Package, clock: Clock, award: Award,
  users: Users, bike: Bike, fuel: Fuel,
  thermometer: Thermometer, alertTriangle: AlertTriangle, fileText: FileText,
  phone: Phone, mail: Mail, mapPin: MapPin, calendar: Calendar,
  arrowRight: ArrowRight, chevronRight: ChevronRight, chevronLeft: ChevronLeft,
  chevronDown: ChevronDown, chevronUp: ChevronUp, x: X, plus: Plus,
  minus: Minus, edit: Edit, trash2: Trash2, upload: Upload,
  download: Download, externalLink: ExternalLink, share2: Share2,
  copy: Copy, refreshCw: RefreshCw, loader2: Loader2,
  home: Home, user: User, ShoppingCart: ShoppingCart, menu: Menu,
  filter: Filter, grid: Grid, list: List, sortAsc: SortAsc,
  image: Image, video: Video, file: File, folder: Folder, save: Save,
  printer: Printer, pieChart: PieChart, barChart3: BarChart3,
  trendingUp: TrendingUp, dollarSign: DollarSign, percent: Percent,
  tag: Tag, barcode: Barcode, box: Box, layers: Layers,
  server: Server, database: Database, cloud: Cloud, lock: Lock,
  unlock: Unlock, key: Key, bell: Bell, messageCircle: MessageCircle,
  send: Send, inbox: Inbox, radio: Radio, wifi: Wifi,
  bluetooth: Bluetooth, battery: Battery, power: Power, play: Play,
  pause: Pause, volumeX: VolumeX, maximize: Maximize, minimize: Minimize,
  zoomIn: ZoomIn, zoomOut: ZoomOut, move: Move, rotateCcw: RotateCcw,
  rotateCw: RotateCw, alignLeft: AlignLeft, alignCenter: AlignCenter,
  alignRight: AlignRight, bold: Bold, italic: Italic,
  underline: Underline, code: Code, terminal: Terminal,
  gitBranch: GitBranch, gitCommit: GitCommit, gitMerge: GitMerge,
  gitPullRequest: GitPullRequest, globe: Globe, compass: Compass,
  map: Map, navigation: Navigation, flag: Flag, bookmark: Bookmark,
  cog: Cog, circuitBoard: CircuitBoard, activity: Activity,
  lifeBuoy: LifeBuoy, headphones: Headphones, mic: Mic,
  camera: Camera, film: Film, music: Music, tv: Tv,
  monitor: Monitor, smartphone: Smartphone, tablet: Tablet,
  watch: Watch, speaker: Speaker, hardDrive: HardDrive, cable: Cable,
  plug: Plug, lightbulb: Lightbulb, flame: Flame, snowflake: Snowflake,
  sun: Sun, moon: Moon, cloudRain: CloudRain, cloudSnow: CloudSnow,
  cloudLightning: CloudLightning, umbrella: Umbrella, tent: Tent,
  mountain: Mountain, fish: Fish, bird: Bird,
  bug: Bug, leaf: Leaf, flower2: Flower2, trophy: Trophy,
  medal: Medal, crown: Crown, gem: Gem, diamond: Diamond,
  glasses: Glasses, dog: Dog, cat: Cat, dumbbell: Dumbbell,
  briefcase: Briefcase, building: Building, factory: Factory,
  car: Car, flaskConical: FlaskConical, frown: Frown, angry: Angry,
  brain: Brain, bookOpen: BookOpen, gift: Gift, ear: Ear,
  footprints: Footprints, heartHandshake: HeartHandshake,
  fishSymbol: FishSymbol, pawPrint: PawPrint,
  smile: Smile, skull: Skull, stethoscope: Stethoscope, pill: Pill,
  thumbsUp: ThumbsUp, scale: Scale, shirt: Shirt, sparkles: Sparkles,
  paintbrush: Paintbrush, workflow: Workflow, scanLine: ScanLine,
  treePine: TreePine, warehouse: Warehouse,   store: Store,
};

const ICON_CATEGORIES = [
  { name: "Mecánica", icons: ["wrench", "cpu", "hammer", "droplets", "palette", "zap", "settings", "cog", "gauge", "thermometer", "fuel", "scanLine", "circuitBoard", "workflow", "activity"] },
  { name: "Vehículos", icons: ["bike", "car", "truck", "box", "package", "layers"] },
  { name: "Seguridad", icons: ["shield", "lock", "unlock", "key", "eye", "alertTriangle", "bell", "fire"] },
  { name: "Servicios", icons: ["search", "check", "refreshCw", "upload", "download", "save", "printer", "externalLink", "share2", "copy"] },
  { name: "Calidad", icons: ["star", "award", "medal", "crown", "gem", "diamond", "trophy", "heart", "thumbsUp"] },
  { name: "Comunicación", icons: ["phone", "mail", "messageCircle", "send", "inbox", "bell", "radio", "wifi", "bluetooth", "globe", "compass", "map", "navigation", "flag", "bookmark"] },
  { name: "Tiempo", icons: ["clock", "calendar", "watch", "sun", "moon", "cloud", "cloudRain", "cloudSnow", "cloudLightning", "umbrella"] },
  { name: "Naturaleza", icons: ["leaf", "flower2", "treePine", "mountain", "tent", "fish", "bird", "bug", "snowflake", "flame"] },
  { name: "Personas", icons: ["users", "user", "heart", "smile", "frown", "angry", "skull", "brain", "eye", "ear", "footprints"] },
  { name: "Negocios", icons: ["briefcase", "building", "factory", "store", "home", "warehouse"] },
  { name: "Salud", icons: ["stethoscope", "pill", "smile", "heart", "activity", "thermometer", "eye", "ear"] },
  { name: "Tecnología", icons: ["monitor", "smartphone", "tablet", "server", "database", "cloud", "hardDrive", "cable", "plug", "lightbulb", "power"] },
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  type: "lucide" | "svg";
  onTypeChange: (type: "lucide" | "svg") => void;
  label?: string;
  className?: string;
}

export function IconPicker({ value, onChange, type, onTypeChange, label, className = "" }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredIcons = search
    ? Object.keys(ICON_LIBRARY).filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : selectedCategory
      ? ICON_CATEGORIES.find(c => c.name === selectedCategory)?.icons || []
      : Object.keys(ICON_LIBRARY);

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".svg")) {
      alert("Solo se permiten archivos SVG");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const svgContent = ev.target?.result as string;
      setSvgPreview(svgContent);
      const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
      onChange(dataUrl);
    };
    reader.readAsText(file);
  };

  const renderPreview = () => {
    if (!value) return <span className="text-gray-500 text-sm">Sin icono</span>;
    if (type === "svg" || value.startsWith("data:") || value.startsWith("http") || value.startsWith("/")) {
      return <img src={value} alt="" className="w-6 h-6 object-contain" />;
    }
    const IconComp = ICON_LIBRARY[value];
    if (IconComp) return <IconComp size={24} />;
    return <span className="text-gray-500 text-sm">?</span>;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}

      <div className="flex gap-2">
        <button type="button" onClick={() => onTypeChange("lucide")}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${type === "lucide" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
          Icono Lucide
        </button>
        <button type="button" onClick={() => onTypeChange("svg")}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${type === "svg" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
          SVG Personalizado
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-700/50 rounded-lg">
          {renderPreview()}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300">
            {value ? (type === "lucide" ? `Lucide: ${value}` : "SVG Personalizado") : "Ningún icono seleccionado"}
          </p>
          {value && (
            <button type="button" onClick={() => { onChange(""); setSvgPreview(null); }}
              className="text-xs text-red-400 hover:text-red-300 mt-1">
              Quitar icono
            </button>
          )}
        </div>
      </div>

      {type === "lucide" ? (
        <div ref={dropdownRef} className="relative">
          <button type="button" onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-left text-sm text-gray-300 hover:border-emerald-500 transition-colors flex items-center justify-between">
            <span>{value || "Seleccionar icono..."}</span>
            <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
              <div className="p-2 border-b border-gray-700">
                <div className="relative">
                  <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Buscar icono..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    autoFocus />
                </div>
              </div>

              <div className="flex gap-1 p-2 border-b border-gray-700 overflow-x-auto">
                <button type="button" onClick={() => { setSelectedCategory(null); setSearch(""); }}
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${!selectedCategory ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                  Todos
                </button>
                {ICON_CATEGORIES.map(cat => (
                  <button key={cat.name} type="button" onClick={() => { setSelectedCategory(cat.name); setSearch(""); }}
                    className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${selectedCategory === cat.name ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="p-2 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-6 gap-1">
                  {filteredIcons.map(iconName => {
                    const IconComp = ICON_LIBRARY[iconName];
                    return (
                      <button key={iconName} type="button"
                        onClick={() => { onChange(iconName); setIsOpen(false); setSearch(""); }}
                        className={`p-2 rounded-lg text-center transition-all hover:bg-gray-700 group ${value === iconName ? "bg-emerald-600/20 ring-1 ring-emerald-500" : ""}`}
                        title={iconName}>
                        <IconComp size={20} className={`mx-auto ${value === iconName ? "text-emerald-400" : "text-gray-300 group-hover:text-white"}`} />
                      </button>
                    );
                  })}
                </div>
                {filteredIcons.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">No se encontraron iconos</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input ref={fileInputRef} type="file" accept=".svg" onChange={handleSvgUpload} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors flex flex-col items-center gap-2">
            <Upload size={24} />
            <span className="text-sm">{svgPreview ? "Cambiar SVG" : "Subir archivo SVG"}</span>
          </button>
          {svgPreview && (
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div dangerouslySetInnerHTML={{ __html: svgPreview }} className="w-16 h-16 mx-auto" />
            </div>
          )}
          <p className="text-xs text-gray-500">Solo archivos .svg. Se guardará como imagen inline.</p>
        </div>
      )}
    </div>
  );
}

export default IconPicker;
