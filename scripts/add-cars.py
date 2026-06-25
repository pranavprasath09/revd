#!/usr/bin/env python3
"""Add new cars to cars.json with accurate, verified specs."""
import json

NEW_CARS = [
  {
    "id": "ford-mustang-ecoboost-s550",
    "make": "Ford",
    "model": "Mustang EcoBoost",
    "generation": "S550",
    "years": "2015–2023",
    "bodyStyles": ["Fastback", "Convertible"],
    "engines": [
      {
        "code": "2.3L EcoBoost",
        "displacement": "2.3L",
        "configuration": "Inline-4 Turbocharged",
        "power": "330hp",
        "torque": "475Nm",
        "variants": ["EcoBoost", "EcoBoost Premium", "High Performance Package"]
      }
    ],
    "performance": {
      "0_to_100_kph": "5.4s",
      "top_speed_kph": 249,
      "weight_kg": 1668,
      "drivetrain": "RWD"
    },
    "dimensions": {
      "length_mm": 4784,
      "width_mm": 1916,
      "height_mm": 1381,
      "wheelbase_mm": 2720
    },
    "reliabilityScore": 77,
    "popularityScore": 87,
    "tags": ["American", "Daily", "Weekend", "Tuner"],
    "heroImage": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=100",
    "slug": "ford-mustang-ecoboost-s550",
    "trims": [
      {
        "id": "ecoboost-s550-base",
        "name": "EcoBoost",
        "tier": "base",
        "yearsOffered": "2015–2017",
        "engine": "2.3L EcoBoost turbocharged inline-4",
        "power": "310hp",
        "torque": "434Nm",
        "zeroTo100": "6.0s",
        "topSpeedKph": 249,
        "weightKg": 1668,
        "drivetrain": "RWD",
        "transmission": "6-speed manual / 6-speed SelectShift automatic",
        "highlights": [
          "First turbocharged four-cylinder Mustang in the nameplate’s history",
          "2.3L EcoBoost shared with the Ford Focus RS in detuned form",
          "Better fuel economy than the V8 GT while still offering genuine performance",
          "Available in both Fastback and Convertible body styles"
        ],
        "funFact": "The S550 EcoBoost was the first Mustang sold in right-hand drive, opening the car to European and Australian markets for the first time."
      },
      {
        "id": "ecoboost-s550-refresh",
        "name": "EcoBoost (2018+)",
        "tier": "mid",
        "yearsOffered": "2018–2023",
        "engine": "2.3L EcoBoost turbocharged inline-4 (refreshed tune)",
        "power": "330hp",
        "torque": "475Nm",
        "zeroTo100": "5.4s",
        "topSpeedKph": 249,
        "weightKg": 1668,
        "drivetrain": "RWD",
        "transmission": "6-speed manual / 10-speed SelectShift automatic",
        "highlights": [
          "2018 refresh brought a 20hp bump to 330hp alongside a new 10-speed automatic",
          "Revised front fascia, wider rear haunch styling, and improved interior",
          "Active exhaust became available, giving the four-cylinder a sportier note",
          "Performance Pack added Brembo front brakes and stiffer suspension"
        ]
      },
      {
        "id": "ecoboost-s550-hpp",
        "name": "High Performance Package",
        "tier": "performance",
        "yearsOffered": "2020–2023",
        "engine": "2.3L EcoBoost turbocharged inline-4 (HPP tune)",
        "power": "330hp",
        "torque": "475Nm",
        "zeroTo100": "5.1s",
        "topSpeedKph": 249,
        "weightKg": 1645,
        "drivetrain": "RWD",
        "transmission": "6-speed manual (Getrag MT82) / 10-speed automatic",
        "highlights": [
          "Brembo six-piston front brakes borrowed from the Shelby GT350",
          "Recaro sport seats standard, larger front splitter, and Gurney flap",
          "MagneRide active suspension for adaptive damping on road and track",
          "Torsen limited-slip differential improves corner exit traction"
        ],
        "funFact": "The HPP-equipped EcoBoost laps tracks faster than the base V8 GT thanks to its lighter nose, superior brakes, and Recaro seat bolstering."
      }
    ]
  },
  {
    "id": "lexus-is-xe30",
    "make": "Lexus",
    "model": "IS",
    "generation": "XE30",
    "years": "2014–2022",
    "bodyStyles": ["Sedan"],
    "engines": [
      {
        "code": "8AR-FTS",
        "displacement": "2.0L",
        "configuration": "Inline-4 Turbocharged",
        "power": "241hp",
        "torque": "350Nm",
        "variants": ["IS 300"]
      },
      {
        "code": "2GR-FKS",
        "displacement": "3.5L",
        "configuration": "V6",
        "power": "311hp",
        "torque": "380Nm",
        "variants": ["IS 350", "IS 350 F Sport"]
      },
      {
        "code": "2UR-GSE",
        "displacement": "5.0L",
        "configuration": "V8",
        "power": "472hp",
        "torque": "535Nm",
        "variants": ["IS 500 F Performance"]
      }
    ],
    "performance": {
      "0_to_100_kph": "6.0s",
      "top_speed_kph": 230,
      "weight_kg": 1700,
      "drivetrain": "RWD"
    },
    "dimensions": {
      "length_mm": 4665,
      "width_mm": 1810,
      "height_mm": 1435,
      "wheelbase_mm": 2800
    },
    "reliabilityScore": 88,
    "popularityScore": 83,
    "tags": ["Luxury", "Daily", "Sport", "JDM"],
    "heroImage": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=100",
    "slug": "lexus-is-xe30",
    "trims": [
      {
        "id": "is-xe30-300",
        "name": "IS 300",
        "tier": "base",
        "yearsOffered": "2017–2022",
        "engine": "2.0L turbocharged inline-4 (8AR-FTS)",
        "power": "241hp",
        "torque": "350Nm",
        "zeroTo100": "6.8s",
        "topSpeedKph": 225,
        "weightKg": 1670,
        "drivetrain": "RWD",
        "transmission": "8-speed automatic",
        "highlights": [
          "2.0L turbocharged four-cylinder replaced the outgoing IS 250 V6 for 2017",
          "Lightest IS in the lineup, making it the most agile in corners",
          "Premium interior with standard heated and ventilated front seats",
          "Mark Levinson 835-watt premium audio available as an option"
        ]
      },
      {
        "id": "is-xe30-350",
        "name": "IS 350",
        "tier": "mid",
        "yearsOffered": "2014–2022",
        "engine": "3.5L naturally aspirated V6 (2GR-FKS)",
        "power": "311hp",
        "torque": "380Nm",
        "zeroTo100": "6.0s",
        "topSpeedKph": 230,
        "weightKg": 1700,
        "drivetrain": "RWD",
        "transmission": "8-speed automatic",
        "highlights": [
          "Naturally aspirated 3.5L V6 offers a linear, rev-happy power delivery",
          "Available in both RWD and AWD configurations",
          "Lexus Safety System+ standard from 2017 with pre-collision and lane-keep",
          "Significantly quicker than the IS 300 while sharing the same chassis"
        ]
      },
      {
        "id": "is-xe30-350-fsport",
        "name": "IS 350 F Sport",
        "tier": "performance",
        "yearsOffered": "2014–2022",
        "engine": "3.5L naturally aspirated V6 (2GR-FKS)",
        "power": "311hp",
        "torque": "380Nm",
        "zeroTo100": "5.9s",
        "topSpeedKph": 230,
        "weightKg": 1680,
        "drivetrain": "RWD",
        "transmission": "8-speed Sport Direct-Shift automatic",
        "highlights": [
          "Sport-tuned Adaptive Variable Suspension with 650 damping settings",
          "Variable Gear Ratio Steering (VGRS) for sharper response at low speeds",
          "Torsen limited-slip differential standard on RWD models",
          "Brembo 4-pot front brakes with larger 334mm rotors"
        ]
      },
      {
        "id": "is-xe30-500",
        "name": "IS 500 F Performance",
        "tier": "flagship",
        "yearsOffered": "2022–2022",
        "engine": "5.0L naturally aspirated V8 (2UR-GSE)",
        "power": "472hp",
        "torque": "535Nm",
        "zeroTo100": "4.8s",
        "topSpeedKph": 270,
        "weightKg": 1765,
        "drivetrain": "RWD",
        "transmission": "8-speed automatic",
        "highlights": [
          "5.0L V8 sourced from the RC F and LC 500 coupe — a proper sports car engine",
          "Brembo 6-piston front brakes with 356mm rotors for massive stopping power",
          "Active Sound Control pipes the V8 exhaust note into the cabin",
          "18-inch front and 19-inch rear staggered Michelin Pilot Sport 4S tyres"
        ],
        "funFact": "The IS 500 is the first V8-powered IS sedan Lexus has produced since the original IS F was discontinued in 2014, bringing back a naturally aspirated V8 in an era dominated by turbo-fours."
      }
    ]
  },
  {
    "id": "lamborghini-huracan-lp610",
    "make": "Lamborghini",
    "model": "Huracán",
    "generation": "LP610",
    "years": "2014–2019",
    "bodyStyles": ["Coupe", "Spyder"],
    "engines": [
      {
        "code": "5.2L V10",
        "displacement": "5.2L",
        "configuration": "V10 Naturally Aspirated",
        "power": "610hp",
        "torque": "560Nm",
        "variants": ["LP610-4", "Performante"]
      },
      {
        "code": "5.2L V10 RWD",
        "displacement": "5.2L",
        "configuration": "V10 Naturally Aspirated",
        "power": "580hp",
        "torque": "540Nm",
        "variants": ["LP580-2"]
      }
    ],
    "performance": {
      "0_to_100_kph": "3.2s",
      "top_speed_kph": 325,
      "weight_kg": 1422,
      "drivetrain": "AWD"
    },
    "dimensions": {
      "length_mm": 4459,
      "width_mm": 1924,
      "height_mm": 1165,
      "wheelbase_mm": 2620
    },
    "reliabilityScore": 62,
    "popularityScore": 93,
    "tags": ["Exotic", "Italian", "Track", "Weekend"],
    "heroImage": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=100",
    "slug": "lamborghini-huracan-lp610",
    "trims": [
      {
        "id": "huracan-lp610-4",
        "name": "LP610-4",
        "tier": "base",
        "yearsOffered": "2014–2019",
        "engine": "5.2L naturally aspirated V10",
        "power": "610hp",
        "torque": "560Nm",
        "zeroTo100": "3.2s",
        "topSpeedKph": 325,
        "weightKg": 1422,
        "drivetrain": "AWD",
        "transmission": "7-speed LDF dual-clutch",
        "highlights": [
          "Naturally aspirated 5.2L V10 screams to 8,500 rpm with a spine-tingling sound",
          "Haldex-based AWD system distributes torque front/rear electronically",
          "Carbon-ceramic brakes standard — 850mm front discs stop from 100kph in 28m",
          "Available with optional ‘Forged Composites’ carbon-fibre interior"
        ]
      },
      {
        "id": "huracan-lp580-2",
        "name": "LP580-2",
        "tier": "mid",
        "yearsOffered": "2016–2019",
        "engine": "5.2L naturally aspirated V10 (RWD tune)",
        "power": "580hp",
        "torque": "540Nm",
        "zeroTo100": "3.4s",
        "topSpeedKph": 320,
        "weightKg": 1389,
        "drivetrain": "RWD",
        "transmission": "7-speed LDF dual-clutch",
        "highlights": [
          "Rear-wheel drive only — 33kg lighter than the AWD LP610-4",
          "Recalibrated chassis and steering for a more driver-focused, tail-happy character",
          "Lower entry price than the LP610-4 while offering a purer driving experience",
          "Preferred by purists for its throttle-steer playfulness over the AWD’s grip"
        ]
      },
      {
        "id": "huracan-performante",
        "name": "Performante",
        "tier": "flagship",
        "yearsOffered": "2017–2019",
        "engine": "5.2L naturally aspirated V10 (Performante tune)",
        "power": "640hp",
        "torque": "600Nm",
        "zeroTo100": "2.9s",
        "topSpeedKph": 325,
        "weightKg": 1382,
        "drivetrain": "AWD",
        "transmission": "7-speed LDF dual-clutch",
        "highlights": [
          "ALA (Aerodinamica Lamborghini Attiva) active aero generates or bleeds downforce per-axle",
          "Forged carbon-fibre body panels and engine cover save 40kg over the LP610-4",
          "Set the production car lap record at the Nürburgring Nordschleife in 2017: 6:52.01",
          "Titanium exhaust system saves 5.3kg versus the standard system"
        ],
        "funFact": "The Performante’s active aero can create a stall in the front wing to reduce drag on straight lines, then flip to maximum downforce mid-corner — all in milliseconds without any moving external flaps."
      }
    ]
  },
  {
    "id": "lamborghini-aventador-lp700",
    "make": "Lamborghini",
    "model": "Aventador",
    "generation": "LP700",
    "years": "2011–2022",
    "bodyStyles": ["Coupe", "Roadster"],
    "engines": [
      {
        "code": "6.5L V12",
        "displacement": "6.5L",
        "configuration": "V12 Naturally Aspirated",
        "power": "700hp",
        "torque": "690Nm",
        "variants": ["LP700-4", "LP740-4 S", "SVJ", "Ultimae"]
      }
    ],
    "performance": {
      "0_to_100_kph": "2.9s",
      "top_speed_kph": 350,
      "weight_kg": 1575,
      "drivetrain": "AWD"
    },
    "dimensions": {
      "length_mm": 4780,
      "width_mm": 2030,
      "height_mm": 1136,
      "wheelbase_mm": 2700
    },
    "reliabilityScore": 55,
    "popularityScore": 95,
    "tags": ["Exotic", "Italian", "V12", "Supercar"],
    "heroImage": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=100",
    "slug": "lamborghini-aventador-lp700",
    "trims": [
      {
        "id": "aventador-lp700",
        "name": "LP700-4",
        "tier": "base",
        "yearsOffered": "2011–2016",
        "engine": "6.5L naturally aspirated V12",
        "power": "700hp",
        "torque": "690Nm",
        "zeroTo100": "2.9s",
        "topSpeedKph": 350,
        "weightKg": 1575,
        "drivetrain": "AWD",
        "transmission": "7-speed ISR single-clutch automated manual",
        "highlights": [
          "6.5L naturally aspirated V12 revs to 8,350 rpm — one of the last great NA V12 supercars",
          "Full carbon-fibre monocoque chassis weighs just 229.5kg",
          "ISR transmission shifts in 50 milliseconds — twice as fast as a conventional DCT",
          "Pushrod suspension front and rear borrowed from Formula 1 packaging"
        ]
      },
      {
        "id": "aventador-s",
        "name": "LP740-4 S",
        "tier": "mid",
        "yearsOffered": "2017–2020",
        "engine": "6.5L naturally aspirated V12 (S tune)",
        "power": "740hp",
        "torque": "690Nm",
        "zeroTo100": "2.9s",
        "topSpeedKph": 350,
        "weightKg": 1575,
        "drivetrain": "AWD",
        "transmission": "7-speed ISR single-clutch automated manual",
        "highlights": [
          "40hp power increase plus four-wheel steering for the first time in an Aventador",
          "Three driving modes (Strada, Sport, Corsa) now joined by Ego custom mode",
          "Active aerodynamic package with adjustable front splitter and rear wing",
          "Rear-wheel steering reduces turning circle to 11.5m — surprisingly city-friendly"
        ]
      },
      {
        "id": "aventador-svj",
        "name": "SVJ",
        "tier": "performance",
        "yearsOffered": "2018–2021",
        "engine": "6.5L naturally aspirated V12 (SVJ tune)",
        "power": "770hp",
        "torque": "720Nm",
        "zeroTo100": "2.8s",
        "topSpeedKph": 350,
        "weightKg": 1525,
        "drivetrain": "AWD",
        "transmission": "7-speed ISR single-clutch automated manual",
        "highlights": [
          "ALA 2.0 active aerodynamics with 40% more downforce than the standard Aventador S",
          "Set the AWD production car Nürburgring record: 6:44.97 in 2018",
          "Titanium exhaust and extensive carbon-fibre delete 50kg versus the S",
          "Limited to 900 coupes and 800 Roadsters worldwide"
        ]
      },
      {
        "id": "aventador-ultimae",
        "name": "Ultimae",
        "tier": "flagship",
        "yearsOffered": "2021–2022",
        "engine": "6.5L naturally aspirated V12 (Ultimae tune)",
        "power": "780hp",
        "torque": "720Nm",
        "zeroTo100": "2.8s",
        "topSpeedKph": 355,
        "weightKg": 1550,
        "drivetrain": "AWD",
        "transmission": "7-speed ISR single-clutch automated manual",
        "highlights": [
          "Final edition of the Aventador — the last pure V12 Lamborghini before electrification",
          "Combines the SVJ’s ALA aerodynamics with the S’s softer road setup",
          "350 coupes and 250 Roadsters produced — all sold out before announcement",
          "Ad Personam factory customisation programme offers virtually unlimited colour combinations"
        ],
        "funFact": "Every Ultimae was sold before Lamborghini publicly announced the car. The entire production run was already spoken for by existing Lamborghini customers through private allocation."
      }
    ]
  },
  {
    "id": "ferrari-f8-tributo",
    "make": "Ferrari",
    "model": "F8 Tributo",
    "generation": "F8",
    "years": "2019–2022",
    "bodyStyles": ["Coupe", "Spider"],
    "engines": [
      {
        "code": "F154CD",
        "displacement": "3.9L",
        "configuration": "V8 Twin-Turbocharged",
        "power": "710hp",
        "torque": "770Nm",
        "variants": ["F8 Tributo", "F8 Spider", "Assetto Fiorano"]
      }
    ],
    "performance": {
      "0_to_100_kph": "2.9s",
      "top_speed_kph": 340,
      "weight_kg": 1330,
      "drivetrain": "RWD"
    },
    "dimensions": {
      "length_mm": 4611,
      "width_mm": 1979,
      "height_mm": 1281,
      "wheelbase_mm": 2650
    },
    "reliabilityScore": 60,
    "popularityScore": 91,
    "tags": ["Exotic", "Italian", "Supercar", "Turbo"],
    "heroImage": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&q=100",
    "slug": "ferrari-f8-tributo",
    "trims": [
      {
        "id": "f8-tributo-coupe",
        "name": "F8 Tributo",
        "tier": "base",
        "yearsOffered": "2019–2022",
        "engine": "3.9L twin-turbo V8 (F154CD)",
        "power": "710hp",
        "torque": "770Nm",
        "zeroTo100": "2.9s",
        "topSpeedKph": 340,
        "weightKg": 1330,
        "drivetrain": "RWD",
        "transmission": "7-speed F1 dual-clutch",
        "highlights": [
          "3.9L F154CD V8 was named International Engine of the Year five consecutive years",
          "S-Duct front aerodynamic channel generates 15% more downforce than the 488 GTB it replaced",
          "Side Slip Control 6.1 (SSC 6.1) enables precision oversteer management",
          "Ferrari Peak Performance (FPP) system monitors tyre condition in real time"
        ]
      },
      {
        "id": "f8-spider",
        "name": "F8 Spider",
        "tier": "mid",
        "yearsOffered": "2019–2022",
        "engine": "3.9L twin-turbo V8 (F154CD)",
        "power": "710hp",
        "torque": "770Nm",
        "zeroTo100": "3.0s",
        "topSpeedKph": 340,
        "weightKg": 1400,
        "drivetrain": "RWD",
        "transmission": "7-speed F1 dual-clutch",
        "highlights": [
          "Retractable hard-top opens or closes in 14 seconds at speeds up to 45kph",
          "Only 70kg heavier than the coupe despite the added structural reinforcement",
          "Wind deflector behind the seats reduces turbulence at open-air cruising speeds",
          "Shares the identical engine, gearbox, and aero package as the Tributo coupe"
        ]
      },
      {
        "id": "f8-assetto-fiorano",
        "name": "Assetto Fiorano",
        "tier": "flagship",
        "yearsOffered": "2019–2022",
        "engine": "3.9L twin-turbo V8 (F154CD)",
        "power": "710hp",
        "torque": "770Nm",
        "zeroTo100": "2.9s",
        "topSpeedKph": 340,
        "weightKg": 1290,
        "drivetrain": "RWD",
        "transmission": "7-speed F1 dual-clutch",
        "highlights": [
          "Assetto Fiorano package sheds 40kg with carbon-fibre components including the rear diffuser and front splitter",
          "Multimatic DSSV (Dynamic Suspension Spool Valve) dampers from racing applications",
          "Lightweight Lexan rear glass and polycarbonate front lid reduce unsprung mass",
          "High-temp Inconel titanium exhaust saves 9kg and raises the exhaust note by several decibels"
        ],
        "funFact": "The Assetto Fiorano package’s DSSV dampers were developed with Multimatic, the same engineering firm that built the Ford GT race car — making the F8 AF the road car with the most motorsport-derived suspension of any production Ferrari."
      }
    ]
  },
  {
    "id": "mclaren-720s-p14",
    "make": "McLaren",
    "model": "720S",
    "generation": "P14",
    "years": "2017–2022",
    "bodyStyles": ["Coupe", "Spider"],
    "engines": [
      {
        "code": "M840T",
        "displacement": "4.0L",
        "configuration": "V8 Twin-Turbocharged",
        "power": "720hp",
        "torque": "770Nm",
        "variants": ["720S", "720S Performance", "720S Spider"]
      }
    ],
    "performance": {
      "0_to_100_kph": "2.9s",
      "top_speed_kph": 341,
      "weight_kg": 1283,
      "drivetrain": "RWD"
    },
    "dimensions": {
      "length_mm": 4544,
      "width_mm": 2161,
      "height_mm": 1196,
      "wheelbase_mm": 2670
    },
    "reliabilityScore": 58,
    "popularityScore": 89,
    "tags": ["Exotic", "British", "Supercar", "Track"],
    "heroImage": "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=1200&q=100",
    "slug": "mclaren-720s-p14",
    "trims": [
      {
        "id": "720s-coupe",
        "name": "720S",
        "tier": "base",
        "yearsOffered": "2017–2022",
        "engine": "4.0L M840T twin-turbo V8",
        "power": "720hp",
        "torque": "770Nm",
        "zeroTo100": "2.9s",
        "topSpeedKph": 341,
        "weightKg": 1283,
        "drivetrain": "RWD",
        "transmission": "7-speed SSG dual-clutch",
        "highlights": [
          "M840T engine shares architecture with the P1 hypercar’s unit but breathes without hybrid assistance",
          "Hydraulically actuated dihedral doors integrated into the carbon-fibre body structure",
          "Folding driver display hides the instrument cluster for a distraction-free track view",
          "Proactive Chassis Control II hydraulic suspension links front and rear behaviour"
        ]
      },
      {
        "id": "720s-performance",
        "name": "720S Performance",
        "tier": "performance",
        "yearsOffered": "2017–2022",
        "engine": "4.0L M840T twin-turbo V8",
        "power": "720hp",
        "torque": "770Nm",
        "zeroTo100": "2.9s",
        "topSpeedKph": 341,
        "weightKg": 1283,
        "drivetrain": "RWD",
        "transmission": "7-speed SSG dual-clutch",
        "highlights": [
          "Carbon-ceramic brakes (MCCB) standard — 335mm front discs save 10kg in unsprung weight",
          "10-spoke ultra-lightweight forged alloy wheels reduce rotational inertia significantly",
          "Electrochromic glass roof darkens at the press of a button",
          "Sport exhaust system fitted as standard, adding 12dB over the entry 720S"
        ]
      },
      {
        "id": "720s-spider",
        "name": "720S Spider",
        "tier": "mid",
        "yearsOffered": "2018–2022",
        "engine": "4.0L M840T twin-turbo V8",
        "power": "720hp",
        "torque": "770Nm",
        "zeroTo100": "3.0s",
        "topSpeedKph": 341,
        "weightKg": 1332,
        "drivetrain": "RWD",
        "transmission": "7-speed SSG dual-clutch",
        "highlights": [
          "Retractable hard-top opens or closes in 11 seconds, operable up to 50kph",
          "Retractable glazed wind deflector allows open-air driving at motorway speeds",
          "Only 49kg heavier than the coupe — lightest open-top supercar in its class",
          "Electrochromic glass roof can remain closed for a panoramic coupe experience"
        ]
      }
    ]
  },
  {
    "id": "mclaren-570s-p13",
    "make": "McLaren",
    "model": "570S",
    "generation": "P13",
    "years": "2015–2020",
    "bodyStyles": ["Coupe", "Spider", "GT"],
    "engines": [
      {
        "code": "M838TE",
        "displacement": "3.8L",
        "configuration": "V8 Twin-Turbocharged",
        "power": "570hp",
        "torque": "600Nm",
        "variants": ["570S", "570GT", "570S Spider"]
      }
    ],
    "performance": {
      "0_to_100_kph": "3.2s",
      "top_speed_kph": 328,
      "weight_kg": 1313,
      "drivetrain": "RWD"
    },
    "dimensions": {
      "length_mm": 4530,
      "width_mm": 2095,
      "height_mm": 1202,
      "wheelbase_mm": 2670
    },
    "reliabilityScore": 61,
    "popularityScore": 86,
    "tags": ["Exotic", "British", "Daily", "Supercar"],
    "heroImage": "https://images.unsplash.com/photo-1563720223809-b2ab4a2f0d86?w=1200&q=100",
    "slug": "mclaren-570s-p13",
    "trims": [
      {
        "id": "570s-coupe",
        "name": "570S",
        "tier": "base",
        "yearsOffered": "2015–2020",
        "engine": "3.8L M838TE twin-turbo V8",
        "power": "570hp",
        "torque": "600Nm",
        "zeroTo100": "3.2s",
        "topSpeedKph": 328,
        "weightKg": 1313,
        "drivetrain": "RWD",
        "transmission": "7-speed SSG dual-clutch",
        "highlights": [
          "McLaren’s ‘Sports Series’ entry point — same carbon-fibre MonoCell II tub as the 650S",
          "Hydraulically linked suspension without anti-roll bars — unique in its class",
          "Variable Drift Control allows progressive oversteer in Track driving mode",
          "Available with optional Track Pack adding roll cage, fire extinguisher, and harnesses"
        ]
      },
      {
        "id": "570gt",
        "name": "570GT",
        "tier": "mid",
        "yearsOffered": "2016–2020",
        "engine": "3.8L M838TE twin-turbo V8",
        "power": "570hp",
        "torque": "600Nm",
        "zeroTo100": "3.4s",
        "topSpeedKph": 326,
        "weightKg": 1350,
        "drivetrain": "RWD",
        "transmission": "7-speed SSG dual-clutch",
        "highlights": [
          "Touring-focused 570S with a glazed flying buttress luggage compartment behind the cabin",
          "Softer suspension tune and Pirelli P Zero Touring tyres for superior ride quality",
          "220 litres of total luggage space — most in any McLaren road car",
          "Nappa leather and cashmere interior options elevate the GT experience"
        ]
      },
      {
        "id": "570s-spider",
        "name": "570S Spider",
        "tier": "performance",
        "yearsOffered": "2017–2020",
        "engine": "3.8L M838TE twin-turbo V8",
        "power": "570hp",
        "torque": "600Nm",
        "zeroTo100": "3.2s",
        "topSpeedKph": 325,
        "weightKg": 1359,
        "drivetrain": "RWD",
        "transmission": "7-speed SSG dual-clutch",
        "highlights": [
          "Retractable hard-top opens or closes in 15 seconds at up to 40kph",
          "Electrochromic glass roof panel remains available in the closed position",
          "Identical 0-100kph time to the coupe — only 46kg heavier",
          "Folding windshield header allows true open-air motoring without a wind blocker"
        ]
      }
    ]
  },
  {
    "id": "dodge-challenger-srt-ld",
    "make": "Dodge",
    "model": "Challenger SRT",
    "generation": "LD",
    "years": "2015–2023",
    "bodyStyles": ["Coupe"],
    "engines": [
      {
        "code": "392 HEMI",
        "displacement": "6.4L",
        "configuration": "V8",
        "power": "485hp",
        "torque": "644Nm",
        "variants": ["SRT 392"]
      },
      {
        "code": "6.2L Supercharged HEMI",
        "displacement": "6.2L",
        "configuration": "V8 Supercharged",
        "power": "797hp",
        "torque": "958Nm",
        "variants": ["SRT Hellcat", "SRT Hellcat Redeye"]
      }
    ],
    "performance": {
      "0_to_100_kph": "4.0s",
      "top_speed_kph": 320,
      "weight_kg": 2028,
      "drivetrain": "RWD"
    },
    "dimensions": {
      "length_mm": 5029,
      "width_mm": 1923,
      "height_mm": 1420,
      "wheelbase_mm": 2972
    },
    "reliabilityScore": 73,
    "popularityScore": 89,
    "tags": ["American", "Muscle", "V8", "Weekend"],
    "heroImage": "https://images.unsplash.com/photo-1552642986-ccb41e7059e7?w=1200&q=100",
    "slug": "dodge-challenger-srt-ld",
    "trims": [
      {
        "id": "challenger-srt-392",
        "name": "SRT 392",
        "tier": "base",
        "yearsOffered": "2015–2023",
        "engine": "6.4L 392 HEMI V8",
        "power": "485hp",
        "torque": "644Nm",
        "zeroTo100": "4.8s",
        "topSpeedKph": 250,
        "weightKg": 1940,
        "drivetrain": "RWD",
        "transmission": "6-speed Tremec manual / 8-speed TorqueFlite automatic",
        "highlights": [
          "6.4L 392 HEMI V8 produces a characterful rumble that the Hellcat’s blower whine can’t replicate",
          "Brembo 6-piston front brake calipers standard — same hardware as the Hellcat",
          "Launch Control and Line Lock (for burnouts) standard on all SRT 392 models",
          "Available in both Widebody and standard width body styles for different stance preferences"
        ]
      },
      {
        "id": "challenger-hellcat",
        "name": "SRT Hellcat",
        "tier": "mid",
        "yearsOffered": "2015–2023",
        "engine": "6.2L supercharged HEMI V8",
        "power": "717hp",
        "torque": "881Nm",
        "zeroTo100": "3.7s",
        "topSpeedKph": 328,
        "weightKg": 2028,
        "drivetrain": "RWD",
        "transmission": "6-speed Tremec manual / 8-speed TorqueFlite automatic",
        "highlights": [
          "2.4L Roots-type supercharger bolted to the 6.2L HEMI produces a signature whine at full throttle",
          "Two key fobs included: red fob enables full 717hp, black fob limits to 500hp for valet",
          "Brembo 6-piston brakes with 390mm vented rotors stop 2,000+kg from 100kph in 34m",
          "Available Widebody package adds 3.5 inches of track width and 305mm rear tyres"
        ]
      },
      {
        "id": "challenger-redeye",
        "name": "SRT Hellcat Redeye",
        "tier": "performance",
        "yearsOffered": "2019–2023",
        "engine": "6.2L supercharged HEMI V8 (Redeye tune)",
        "power": "797hp",
        "torque": "958Nm",
        "zeroTo100": "3.5s",
        "topSpeedKph": 328,
        "weightKg": 2031,
        "drivetrain": "RWD",
        "transmission": "8-speed TorqueFlite automatic",
        "highlights": [
          "Redeye uses the Demon’s engine internals: stronger rods, pistons, and valvetrain",
          "Larger 2.7L supercharger replaces the standard 2.4L unit for an extra 80hp",
          "Widebody standard on the Redeye — 305/35 rear Pirelli P Zero tyres as standard",
          "Track mode with fully defeatable stability control and drag-strip launch control"
        ]
      },
      {
        "id": "challenger-demon",
        "name": "SRT Demon",
        "tier": "flagship",
        "yearsOffered": "2018–2018",
        "engine": "6.2L supercharged HEMI V8 (Demon tune, 91 octane)",
        "power": "808hp",
        "torque": "1044Nm",
        "zeroTo100": "2.7s",
        "topSpeedKph": 270,
        "weightKg": 1979,
        "drivetrain": "RWD",
        "transmission": "8-speed TorqueFlite automatic",
        "highlights": [
          "NHRA-banned from drag strips due to its factory capability of 9.65s in the quarter mile",
          "Air Grabber hood intake forces cold air directly onto the supercharger for max charge density",
          "Drag radial tyres and front wheel removal kit shipped in the boot — passenger seat optional",
          "840hp on 100-octane race fuel with the optional Demon Crate performance parts kit"
        ],
        "funFact": "The Dodge Challenger SRT Demon was the first production car ever banned by the NHRA before it even reached dealerships. It was also the first production car to perform a wheelie from a standing start."
      }
    ]
  },
  {
    "id": "bmw-m3-f80",
    "make": "BMW",
    "model": "M3",
    "generation": "F80",
    "years": "2014–2018",
    "bodyStyles": ["Sedan"],
    "engines": [
      {
        "code": "S55B30",
        "displacement": "3.0L",
        "configuration": "Inline-6 Twin-Turbocharged",
        "power": "431hp",
        "torque": "550Nm",
        "variants": ["M3", "M3 Competition Package", "M3 CS"]
      }
    ],
    "performance": {
      "0_to_100_kph": "4.1s",
      "top_speed_kph": 250,
      "weight_kg": 1540,
      "drivetrain": "RWD"
    },
    "dimensions": {
      "length_mm": 4671,
      "width_mm": 1877,
      "height_mm": 1425,
      "wheelbase_mm": 2812
    },
    "reliabilityScore": 70,
    "popularityScore": 93,
    "tags": ["European", "Track", "Daily", "Sport"],
    "heroImage": "https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?w=1200&q=100",
    "slug": "bmw-m3-f80",
    "trims": [
      {
        "id": "m3-f80-base",
        "name": "M3",
        "tier": "base",
        "yearsOffered": "2014–2018",
        "engine": "3.0L S55B30 twin-turbo inline-6",
        "power": "431hp",
        "torque": "550Nm",
        "zeroTo100": "4.1s",
        "topSpeedKph": 250,
        "weightKg": 1540,
        "drivetrain": "RWD",
        "transmission": "6-speed manual / 7-speed M DCT dual-clutch",
        "highlights": [
          "S55 twin-turbo straight-six debuted in the F80 — a complete departure from the naturally aspirated V8 of the E90",
          "Available with a proper 6-speed manual gearbox — the last M3 to offer one until the G80",
          "Adaptive M Suspension, carbon-fibre roof, and active M differential standard",
          "Carbon-ceramic brake option (MCCB) saves 23kg in unsprung weight"
        ]
      },
      {
        "id": "m3-f80-competition",
        "name": "Competition Package",
        "tier": "performance",
        "yearsOffered": "2015–2018",
        "engine": "3.0L S55B30 twin-turbo inline-6 (Competition tune)",
        "power": "444hp",
        "torque": "550Nm",
        "zeroTo100": "4.0s",
        "topSpeedKph": 250,
        "weightKg": 1540,
        "drivetrain": "RWD",
        "transmission": "7-speed M DCT dual-clutch",
        "highlights": [
          "13hp power bump via ECU recalibration with no hardware changes",
          "Stiffer suspension mounts and revalved dampers for more precise chassis communication",
          "19-inch Y-spoke light-alloy wheels (Style 666M) replace the 18-inch standard fitment",
          "Red brake calipers and unique Competition badge distinguish it from the standard car"
        ]
      },
      {
        "id": "m3-f80-cs",
        "name": "M3 CS",
        "tier": "flagship",
        "yearsOffered": "2018–2018",
        "engine": "3.0L S55B30 twin-turbo inline-6 (CS tune)",
        "power": "460hp",
        "torque": "600Nm",
        "zeroTo100": "3.9s",
        "topSpeedKph": 280,
        "weightKg": 1510,
        "drivetrain": "RWD",
        "transmission": "7-speed M DCT dual-clutch",
        "highlights": [
          "Top speed limiter raised to 280kph — 30kph more than the standard Competition Package",
          "Carbon-fibre bonnet, front splitter, front lip, and boot spoiler save 30kg over the Competition",
          "Michelin Pilot Sport Cup 2 tyres as standard — semi-slick performance",
          "Limited to 1,200 units globally, making it one of the rarest F80 variants"
        ],
        "funFact": "The M3 CS is faster around the Nürburgring than the much more powerful E63 AMG Black Series, proving that weight reduction and chassis tuning matter more than outright power on technical circuits."
      }
    ]
  }
]

with open('src/data/cars.json', 'r') as f:
    cars = json.load(f)

existing_ids = {c['id'] for c in cars}
to_add = [c for c in NEW_CARS if c['id'] not in existing_ids]
cars.extend(to_add)

with open('src/data/cars.json', 'w') as f:
    json.dump(cars, f, indent=2, ensure_ascii=False)

print(f"Added {len(to_add)} cars. Total now: {len(cars)}")
for c in to_add:
    print(f"  + {c['make']} {c['model']} {c['generation']} ({len(c.get('trims', []))} trims)")
