import os
import glob
import re


#vul hieronder tussen de aanhalingstekens het pad van de locatie van deze map
bestandslocatie = r""


def main():
    while True:
        print("\n" + "="*60)
        print("")
        invoer = input("Plaats? (of 'tabel gemeenteraadszetels' / 'makkelijke zetels' / 'stop'): ").strip().lower()
        
        if invoer == "stop":
            break
        elif invoer == "tabel gemeenteraadszetels":
            toon_gemeenteraadstabel()
        elif invoer == "makkelijke zetels":
            vind_makkelijkste_zetel()
        elif invoer == "controle aantal bestanden":
            print("aantal resultaatbestanden: ", len(glob.glob(bestandslocatie + r"\Resultaat_GR2022*.eml.xml")))
            print("aantal tellingbestanden: ", len(glob.glob(bestandslocatie + r"\Telling_GR2022*.eml.xml")))
        else:
            verwerk_plaats(invoer.lower().strip())

def verwerk_plaats(plaats):

    basispad = bestandslocatie + r"\Telling_GR2022_"
    resultaatpad = bestandslocatie + r"\Resultaat_GR2022_"

    telling_pad = basispad + plaats + ".eml.xml"
    resultaat_pad = resultaatpad + plaats + ".eml.xml"

    if not os.path.exists(telling_pad):
        print(f"❌ Telling bestand niet gevonden: {telling_pad}")
        return
    if not os.path.exists(resultaat_pad):
        print(f"❌ Resultaat bestand niet gevonden: {resultaat_pad}")
        return

    print(f"\n📊 Verwerken: {plaats}")
    
    with open(telling_pad, "r", encoding="utf-8") as f:
        telling_inhoud = f.read()

    with open(resultaat_pad, "r", encoding="utf-8") as f:
        resultaat_inhoud = f.read()

    zetels = resultaat_inhoud.count("<Candidate>")
    print(f"Aantal zetels: {zetels}")

    if zetels <= 0:
        print("❌ Geen <Candidate> tags gevonden.")
        return

    try:
        start_tag = "<TotalVotes>"
        end_tag = "</TotalVotes>"
        start_idx = telling_inhoud.find(start_tag)
        end_idx = telling_inhoud.find(end_tag)
        totalvotes_block = telling_inhoud[start_idx + len(start_tag):end_idx]

        tc_start_tag = "<TotalCounted>"
        tc_end_tag = "</TotalCounted>"
        tc_start_idx = totalvotes_block.find(tc_start_tag)
        tc_end_idx = totalvotes_block.find(tc_end_tag)
        stemmen = int(totalvotes_block[tc_start_idx + len(tc_start_tag):tc_end_idx].strip())
        
        kiesdeler = stemmen / zetels
        partijen = parseer_partijen(totalvotes_block)
        
        if not partijen:
            print("❌ Geen partijen gevonden.")
            return
            
        log_restzetels = []
        zetelverdeling = bereken_zetelverdeling(partijen, stemmen, zetels, kiesdeler, log_restzetels)
        toon_resultaat(zetelverdeling, stemmen, zetels, kiesdeler, plaats, log_restzetels)
        
    except Exception as e:
        print(f"❌ Fout bij verwerking: {e}")

def toon_gemeenteraadstabel():
    basisdir = bestandslocatie + r"\Resultaat_GR2022*.eml.xml"
    bestanden = glob.glob(basisdir)
    
    print("\n" + "="*70)
    print("GEMEENTERAAD ZETELS OVERZICHT")
    print("="*70)
    print(f"{'#':>2} {'Gemeente':<28} {'Zetels':>6}")
    print("-"*70)
    
    gemeentes = []
    fouten = 0
    
    for bestand in bestanden:
        basename = os.path.basename(bestand)
        match = re.search(r"Resultaat_GR2022_([^.]+)\.eml\.xml", basename)
        if not match:
            fouten += 1
            continue
            
        plaats = match.group(1)
        
        try:
            with open(bestand, "r", encoding="utf-8") as f:
                inhoud = f.read()
            zetels = inhoud.count("<Candidate>")
            if zetels > 0:
                gemeentes.append((plaats, zetels))
            else:
                fouten += 1
                print(f"  ⚠️  {plaats:<28} Fout: geen <Candidate> tags")
        except Exception as e:
            fouten += 1
            print(f"  ⚠️  {plaats:<28} Fout bij lezen: {str(e)[:30]}...")
    
    if not gemeentes:
        print("❌ Geen geldige Resultaat_GR2022 bestanden gevonden.")
        return
    
    gemeentes.sort(key=lambda x: (-x[1], x[0]))
    
    for i, (plaats, zetels) in enumerate(gemeentes, 1):
        print(f"{i:>2d} {plaats:<28} {zetels:>6}")
    
    print("-"*70)
    print(f"Totaal {len(gemeentes)} gemeenten succesvol, {fouten} fouten")
    print(f"Totaal bestanden gevonden: {len(bestanden)}")

