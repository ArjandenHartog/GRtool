const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const xml = fs.readFileSync('../2022/Resultaat_GR2022_sGravenhage.eml.xml', 'utf-8');
const doc = parser.parse(xml);

const selections = doc.EML.Result.Election.Contest.Selection;
for (const s of selections) {
    if (s.AffiliationIdentifier) {
        console.log(`ID=${s.AffiliationIdentifier['@_Id']}, Name=${s.AffiliationIdentifier.RegisteredName}`);
    }
}
