export interface MotoBrand {
  name: string;
  models: string[];
}

export const MOTO_BRANDS: MotoBrand[] = [
  { name: "AKT", models: ["AK 100", "AK 125", "AK 125 SL", "CR5", "EVO 125", "EVO 150", "FLEX 125", "JET 4", "JET 5", "NKD 125", "SM 200", "SPECIAL 110", "TT 250", "TTR 150", "XM 200"] },
  { name: "BAJAJ", models: ["BOXER 100", "BOXER 125", "BOXER 150", "CALIBER", "DISCOVER 100", "DISCOVER 125", "DISCOVER 135", "DISCOVER 150", "DOMINAR 250", "DOMINAR 400", "PULSAR 125", "PULSAR 150", "PULSAR 160", "PULSAR 180", "PULSAR 200", "PULSAR 220"] },
  { name: "HONDA", models: ["BIZ", "C-70", "C-90", "CB 110", "CB 125", "CB 150", "CB 160", "CB 190R", "CLICK", "DIO 110", "NAVI 110", "WAVE 100", "XR 125", "XR 150", "XR 190", "XR 250", "XRE 190", "XRE 300"] },
  { name: "YAMAHA", models: ["AXIS", "BWS 100", "BWS 125", "CRYPTON", "FZ 15", "FZ 16", "FINO", "MT 03", "MT 07", "MT 09", "N-MAX", "R-15", "XTZ 125", "XTZ 150", "XTZ 250"] },
  { name: "SUZUKI", models: ["AX 100", "BEST 125", "DR 150", "DR 200", "GN 125", "GIXXER 150", "GIXXER 250", "GS 125", "HAYATE 110"] },
  { name: "KTM", models: ["DUKE 200", "DUKE 250", "DUKE 390"] },
  { name: "KAWASAKI", models: ["GTO 125", "KLX 150", "NINJA 250", "NINJA 300", "VERSYS 300", "VERSYS 650"] },
  { name: "BENELLI", models: ["180S", "251S", "302S", "752S", "LEONCINO", "TNT", "TRK"] },
  { name: "TVS", models: ["DAZZ", "FLAME", "NEO", "NTORQ", "RAIDER 125", "RTR 160", "RTR 200", "SPORT 100"] },
  { name: "HERO", models: ["DASH 110", "DASH 125", "ECO 100", "GLAMOUR", "HUNK 160", "HUNK 190", "IGNITOR 125", "SPLENDOR", "XPULSE 200"] },
  { name: "KYMCO", models: ["ACTIV 110", "AGILITY 125", "DOWNTOWN 300", "FLY 125", "LIKE 125", "TOP BOY 100", "X-TOWN 300"] },
  { name: "ROYAL ENFIELD", models: ["CLASSIC", "HIMALAYAN", "HNTR", "INTERCEPTOR", "METEOR"] },
];

export function getBrandModels(brand: string): string[] {
  return MOTO_BRANDS.find(b => b.name === brand)?.models ?? [];
}

export function isKnownModel(brand: string, model: string): boolean {
  return getBrandModels(brand).includes(model);
}
