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
  HeartHandshake, FishSymbol, Birdhouse, PawPrint, Smile, Skull,
  Stethoscope, Pill, ThumbsUp, Scale, Shirt, Sparkles, Paintbrush,
  Workflow, ScanLine, TreePine, Warehouse,
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
  filter: Filter, grid: Grid, list: List,
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
  fish: FishSymbol, birdhouse: Birdhouse, pawPrint: PawPrint,
  smile: Smile, skull: Skull, stethoscope: Stethoscope, pill: Pill,
  thumbsUp: ThumbsUp, scale: Scale, shirt: Shirt, sparkles: Sparkles,
  paintbrush: Paintbrush, workflow: Workflow, scanLine: ScanLine,
  treePine: TreePine, warehouse: Warehouse, store: Store, package: Package,
};

export const ICON_CATEGORIES = [
  { name: "Mecánica", icons: ["wrench", "cpu", "hammer", "droplets", "palette", "zap", "settings", "cog", "gauge", "thermometer", "fuel", "scanLine", "circuitBoard", "workflow", "activity"] },
  { name: "Vehículos", icons: ["bike", "car", "truck", "box", "package", "layers"] },
  { name: "Seguridad", icons: ["shield", "lock", "unlock", "key", "eye", "alertTriangle", "bell", "fire", "alarm"] },
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

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  fallback?: string;
}

export function IconRenderer({ name, size = 24, className = "", strokeWidth = 2, fallback = "wrench" }: IconRendererProps) {
  if (name.startsWith("http") || name.startsWith("/") || name.startsWith("data:")) {
    return (
      <img
        src={name}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ objectFit: "contain" }}
      />
    );
  }

  const IconComponent = ICON_LIBRARY[name] || ICON_LIBRARY[fallback];

  if (!IconComponent) {
    return <span className={className} style={{ width: size, height: size, display: "inline-block" }}>?</span>;
  }

  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}

export function useIcon(name: string) {
  if (name.startsWith("http") || name.startsWith("/") || name.startsWith("data:")) {
    return null;
  }
  return ICON_LIBRARY[name] || null;
}

export function getAvailableIcons(): string[] {
  return Object.keys(ICON_LIBRARY);
}

export function searchIcons(query: string): string[] {
  const lower = query.toLowerCase();
  return Object.keys(ICON_LIBRARY).filter(name =>
    name.toLowerCase().includes(lower)
  );
}

export default IconRenderer;