def vind_makkelijkste_zetel():
    basisdir = bestandslocatie + r"\Telling_GR2022*.eml.xml"
    telling_bestanden = glob.glob(basisdir)
    
    makkelijke_zetels = []
    
    print("\n🔍 Zoek makkelijkste zetel (0 volle zetels → 1 restzetel)...")
        
    for telling_bestand in telling_bestanden:
        basename = os.path.basename(telling_bestand)
        plaats = basename.replace("Telling_GR2022_", "").replace(".eml.xml", "")
        
        resultaat_bestand = bestandslocatie + r"\Resultaat_GR2022_" + plaats + r".eml.xml"
        if not os.path.exists(resultaat_bestand):
            continue
            
        try:
            with open(telling_bestand, "r", encoding="utf-8") as f:
                telling_inhoud = f.read()
            with open(resultaat_bestand, "r", encoding="utf-8") as f:
                resultaat_inhoud = f.read()
                
            zetels = resultaat_inhoud.count("<Candidate>")
            if zetels <= 0: continue
            
            start_tag = "<TotalVotes>"
            end_tag = "</TotalVotes>"
            start_idx = telling_inhoud.find(start_tag)
            end_idx = telling_inhoud.find(end_tag)
            if start_idx == -1 or end_idx == -1: continue
                
            totalvotes_block = telling_inhoud[start_idx + len(start_tag):end_idx]
            
            tc_start_tag = "<TotalCounted>"
            tc_end_tag = "</TotalCounted>"
            tc_start_idx = totalvotes_block.find(tc_start_tag)
            tc_end_idx = totalvotes_block.find(tc_end_tag)
            if tc_start_idx == -1 or tc_end_idx == -1: continue
                
            stemmen = int(totalvotes_block[tc_start_idx + len(tc_start_tag):tc_end_idx].strip())
            kiesdeler = stemmen / zetels
            
            partijen = parseer_partijen(totalvotes_block)
            if not partijen: continue
            
            log_restzetels = []
            zetelverdeling = bereken_zetelverdeling(partijen, stemmen, zetels, kiesdeler, log_restzetels)
            
            for partij in zetelverdeling:
                if partij["volle_zetels"] == 0 and partij["zetels"] == 1:
                    percentage_kiesdeler = (partij["stemmen"] / kiesdeler) * 100
                    makkelijke_zetels.append({
                        "plaats": plaats,
                        "partij": partij["naam"],
                        "stemmen": partij["stemmen"],
                        "percentage_kiesdeler": percentage_kiesdeler
                    })
                    
        except:
            continue
    
    if makkelijke_zetels:
        makkelijke_zetels.sort(key=lambda x: x["percentage_kiesdeler"])
        ingevoerde_partij = input("Partij? (voer \'alle\' in voor de volledige lijst): ").lower().strip()
        print("\n" + "="*80)
        print("MAKKELIJKSTE ZETELS (0 volle → 1 restzetel)")
        print("="*80)
        print(f"{'Plaats':<20} {'Partij':<20} {'Stemmen':>8} {'%kiesdeler':>10}")
        print("-"*80)
        
        gewenste_partij = ingevoerde_partij
        if ingevoerde_partij == "sgp":
            gewenste_partij = "Staatkundig Gereformeerde Partij (SGP)"
        elif ingevoerde_partij == "cu":
            gewenste_partij = "ChristenUnie"
        elif ingevoerde_partij == "pvda":
            gewenste_partij = "Partij van de Arbeid (p.v.d.a.)"
        elif ingevoerde_partij == "fvd":
            gewenste_partij = "Forum voor Democratie"
        elif ingevoerde_partij == "bvnl":
            gewenste_partij = "Belang van Nederland (BVNL)"
        elif ingevoerde_partij == "pvv":
            gewenste_partij = "PVV (Partij voor de Vrijheid)"
        elif ingevoerde_partij == "cu-sgp":
            gewenste_partij = "ChristenUnie-SGP"
        elif ingevoerde_partij == "sp":
            gewenste_partij = "SP (Socialistische Partij)"
        else:
            gewenste_partij = ingevoerde_partij
        telling_makkelijke_zetels = 0
        for zetel in makkelijke_zetels:
            if gewenste_partij != 'alle':
                if str(f"{zetel['partij']:<20}".lower().strip()) == str(gewenste_partij).lower().strip():
                    print(f"{zetel['plaats']:<20} {zetel['partij']:<20} {zetel['stemmen']:>8,} {zetel['percentage_kiesdeler']:>9.1f}%")
                    telling_makkelijke_zetels = telling_makkelijke_zetels + 1
                else:
                    continue
            elif gewenste_partij == "alle":
                telling_makkelijke_zetels = len(makkelijke_zetels)
                print(f"{zetel['plaats']:<20} {zetel['partij']:<20} {zetel['stemmen']:>8,} {zetel['percentage_kiesdeler']:>9.1f}%")
        if telling_makkelijke_zetels != 0:         
            print("Totaal aantal makkelijke zetels voor deze partij: ", telling_makkelijke_zetels) 
        elif telling_makkelijke_zetels == len(makkelijke_zetels):
            print("Totaal aantal makkelijke zetels: ", telling_makkelijke_zetels)
        else:
            print("❌ Deze partij heeft geen makkelijke zetels gehaald")
    else:
        print("Geen partijen gevonden met 0 volle zetels maar wel 1 restzetel.")

