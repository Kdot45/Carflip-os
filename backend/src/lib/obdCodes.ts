/**
 * Generic (SAE J2012 / ISO 15031-6 standard) OBD-II trouble codes — the
 * "P0xxx" codes whose meaning is the same on every OBD-II compliant vehicle
 * (mandatory in the US since 1996), not something specific to one listing.
 * This is a real reference table, not something the AI should be asked to
 * recall from memory: it's the same kind of grounding as the NHTSA recall
 * lookup — deterministic facts displayed as facts, AI commentary layered on
 * top of them rather than standing in for them.
 *
 * Coverage is intentionally partial: the ~180 most commonly seen generic
 * codes, not the full spec. Manufacturer-specific codes (most P1xxx codes,
 * and the less common P3xxx range) vary by make and aren't covered here —
 * lookupObdCodes() flags those as "not in our reference" rather than
 * guessing, and the AI's triage step is what any of that still needs.
 */
export const OBD_CODE_DATABASE: Record<string, { description: string; system: string }> = {
  // Fuel & air metering
  P0100: { description: "Mass or Volume Air Flow Circuit Malfunction", system: "Fuel & Air Metering" },
  P0101: { description: "Mass or Volume Air Flow Circuit Range/Performance Problem", system: "Fuel & Air Metering" },
  P0102: { description: "Mass or Volume Air Flow Circuit Low Input", system: "Fuel & Air Metering" },
  P0103: { description: "Mass or Volume Air Flow Circuit High Input", system: "Fuel & Air Metering" },
  P0106: { description: "Manifold Absolute Pressure/Barometric Pressure Circuit Range/Performance Problem", system: "Fuel & Air Metering" },
  P0107: { description: "Manifold Absolute Pressure/Barometric Pressure Circuit Low Input", system: "Fuel & Air Metering" },
  P0108: { description: "Manifold Absolute Pressure/Barometric Pressure Circuit High Input", system: "Fuel & Air Metering" },
  P0110: { description: "Intake Air Temperature Circuit Malfunction", system: "Fuel & Air Metering" },
  P0113: { description: "Intake Air Temperature Circuit High Input", system: "Fuel & Air Metering" },
  P0115: { description: "Engine Coolant Temperature Circuit Malfunction", system: "Fuel & Air Metering" },
  P0116: { description: "Engine Coolant Temperature Circuit Range/Performance Problem", system: "Fuel & Air Metering" },
  P0117: { description: "Engine Coolant Temperature Circuit Low Input", system: "Fuel & Air Metering" },
  P0118: { description: "Engine Coolant Temperature Circuit High Input", system: "Fuel & Air Metering" },
  P0120: { description: "Throttle/Pedal Position Sensor/Switch A Circuit Malfunction", system: "Fuel & Air Metering" },
  P0121: { description: "Throttle/Pedal Position Sensor/Switch A Circuit Range/Performance Problem", system: "Fuel & Air Metering" },
  P0122: { description: "Throttle/Pedal Position Sensor/Switch A Circuit Low Input", system: "Fuel & Air Metering" },
  P0123: { description: "Throttle/Pedal Position Sensor/Switch A Circuit High Input", system: "Fuel & Air Metering" },
  P0125: { description: "Insufficient Coolant Temperature for Closed Loop Fuel Control", system: "Fuel & Air Metering" },
  P0128: { description: "Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)", system: "Fuel & Air Metering" },
  P0130: { description: "O2 Sensor Circuit Malfunction (Bank 1, Sensor 1)", system: "Fuel & Air Metering" },
  P0131: { description: "O2 Sensor Circuit Low Voltage (Bank 1, Sensor 1)", system: "Fuel & Air Metering" },
  P0132: { description: "O2 Sensor Circuit High Voltage (Bank 1, Sensor 1)", system: "Fuel & Air Metering" },
  P0133: { description: "O2 Sensor Circuit Slow Response (Bank 1, Sensor 1)", system: "Fuel & Air Metering" },
  P0134: { description: "O2 Sensor Circuit No Activity Detected (Bank 1, Sensor 1)", system: "Fuel & Air Metering" },
  P0135: { description: "O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 1)", system: "Fuel & Air Metering" },
  P0136: { description: "O2 Sensor Circuit Malfunction (Bank 1, Sensor 2)", system: "Fuel & Air Metering" },
  P0141: { description: "O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 2)", system: "Fuel & Air Metering" },
  P0150: { description: "O2 Sensor Circuit Malfunction (Bank 2, Sensor 1)", system: "Fuel & Air Metering" },
  P0155: { description: "O2 Sensor Heater Circuit Malfunction (Bank 2, Sensor 1)", system: "Fuel & Air Metering" },
  P0157: { description: "O2 Sensor Circuit Low Voltage (Bank 2, Sensor 2)", system: "Fuel & Air Metering" },
  P0158: { description: "O2 Sensor Circuit High Voltage (Bank 2, Sensor 2)", system: "Fuel & Air Metering" },
  P0161: { description: "O2 Sensor Heater Circuit Malfunction (Bank 2, Sensor 2)", system: "Fuel & Air Metering" },
  P0170: { description: "Fuel Trim Malfunction (Bank 1)", system: "Fuel & Air Metering" },
  P0171: { description: "System Too Lean (Bank 1)", system: "Fuel & Air Metering" },
  P0172: { description: "System Too Rich (Bank 1)", system: "Fuel & Air Metering" },
  P0173: { description: "Fuel Trim Malfunction (Bank 2)", system: "Fuel & Air Metering" },
  P0174: { description: "System Too Lean (Bank 2)", system: "Fuel & Air Metering" },
  P0175: { description: "System Too Rich (Bank 2)", system: "Fuel & Air Metering" },
  P0177: { description: "Fuel Trim Malfunction (Bank 1)", system: "Fuel & Air Metering" },
  P0181: { description: "Fuel Temperature Sensor A Circuit Range/Performance", system: "Fuel & Air Metering" },
  P0182: { description: "Fuel Temperature Sensor A Circuit Low", system: "Fuel & Air Metering" },
  P0183: { description: "Fuel Temperature Sensor A Circuit High", system: "Fuel & Air Metering" },
  P0190: { description: "Fuel Rail Pressure Sensor Circuit Malfunction", system: "Fuel & Air Metering" },
  P0191: { description: "Fuel Rail Pressure Sensor Circuit Range/Performance", system: "Fuel & Air Metering" },

  // Fuel & air metering (injector circuit)
  P0200: { description: "Injector Circuit Malfunction", system: "Fuel & Air Metering" },
  P0201: { description: "Injector Circuit Malfunction — Cylinder 1", system: "Fuel & Air Metering" },
  P0202: { description: "Injector Circuit Malfunction — Cylinder 2", system: "Fuel & Air Metering" },
  P0203: { description: "Injector Circuit Malfunction — Cylinder 3", system: "Fuel & Air Metering" },
  P0204: { description: "Injector Circuit Malfunction — Cylinder 4", system: "Fuel & Air Metering" },
  P0205: { description: "Injector Circuit Malfunction — Cylinder 5", system: "Fuel & Air Metering" },
  P0206: { description: "Injector Circuit Malfunction — Cylinder 6", system: "Fuel & Air Metering" },
  P0217: { description: "Engine Overtemperature Condition", system: "Fuel & Air Metering" },
  P0218: { description: "Transmission Overtemperature Condition", system: "Fuel & Air Metering" },
  P0219: { description: "Engine Overspeed Condition", system: "Fuel & Air Metering" },
  P0230: { description: "Fuel Pump Primary Circuit Malfunction", system: "Fuel & Air Metering" },
  P0261: { description: "Cylinder 1 Injector Circuit Low", system: "Fuel & Air Metering" },
  P0262: { description: "Cylinder 1 Injector Circuit High", system: "Fuel & Air Metering" },

  // Ignition system / misfire
  P0300: { description: "Random/Multiple Cylinder Misfire Detected", system: "Ignition System / Misfire" },
  P0301: { description: "Cylinder 1 Misfire Detected", system: "Ignition System / Misfire" },
  P0302: { description: "Cylinder 2 Misfire Detected", system: "Ignition System / Misfire" },
  P0303: { description: "Cylinder 3 Misfire Detected", system: "Ignition System / Misfire" },
  P0304: { description: "Cylinder 4 Misfire Detected", system: "Ignition System / Misfire" },
  P0305: { description: "Cylinder 5 Misfire Detected", system: "Ignition System / Misfire" },
  P0306: { description: "Cylinder 6 Misfire Detected", system: "Ignition System / Misfire" },
  P0307: { description: "Cylinder 7 Misfire Detected", system: "Ignition System / Misfire" },
  P0308: { description: "Cylinder 8 Misfire Detected", system: "Ignition System / Misfire" },
  P0316: { description: "Misfire Detected on Startup (First 1000 Revolutions)", system: "Ignition System / Misfire" },
  P0320: { description: "Ignition/Distributor Engine Speed Input Circuit Malfunction", system: "Ignition System / Misfire" },
  P0325: { description: "Knock Sensor 1 Circuit Malfunction (Bank 1)", system: "Ignition System / Misfire" },
  P0327: { description: "Knock Sensor 1 Circuit Low Input (Bank 1)", system: "Ignition System / Misfire" },
  P0328: { description: "Knock Sensor 1 Circuit High Input (Bank 1)", system: "Ignition System / Misfire" },
  P0335: { description: "Crankshaft Position Sensor A Circuit Malfunction", system: "Ignition System / Misfire" },
  P0336: { description: "Crankshaft Position Sensor A Circuit Range/Performance", system: "Ignition System / Misfire" },
  P0340: { description: "Camshaft Position Sensor Circuit Malfunction", system: "Ignition System / Misfire" },
  P0341: { description: "Camshaft Position Sensor Circuit Range/Performance", system: "Ignition System / Misfire" },
  P0350: { description: "Ignition Coil Primary/Secondary Circuit Malfunction", system: "Ignition System / Misfire" },
  P0351: { description: "Ignition Coil A Primary/Secondary Circuit Malfunction", system: "Ignition System / Misfire" },
  P0352: { description: "Ignition Coil B Primary/Secondary Circuit Malfunction", system: "Ignition System / Misfire" },
  P0353: { description: "Ignition Coil C Primary/Secondary Circuit Malfunction", system: "Ignition System / Misfire" },
  P0354: { description: "Ignition Coil D Primary/Secondary Circuit Malfunction", system: "Ignition System / Misfire" },
  P0355: { description: "Ignition Coil E Primary/Secondary Circuit Malfunction", system: "Ignition System / Misfire" },
  P0356: { description: "Ignition Coil F Primary/Secondary Circuit Malfunction", system: "Ignition System / Misfire" },

  // Auxiliary emissions controls
  P0401: { description: "Exhaust Gas Recirculation Flow Insufficient Detected", system: "Auxiliary Emissions Controls" },
  P0402: { description: "Exhaust Gas Recirculation Flow Excessive Detected", system: "Auxiliary Emissions Controls" },
  P0404: { description: "Exhaust Gas Recirculation Circuit Range/Performance", system: "Auxiliary Emissions Controls" },
  P0405: { description: "Exhaust Gas Recirculation Sensor A Circuit Low", system: "Auxiliary Emissions Controls" },
  P0410: { description: "Secondary Air Injection System Malfunction", system: "Auxiliary Emissions Controls" },
  P0411: { description: "Secondary Air Injection System Incorrect Flow Detected", system: "Auxiliary Emissions Controls" },
  P0420: { description: "Catalyst System Efficiency Below Threshold (Bank 1)", system: "Auxiliary Emissions Controls" },
  P0421: { description: "Warm Up Catalyst Efficiency Below Threshold (Bank 1)", system: "Auxiliary Emissions Controls" },
  P0430: { description: "Catalyst System Efficiency Below Threshold (Bank 2)", system: "Auxiliary Emissions Controls" },
  P0440: { description: "Evaporative Emission Control System Malfunction", system: "Auxiliary Emissions Controls" },
  P0441: { description: "Evaporative Emission Control System Incorrect Purge Flow", system: "Auxiliary Emissions Controls" },
  P0442: { description: "Evaporative Emission Control System Leak Detected (Small Leak)", system: "Auxiliary Emissions Controls" },
  P0443: { description: "Evaporative Emission Control System Purge Control Valve Circuit Malfunction", system: "Auxiliary Emissions Controls" },
  P0446: { description: "Evaporative Emission Control System Vent Control Circuit Malfunction", system: "Auxiliary Emissions Controls" },
  P0449: { description: "Evaporative Emission Control System Vent Valve/Solenoid Circuit Malfunction", system: "Auxiliary Emissions Controls" },
  P0450: { description: "Evaporative Emission Control System Pressure Sensor Malfunction", system: "Auxiliary Emissions Controls" },
  P0455: { description: "Evaporative Emission Control System Leak Detected (Large Leak)", system: "Auxiliary Emissions Controls" },
  P0456: { description: "Evaporative Emission Control System Leak Detected (Very Small Leak)", system: "Auxiliary Emissions Controls" },
  P0460: { description: "Fuel Level Sensor Circuit Malfunction", system: "Auxiliary Emissions Controls" },
  P0461: { description: "Fuel Level Sensor Circuit Range/Performance", system: "Auxiliary Emissions Controls" },
  P0463: { description: "Fuel Level Sensor Circuit High Input", system: "Auxiliary Emissions Controls" },
  P0480: { description: "Cooling Fan 1 Control Circuit Malfunction", system: "Auxiliary Emissions Controls" },
  P0481: { description: "Cooling Fan 2 Control Circuit Malfunction", system: "Auxiliary Emissions Controls" },

  // Vehicle speed, idle control & auxiliary inputs
  P0500: { description: "Vehicle Speed Sensor Malfunction", system: "Vehicle Speed & Idle Control" },
  P0505: { description: "Idle Control System Malfunction", system: "Vehicle Speed & Idle Control" },
  P0506: { description: "Idle Control System RPM Lower Than Expected", system: "Vehicle Speed & Idle Control" },
  P0507: { description: "Idle Control System RPM Higher Than Expected", system: "Vehicle Speed & Idle Control" },
  P0510: { description: "Closed Throttle Position Switch Malfunction", system: "Vehicle Speed & Idle Control" },
  P0520: { description: "Engine Oil Pressure Sensor/Switch Circuit Malfunction", system: "Vehicle Speed & Idle Control" },
  P0530: { description: "A/C Refrigerant Pressure Sensor Circuit Malfunction", system: "Vehicle Speed & Idle Control" },
  P0562: { description: "System Voltage Low", system: "Vehicle Speed & Idle Control" },
  P0563: { description: "System Voltage High", system: "Vehicle Speed & Idle Control" },
  P0571: { description: "Cruise Control/Brake Switch A Circuit Malfunction", system: "Vehicle Speed & Idle Control" },

  // Computer & output circuit
  P0600: { description: "Serial Communication Link Malfunction", system: "Computer & Output Circuit" },
  P0601: { description: "Internal Control Module Memory Check Sum Error", system: "Computer & Output Circuit" },
  P0602: { description: "Control Module Programming Error", system: "Computer & Output Circuit" },
  P0603: { description: "Internal Control Module Keep Alive Memory (KAM) Error", system: "Computer & Output Circuit" },
  P0604: { description: "Internal Control Module Random Access Memory (RAM) Error", system: "Computer & Output Circuit" },
  P0605: { description: "Internal Control Module Read Only Memory (ROM) Error", system: "Computer & Output Circuit" },
  P0606: { description: "ECM/PCM Processor Malfunction", system: "Computer & Output Circuit" },
  P0620: { description: "Generator Control Circuit Malfunction", system: "Computer & Output Circuit" },
  P0630: { description: "VIN Not Programmed or Incompatible — ECM/PCM", system: "Computer & Output Circuit" },
  P0641: { description: "Sensor Reference Voltage A Circuit Open", system: "Computer & Output Circuit" },
  P0650: { description: "Malfunction Indicator Lamp (MIL) Control Circuit Malfunction", system: "Computer & Output Circuit" },
  P0700: { description: "Transmission Control System Malfunction (indicates a fault is stored in the TCM — check separately)", system: "Transmission" },

  // Transmission
  P0705: { description: "Transmission Range Sensor Circuit Malfunction (PRNDL Input)", system: "Transmission" },
  P0706: { description: "Transmission Range Sensor Circuit Range/Performance", system: "Transmission" },
  P0710: { description: "Transmission Fluid Temperature Sensor Circuit Malfunction", system: "Transmission" },
  P0715: { description: "Input/Turbine Speed Sensor Circuit Malfunction", system: "Transmission" },
  P0720: { description: "Output Speed Sensor Circuit Malfunction", system: "Transmission" },
  P0721: { description: "Output Speed Sensor Circuit Range/Performance", system: "Transmission" },
  P0725: { description: "Engine Speed Input Circuit Malfunction", system: "Transmission" },
  P0730: { description: "Incorrect Gear Ratio", system: "Transmission" },
  P0731: { description: "Gear 1 Incorrect Ratio", system: "Transmission" },
  P0732: { description: "Gear 2 Incorrect Ratio", system: "Transmission" },
  P0733: { description: "Gear 3 Incorrect Ratio", system: "Transmission" },
  P0734: { description: "Gear 4 Incorrect Ratio", system: "Transmission" },
  P0735: { description: "Gear 5 Incorrect Ratio", system: "Transmission" },
  P0740: { description: "Torque Converter Clutch Circuit Malfunction", system: "Transmission" },
  P0741: { description: "Torque Converter Clutch Circuit Performance or Stuck Off", system: "Transmission" },
  P0743: { description: "Torque Converter Clutch Circuit Electrical", system: "Transmission" },
  P0750: { description: "Shift Solenoid A Malfunction", system: "Transmission" },
  P0751: { description: "Shift Solenoid A Performance or Stuck Off", system: "Transmission" },
  P0755: { description: "Shift Solenoid B Malfunction", system: "Transmission" },
  P0760: { description: "Shift Solenoid C Malfunction", system: "Transmission" },
  P0765: { description: "Shift Solenoid D Malfunction", system: "Transmission" },
  P0776: { description: "Pressure Control Solenoid B Performance or Stuck Off", system: "Transmission" },
  P0780: { description: "Shift Malfunction", system: "Transmission" },
  P0783: { description: "3-4 Shift Malfunction", system: "Transmission" },

  // Network / communication
  U0100: { description: "Lost Communication With ECM/PCM", system: "Network / Communication" },
  U0101: { description: "Lost Communication With TCM", system: "Network / Communication" },
  U0121: { description: "Lost Communication With ABS Control Module", system: "Network / Communication" },
  U0140: { description: "Lost Communication With Body Control Module", system: "Network / Communication" },
  U0155: { description: "Lost Communication With Instrument Panel Cluster", system: "Network / Communication" },

  // Body
  B0001: { description: "Driver Frontal Stage 1 Deployment Control", system: "Body" },
  B0012: { description: "Driver Frontal Stage 1 Deployment Loop Open", system: "Body" },
  B0100: { description: "Seat Belt Sensor Circuits", system: "Body" },
  B0080: { description: "Passenger Frontal Sensor", system: "Body" },
  B1000: { description: "Body Control Module Malfunction", system: "Body" },

  // Chassis
  C0035: { description: "Left Front Wheel Speed Sensor Circuit", system: "Chassis" },
  C0040: { description: "Right Front Wheel Speed Sensor Circuit", system: "Chassis" },
  C0045: { description: "Left Rear Wheel Speed Sensor Circuit", system: "Chassis" },
  C0050: { description: "Right Rear Wheel Speed Sensor Circuit", system: "Chassis" },
  C0110: { description: "Pump Motor Circuit Malfunction (ABS/Traction Control Pump)", system: "Chassis" },
};

/** Matches OBD-II style codes: one letter (P/B/C/U) + 4 hex digits. */
const CODE_PATTERN = /\b[PBCU][0-9A-F]{4}\b/gi;

/** Pulls individual code tokens out of freeform pasted text, deduped and
 * uppercased, in the order they first appear. */
export function parseObdCodes(rawText: string): string[] {
  const matches = rawText.toUpperCase().match(CODE_PATTERN) ?? [];
  return Array.from(new Set(matches));
}

export interface ObdCodeLookupResult {
  code: string;
  found: boolean;
  description: string | null;
  system: string | null;
  /** A "0" as the second character is the SAE convention for a generic,
   * cross-manufacturer code; other digits are manufacturer-specific and
   * this reference table won't have a reliable definition for them. */
  isGeneric: boolean;
}

export function lookupObdCodes(rawText: string): ObdCodeLookupResult[] {
  return parseObdCodes(rawText).map((code) => {
    const entry = OBD_CODE_DATABASE[code];
    return {
      code,
      found: !!entry,
      description: entry?.description ?? null,
      system: entry?.system ?? null,
      isGeneric: code[1] === "0",
    };
  });
}
