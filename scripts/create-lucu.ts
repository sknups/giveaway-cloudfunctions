import * as fs from 'fs';
const droplinksLegacy = import('@sknups/drop-links-legacy');

async function main(keyFile: string, giveaway: string, identifier: string, limit?: number) {

  const key = fs.readFileSync(keyFile).toString();
  const lib = await droplinksLegacy;

  if (limit) {
    const dropLink = lib.LegacyDropLinks.createLimitedDropLink(key, giveaway, identifier, limit);
    console.log(dropLink.lucu);
  } else {
    const dropLink = lib.LegacyDropLinks.createUnrestrictedDropLink(key, giveaway, identifier);
    console.log(dropLink.lucu);
  }

}

const args = process.argv.slice(2);

if (args.length < 3 || args.length > 4) {
  console.error('Usage: create-lucu.ts <keyPath> <giveaway> <identifier> [<limit>]');
  process.exit(1);
}

main(args[0], args[1], args[2], args[3] ? Number.parseInt(args[3]) : undefined);
