Uitslagen verkiezing voor de Tweede Kamer (2023).

Let op: dit is onderzoeksdata, en dus geen officiële verkiezingsuitslag!

==========
TK2023_uitslag.csv
==========
Dit csv bestand bevat de uitslag zoals deze geïmporteerd is op www.verkiezingsuitslagen.nl. Hierin staan de gekozen kandidaten, het aantal zetels per partij en het aantal behaalde stemmen op gemeente-, kieskring-, provincie- en landelijk niveau. Op landelijk-, provincie- en kieskringniveau zijn ook het aantal stemmen per kandidaat opgenomen. Op gemeenteniveau alleen het aantal stemmen per partij.

Kolommen:
Regio:			De naam van de regio waar de rij betrekking op heeft		
RegioCode:		De codering van de regio waar de rij betrekking op heeft
			De prefix geeft het type regio aan:
				'G':	Gemeente
				'O':	Openbaar lichaam
				'K':	Kieskring
				'P':	Provincie
				'L':	Land		
OuderRegioCode:		De RegioCode van de regio waar de regio van de rij direct onder valt		
GrootOuderRegioCode:	De RegioCode van de regio waar de OuderRegioCode direct onder valt
Partij:			Nodig voor de import, in de praktijk is deze waarde altijd leeg
LijstNummer:		Het lijstnummer van de lijst waar de rij betrekking op heeft. Leeg indien niet van toepassing
LijstNaam:		De naam van de lijst waar de rij betrekking op heeft. Leeg indien niet van toepassing
KandidaatNummer:	Het kandidaatnummer van de kandidaat waar de rij betrekking op heeft. Leeg indien niet van toepassing
KandidaatInitialen:	De initialen van de kandidaat waar de rij betrekking op heeft. Leeg indien niet van toepassing
KandidaatVoornaam:	De voornaam van de kandidaat waar de rij betrekking op heeft. Leeg indien niet van toepassing of indien de voornaam niet op de kandidatenlijst stond
KandidaatTussenvoegsel:	Het tussenvoegsel van de kandidaat waar de rij betrekking op heeft. Leeg indien niet van toepassing of indien de kandidaat geen tussenvoegsel heeft
KandidaatAchternaam:	De achternaam van de kandidaat waar de rij betrekking op heeft. Leeg indien niet van toepassing
KandidaatWoonplaats:	De woonplaats van de kandidaat waar de rij betrekking op heeft. Leeg indien niet van toepassing
KandidaatGeslacht:	Het geslacht van de kandidaat waar de rij betrekking op heeft. Leeg indien niet van toepassing of indien het geslacht niet op de kandidatenlijst stond
VeldType:		Het type waarde dat deze rij beschrijft. Mogelijke waarden:
				- AantalBlancoStemmen
				- AantalGeldigeStemmen
				- AantalOngeldigeStemmen
				- KandidaatAantalStemmen
				- KandidaatGekozen
				- Kiesgerechtigden
				- LijstAantalStemmen
				- LijstAantalZetels
				- Opkomst
Waarde:			De waarde horende bij wat deze rij beschrijft.

==========
TK2023_Stemmen_Per_Lijst_Per_Stembureau.csv
==========
Dit csv bestand bevat de uitslagen van de verkiezing voor de Tweede Kamer (2023) op lijstniveau per stembureau, en is een verwerking van de EML bestanden van deze verkiezing op Gemeentelijk stembureauniveau.

Kolommen:
GemeenteCode:		Het gemeentenummer (CBS-codering) zonder voorloopnullen
GemeenteNaam:		De naam van de gemeente
Postcode:		De postcode van het stembureau, mits deze ingevuld is in de EML
StembureauNaam:		De naam van het stembureau
StembureauCode:		Het nummer van het stembureau, gecodeerd als SB gevolgd door het nummer
PartijNaam:		De aanduiding van de politieke partij waar het over gaat
AantalStemmen:		Het aantal stemmen op deze partij, op dit stembureau in deze gemeente

