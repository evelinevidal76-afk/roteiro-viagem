export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  brlPerUnit: number // cotação aproximada: quantos R$ = 1 unidade desta moeda
}

// Taxas aproximadas para planejamento — atualize conforme necessário
const USD: CurrencyInfo = { code: 'USD', symbol: '$', name: 'Dólar americano', brlPerUnit: 5.8 }
const EUR: CurrencyInfo = { code: 'EUR', symbol: '€', name: 'Euro', brlPerUnit: 6.3 }
const GBP: CurrencyInfo = { code: 'GBP', symbol: '£', name: 'Libra esterlina', brlPerUnit: 7.2 }
const ARS: CurrencyInfo = { code: 'ARS', symbol: '$', name: 'Peso argentino', brlPerUnit: 0.006 }
const MXN: CurrencyInfo = { code: 'MXN', symbol: '$', name: 'Peso mexicano', brlPerUnit: 0.30 }
const CLP: CurrencyInfo = { code: 'CLP', symbol: '$', name: 'Peso chileno', brlPerUnit: 0.006 }
const PEN: CurrencyInfo = { code: 'PEN', symbol: 'S/', name: 'Sol peruano', brlPerUnit: 1.54 }
const COP: CurrencyInfo = { code: 'COP', symbol: '$', name: 'Peso colombiano', brlPerUnit: 0.0014 }
const UYU: CurrencyInfo = { code: 'UYU', symbol: '$', name: 'Peso uruguaio', brlPerUnit: 0.15 }
const PYG: CurrencyInfo = { code: 'PYG', symbol: '₲', name: 'Guarani paraguaio', brlPerUnit: 0.00075 }
const BOB: CurrencyInfo = { code: 'BOB', symbol: 'Bs', name: 'Boliviano', brlPerUnit: 0.84 }
const VEF: CurrencyInfo = { code: 'USD', symbol: '$', name: 'Dólar (Venezuela)', brlPerUnit: 5.8 }
const JPY: CurrencyInfo = { code: 'JPY', symbol: '¥', name: 'Iene japonês', brlPerUnit: 0.038 }
const KRW: CurrencyInfo = { code: 'KRW', symbol: '₩', name: 'Won sul-coreano', brlPerUnit: 0.0042 }
const CNY: CurrencyInfo = { code: 'CNY', symbol: '¥', name: 'Yuan chinês', brlPerUnit: 0.80 }
const HKD: CurrencyInfo = { code: 'HKD', symbol: 'HK$', name: 'Dólar de Hong Kong', brlPerUnit: 0.74 }
const SGD: CurrencyInfo = { code: 'SGD', symbol: '$', name: 'Dólar de Singapura', brlPerUnit: 4.3 }
const MYR: CurrencyInfo = { code: 'MYR', symbol: 'RM', name: 'Ringgit malaio', brlPerUnit: 1.32 }
const THB: CurrencyInfo = { code: 'THB', symbol: '฿', name: 'Baht tailandês', brlPerUnit: 0.16 }
const IDR: CurrencyInfo = { code: 'IDR', symbol: 'Rp', name: 'Rupia indonésia', brlPerUnit: 0.00036 }
const AED: CurrencyInfo = { code: 'AED', symbol: 'د.إ', name: 'Dirham emiradense', brlPerUnit: 1.58 }
const EGP: CurrencyInfo = { code: 'EGP', symbol: '£', name: 'Libra egípcia', brlPerUnit: 0.12 }
const ZAR: CurrencyInfo = { code: 'ZAR', symbol: 'R', name: 'Rand sul-africano', brlPerUnit: 0.32 }
const TRY: CurrencyInfo = { code: 'TRY', symbol: '₺', name: 'Lira turca', brlPerUnit: 0.17 }
const CZK: CurrencyInfo = { code: 'CZK', symbol: 'Kč', name: 'Coroa tcheca', brlPerUnit: 0.26 }
const HUF: CurrencyInfo = { code: 'HUF', symbol: 'Ft', name: 'Florim húngaro', brlPerUnit: 0.016 }
const NZD: CurrencyInfo = { code: 'NZD', symbol: '$', name: 'Dólar neozelandês', brlPerUnit: 3.5 }
const AUD: CurrencyInfo = { code: 'AUD', symbol: '$', name: 'Dólar australiano', brlPerUnit: 3.8 }
const CAD: CurrencyInfo = { code: 'CAD', symbol: '$', name: 'Dólar canadense', brlPerUnit: 4.3 }
const PAB: CurrencyInfo = { code: 'USD', symbol: '$', name: 'Dólar (Panamá)', brlPerUnit: 5.8 }

