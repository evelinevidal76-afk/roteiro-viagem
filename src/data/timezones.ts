// UTC offsets por código IATA (horário padrão, sem considerar horário de verão)
// Fórmula: chegada_local = partida_origem + duração + (offset_destino - offset_origem)
export const AIRPORT_OFFSETS: Record<string, number> = {
  // Brasil (UTC-3 exceto exceções)
  GRU: -3, CGH: -3, VCP: -3, GIG: -3, SDU: -3, BSB: -3,
  CNF: -3, PLU: -3, SSA: -3, REC: -3, FOR: -3, BEL: -3,
  MCZ: -3, NAT: -3, CGR: -3, FLN: -3, POA: -3, CWB: -3,
  VIX: -3, JPA: -3, THE: -3, SLZ: -3, PMW: -3, AJU: -3,
  ROO: -3, XAP: -3, NVT: -3, JOI: -3, LDB: -3, UDI: -3,
  GYN: -3, IMP: -3, PPB: -3, BPS: -3, IOS: -3, STM: -3,
  // Brasil UTC-4 (Amazonas, Rondônia, Mato Grosso)
  MAO: -4, PVH: -4, CGB: -4,
  // Brasil UTC-5 (Acre)
  // (não tem aeroporto internacional relevante)
  // EUA Leste (UTC-5)
  JFK: -5, LGA: -5, EWR: -5, MIA: -5, FLL: -5, MCO: -5,
  ATL: -5, BOS: -5, DCA: -5, IAD: -5, CLT: -5, TPA: -5,
  DTW: -5, PHL: -5, BWI: -5, RDU: -5, MCI: -5, IND: -5,
  // EUA Centro (UTC-6)
  ORD: -6, DFW: -6, IAH: -6, MSP: -6, STL: -6, MSY: -6,
  OKC: -6, SAT: -6, AUS: -6,
  // EUA Montanha (UTC-7)
  DEN: -7, PHX: -7, SLC: -7, ABQ: -7, ELP: -7,
  // EUA Pacífico (UTC-8)
  LAX: -8, SFO: -8, SEA: -8, LAS: -8, SAN: -8, PDX: -8,
  // Canadá
  YYZ: -5, YUL: -5, YVR: -8, YYC: -7,
  // América Central e Caribe (UTC-6 / UTC-5)
  PTY: -5, SJO: -6, GUA: -6, SAL: -6, MGA: -6,
  CUN: -6, MEX: -6, GDL: -6, MTY: -6, SJD: -7, PVR: -6,
  // Caribe
  NAS: -5, HAV: -5, SJU: -4, PUJ: -4, SDQ: -4,
  MBJ: -5, KIN: -5, AUA: -4, CUR: -4, BGI: -4,
  // América do Sul
  EZE: -3, AEP: -3, SCL: -4, LIM: -5, BOG: -5,
  MDE: -5, CTG: -5, CLO: -5, UIO: -5, GYE: -5,
  MVD: -3, ASU: -4, VVI: -4, LPB: -4,
  CCS: -4,
  // Europa Ocidental (UTC+0 / UTC+1)
  LHR: 0, LGW: 0, STN: 0, DUB: 0,
  LIS: 0, OPO: 0,
  CDG: 1, ORY: 1, NCE: 1, MRS: 1,
  MAD: 1, BCN: 1, AGP: 1, SVQ: 1, VLC: 1, PMI: 1,
  AMS: 1, BRU: 1,
  FRA: 1, MUC: 1, TXL: 1, BER: 1, HAM: 1, DUS: 1,
  ZRH: 1, GVA: 1,
  FCO: 1, MXP: 1, LIN: 1,
  VIE: 1, PRG: 1, BUD: 1, WAW: 1,
  // Europa Oriental (UTC+2)
  ATH: 2, IST: 2, SAW: 2, TLV: 2, AMM: 2, CAI: 2,
  // Europa Norte (UTC+1 / UTC+2)
  CPH: 1, ARN: 1, OSL: 1, HEL: 2,
  // Escandinávia
  BT: 2,
  // Oriente Médio (UTC+3 / UTC+4)
  DXB: 4, AUH: 4, DOH: 3, RUH: 3, BEY: 2,
  // Ásia
  DEL: 5, BOM: 5,  // UTC+5:30 mas usamos 5 por simplicidade
  BKK: 7, DMK: 7,
  KUL: 8, SIN: 8, HKG: 8,
  PEK: 8, PVG: 8,
  NRT: 9, HND: 9,
  ICN: 9,
  CGK: 7, MNL: 8,
  // África
  JNB: 2, CPT: 2, CMN: 1, LOS: 1, NBO: 3, ADD: 3, DAR: 3,
  // Oceania
  SYD: 11, MEL: 11, BNE: 10, PER: 8, AKL: 13, CHC: 13,
  // Ilhas do Pacífico
  MCP: -3,
}
