const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const tellingXml = fs.readFileSync('../2022/Telling_GR2022_Rotterdam.eml.xml', 'utf-8');
const tellingDoc = parser.parse(tellingXml);

const selections = tellingDoc.EML.Count.Election.Contests.Contest.TotalVotes.Selection;
const p12 = selections.find(s => s.AffiliationIdentifier && s.AffiliationIdentifier['@_Id'] === '12');
console.log(JSON.stringify(p12, null, 2));
