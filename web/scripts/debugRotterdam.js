const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const xml = fs.readFileSync('../2022/Resultaat_GR2022_Rotterdam.eml.xml', 'utf-8');
const doc = parser.parse(xml);

const selections = doc.EML.Result.Election.Contest.Selection;
const p12 = selections.find(s => s.AffiliationIdentifier && s.AffiliationIdentifier['@_Id'] === '12');
console.log('AffiliationIdentifier for List 12:', p12.AffiliationIdentifier);