def parseer_partijen(totalvotes_block):
    rn_start = "<RegisteredName>"
    rn_end = "</RegisteredName>"
    vv_start = "<ValidVotes>"
    vv_end = "</ValidVotes>"

    index = 0
    partijen = []

    while True:
        rn_s = totalvotes_block.find(rn_start, index)
        if rn_s == -1: break

        rn_e = totalvotes_block.find(rn_end, rn_s)
        if rn_e == -1: break

        partijnaam = totalvotes_block[rn_s + len(rn_start):rn_e].strip()

        vv_s = totalvotes_block.find(vv_start, rn_e)
        if vv_s == -1: break

        vv_e = totalvotes_block.find(vv_end, vv_s)
        if vv_e == -1: break

        partijstemmen_str = totalvotes_block[vv_s + len(vv_start):vv_e].strip()
        try:
            partijstemmen = int(partijstemmen_str)
        except ValueError:
            index = vv_e + len(vv_end)
            continue

        partijen.append({"naam": partijnaam, "stemmen": partijstemmen})
        index = vv_e + len(vv_end)
    
    return partijen

def bereken_zetelverdeling(partijen, stemmen, zetels, kiesdeler, log_restzetels):
    for p in partijen:
        volle_zetels = int(p["stemmen"] // kiesdeler)
        p["volle_zetels"] = volle_zetels
        p["zetels"] = volle_zetels
        p["rest_gemiddelden"] = False

    totaal_volle_zetels = sum(p["volle_zetels"] for p in partijen)
    restzetels = zetels - totaal_volle_zetels


    log_restzetels.clear()

    if restzetels > 0:
        if zetels >= 19:
            verdeel_restzetels_grootste_gemiddelden(partijen, restzetels, log_restzetels)
        else:
            verdeel_restzetels_grootste_overschotten(partijen, restzetels, kiesdeler, log_restzetels)
    
    return partijen


def toon_resultaat(partijen, stemmen, zetels, kiesdeler, plaats, log_restzetels):
    for p in partijen:
        p["percentage"] = (p["stemmen"] / stemmen) * 100

    partijen_gesorteerd = sorted(partijen, key=lambda p: (-p["zetels"], -p["stemmen"]))

    print("\n" + "="*80)
    print(f"DEFINITIEVE ZETELVERDELING {plaats.upper()}")
    print("="*80)
    print(f"{'Partij':<25} {'Zetels':>6} {'Stemmen':>8} {'%':>6}")
    print("-"*80)
    
    
    for p in partijen_gesorteerd:
        pct = p["percentage"]
        print(f"{p['naam']:<25} {p['zetels']:>6} {p['stemmen']:>8,} {pct:>6.1f}%")

    totaal_zetels = sum(p["zetels"] for p in partijen)
    print("-"*80)
    print(f"{'TOTAAL':<25} {totaal_zetels:>6} {stemmen:>8,} {100.0:>6.1f}%")

    print("kiesdeler: ", kiesdeler, " stemmen")
    print("\n📋 VOLGORDE TOEKENNING RESTZETELS:")
    print("-"*60)
    if not log_restzetels:
        print("Geen restzetels toegekend.")
    else:
        for entry in log_restzetels:
            nummer = entry["nummer"]
            ronde = entry["ronde"]
            partij = entry["partij"]
            maat = entry["maat"]
            if ronde == "overschot":
                print(f"Restzetel {nummer:2d}: {partij:<25} (overschot = {maat:7.1f})")
            else:
                print(f"Restzetel {nummer:2d}: {partij:<25} (gemiddelde = {maat:7.1f})")

        laatste = log_restzetels[-1]
        top3 = laatste.get("top3")
        if top3:
            print("\nVolgende kandidaten voor de LAATSTE restzetel:")
            label = "overschot" if laatste["ronde"] == "overschot" else "gemiddelde"
            winnaar = laatste["partij"]
            for naam, waarde in top3:
                if naam == winnaar:
                    continue  # sla de winnaar zelf over
                print(f"  - {naam:<25} ({label} = {waarde:7.1f})")

def verdeel_restzetels_grootste_gemiddelden(partijen, restzetels, log_restzetels):
    
    for i in range(restzetels):
        kandidaten = []
        for p in partijen:
            gemiddeld = p["stemmen"] / (p["zetels"] + 1)
            kandidaten.append((p, gemiddeld))
        
        kandidaten.sort(key=lambda x: x[1], reverse=True)
        if not kandidaten:
            break
        
        beste_partij, beste_gemiddelde = kandidaten[0]
        beste_partij["zetels"] += 1

        entry = {
            "nummer": len(log_restzetels) + 1,
            "ronde": "gemiddelden",
            "partij": beste_partij["naam"],
            "maat": beste_gemiddelde
        }

        if i == restzetels - 1:
            top3 = []
            for p, gem in kandidaten:  
                top3.append((p["naam"], gem))
            entry["top3"] = top3

        log_restzetels.append(entry)


def verdeel_restzetels_grootste_overschotten(partijen, restzetels, kiesdeler, log_restzetels):

    partijen_met_restzetel = set()

    resterende_restzetels = restzetels

    kandidaten = []
    for p in partijen:
        if p["stemmen"] >= 0.75 * kiesdeler:
            overschot = p["stemmen"] - p["volle_zetels"] * kiesdeler
            kandidaten.append((p, overschot))
    kandidaten.sort(key=lambda x: x[1], reverse=True)
    
    toegewezen = 0
    for p, overschot in kandidaten:
        if toegewezen >= restzetels:
            break
        p["zetels"] += 1
        resterende_restzetels -= 1
        partijen_met_restzetel.add(p["naam"])

        entry = {
            "nummer": len(log_restzetels) + 1,
            "ronde": "overschot",
            "partij": p["naam"],
            "maat": overschot
        }

        # Alleen als dit de allerlaatste restzetel is (na beide rondes)
        if resterende_restzetels == 0:
            # Bouw lijst van kandidaten zonder partijen die al een restzetel hebben
            filtered = [(q["naam"], ov) for q, ov in kandidaten
                        if q["naam"] not in partijen_met_restzetel]
            # Neem maximaal 3
            
            entry["top3"] = filtered[:3]

        log_restzetels.append(entry)
        toegewezen += 1

    # --- Ronde 2: grootste gemiddelden (voor eventueel resterende restzetels) ---
    for i in range(resterende_restzetels):
        kandidaten2 = []
        for p in partijen:
            if p["rest_gemiddelden"]:
                continue
            gemiddeld = p["stemmen"] / (p["zetels"] + 1)
            kandidaten2.append((p, gemiddeld))
        kandidaten2.sort(key=lambda x: x[1], reverse=True)
        if not kandidaten2:
            break

        beste_partij, beste_gemiddelde = kandidaten2[0]
        beste_partij["zetels"] += 1
        beste_partij["rest_gemiddelden"] = True
        partijen_met_restzetel.add(beste_partij["naam"])

        entry = {
            "nummer": len(log_restzetels) + 1,
            "ronde": "gemiddelden",
            "partij": beste_partij["naam"],
            "maat": beste_gemiddelde
        }

        if i == resterende_restzetels - 1:
            filtered = [(q["naam"], gem) for q, gem in kandidaten2
                        if q["naam"] not in partijen_met_restzetel]
            entry["top3"] = filtered[:3]

        log_restzetels.append(entry)

if __name__ == "__main__":
    main()