export const AIRPORT_CURRENCY: Record<string, CurrencyInfo> = {
  // Brasil (não converte — moeda local já é BRL)
  GRU: { code: 'BRL', symbol: 'R$', name: 'Real brasileiro', brlPerUnit: 1 },
  GIG: { code: 'BRL', symbol: 'R$', name: 'Real brasileiro', brlPerUnit: 1 },
  BSB: { code: 'BRL', symbol: 'R$', name: 'Real brasileiro', brlPerUnit: 1 },
  SSA: { code: 'BRL', symbol: 'R$', name: 'Real brasileiro', brlPerUnit: 1 },
  // EUA
  JFK: USD, LGA: USD, EWR: USD, MIA: USD, FLL: USD, MCO: USD,
  ATL: USD, BOS: USD, DCA: USD, IAD: USD, LAX: USD, SFO: USD,
  ORD: USD, DFW: USD, IAH: USD, SEA: USD, LAS: USD, DEN: USD,
  PHX: USD, SAN: USD, TPA: USD, CLT: USD, DTW: USD, MSP: USD,
  // Canadá
  YYZ: CAD, YUL: CAD, YVR: CAD, YYC: CAD,
  // México
  CUN: MXN, MEX: MXN, GDL: MXN, MTY: MXN, SJD: MXN, PVR: MXN,
  // América Central / Caribe
  PTY: PAB,
  SJO: { code: 'CRC', symbol: '₡', name: 'Colón costarriquenho', brlPerUnit: 0.011 },
  GUA: { code: 'GTQ', symbol: 'Q', name: 'Quetzal guatemalteco', brlPerUnit: 0.74 },
  PUJ: USD, SDQ: USD, SJU: USD, HAV: { code: 'CUP', symbol: '$', name: 'Peso cubano', brlPerUnit: 0.24 },
  NAS: USD, MBJ: { code: 'JMD', symbol: '$', name: 'Dólar jamaicano', brlPerUnit: 0.037 },
  AUA: { code: 'AWG', symbol: 'ƒ', name: 'Florim arubano', brlPerUnit: 3.23 },
  CUR: { code: 'ANG', symbol: 'ƒ', name: 'Florim antilhano', brlPerUnit: 3.24 },
  BGI: { code: 'BBD', symbol: '$', name: 'Dólar de Barbados', brlPerUnit: 2.9 },
  // América do Sul
  EZE: ARS, AEP: ARS,
  SCL: CLP,
  LIM: PEN,
  BOG: COP, MDE: COP, CTG: COP,
  UIO: USD, GYE: USD,
  MVD: UYU,
  ASU: PYG,
  LPB: BOB, VVI: BOB,
  CCS: VEF,
  // Europa — zona euro
  CDG: EUR, ORY: EUR, NCE: EUR, MRS: EUR,
  MAD: EUR, BCN: EUR, AGP: EUR, SVQ: EUR, VLC: EUR, PMI: EUR,
  AMS: EUR, BRU: EUR,
  FRA: EUR, MUC: EUR, BER: EUR, TXL: EUR, HAM: EUR, DUS: EUR,
  FCO: EUR, MXP: EUR, LIN: EUR,
  VIE: EUR,
  ATH: EUR,
  HEL: EUR,
  LIS: EUR, OPO: EUR,
  // Europa — moeda própria
  LHR: GBP, LGW: GBP, STN: GBP,
  DUB: EUR,
  PRG: CZK,
  BUD: HUF,
  WAW: { code: 'PLN', symbol: 'zł', name: 'Zloty polonês', brlPerUnit: 1.44 },
  CPH: { code: 'DKK', symbol: 'kr', name: 'Coroa dinamarquesa', brlPerUnit: 0.85 },
  ARN: { code: 'SEK', symbol: 'kr', name: 'Coroa sueca', brlPerUnit: 0.56 },
  OSL: { code: 'NOK', symbol: 'kr', name: 'Coroa norueguesa', brlPerUnit: 0.56 },
  ZRH: { code: 'CHF', symbol: 'Fr', name: 'Franco suíço', brlPerUnit: 6.5 },
  GVA: { code: 'CHF', symbol: 'Fr', name: 'Franco suíço', brlPerUnit: 6.5 },
  IST: TRY, SAW: TRY,
  // Oriente Médio
  DXB: AED, AUH: AED,
  DOH: { code: 'QAR', symbol: 'ر.ق', name: 'Riyal catariano', brlPerUnit: 1.59 },
  RUH: { code: 'SAR', symbol: 'ر.س', name: 'Riyal saudita', brlPerUnit: 1.55 },
  TLV: { code: 'ILS', symbol: '₪', name: 'Shekel israelense', brlPerUnit: 1.56 },
  AMM: { code: 'JOD', symbol: 'د.أ', name: 'Dinar jordaniano', brlPerUnit: 8.18 },
  BEY: { code: 'USD', symbol: '$', name: 'Dólar (Líbano)', brlPerUnit: 5.8 },
  // Ásia
  NRT: JPY, HND: JPY,
  ICN: KRW,
  PEK: CNY, PVG: CNY,
  HKG: HKD,
  SIN: SGD,
  KUL: MYR,
  BKK: THB, DMK: THB,
  CGK: IDR,
  MNL: { code: 'PHP', symbol: '₱', name: 'Peso filipino', brlPerUnit: 0.10 },
  DEL: { code: 'INR', symbol: '₹', name: 'Rupia indiana', brlPerUnit: 0.070 },
  BOM: { code: 'INR', symbol: '₹', name: 'Rupia indiana', brlPerUnit: 0.070 },
  // África
  JNB: ZAR, CPT: ZAR,
  CAI: EGP,
  CMN: { code: 'MAD', symbol: 'د.م.', name: 'Dirham marroquino', brlPerUnit: 0.58 },
  NBO: { code: 'KES', symbol: 'KSh', name: 'Shilling queniano', brlPerUnit: 0.045 },
  ADD: { code: 'ETB', symbol: 'Br', name: 'Birr etíope', brlPerUnit: 0.099 },
  // Oceania
  SYD: AUD, MEL: AUD, BNE: AUD, PER: AUD,
  AKL: NZD, CHC: NZD,
}

export function getCurrencyByAirport(iataCode: string): CurrencyInfo {
  return AIRPORT_CURRENCY[iataCode?.toUpperCase()] || USD
}

export function formatLocalAmount(brl: number, currency: CurrencyInfo): string {
  if (currency.code === 'BRL') return `R$ ${brl.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  const local = brl / currency.brlPerUnit
  const formatted = local.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return `${currency.symbol} ${formatted} ${currency.code}`
}
