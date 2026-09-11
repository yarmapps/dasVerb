import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/der-artikel-prices.json', 'utf8'));

console.log('Sample Monthly:', data.monthly.slice(0, 10));
console.log('Sample Yearly:', data.yearly.slice(0, 10));

// Let's see how USD countries are priced:
const usdYearly = data.yearly.filter((y: any) => ['USA', 'DEU', 'RUS', 'TUR', 'BRA', 'IND', 'KAZ', 'UKR', 'EGY', 'VNM', 'IDN', 'NGA', 'GBR', 'CAN', 'AUS'].includes(y.territoryCode));
console.log('\nKey markets in Yearly:', usdYearly);

const usdMonthly = data.monthly.filter((m: any) => ['USA', 'DEU', 'RUS', 'TUR', 'BRA', 'IND', 'KAZ', 'UKR', 'EGY', 'VNM', 'IDN', 'NGA', 'GBR', 'CAN', 'AUS'].includes(m.territoryCode));
console.log('\nKey markets in Monthly:', usdMonthly);
