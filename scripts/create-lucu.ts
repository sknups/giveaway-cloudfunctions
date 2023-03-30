import * as fs from 'fs';
import { createLimitedDropLinkLegacy, createUnrestrictedDropLinkLegacy } from '../src/helpers/drop-links';

async function main(keyFile: string, giveaway: string, identifier: string, limit?: number) {

  const key = fs.readFileSync(keyFile).toString();

  if (limit) {
    const lucu = await createLimitedDropLinkLegacy(key, giveaway, identifier, limit);
    console.log(lucu);
  } else {
    const lucu = await createUnrestrictedDropLinkLegacy(key, giveaway, identifier);
    console.log(lucu);
  }

}

const args = process.argv.slice(2);

if (args.length < 3 || args.length > 4) {
  console.error('Usage: create-lucu.ts <keyPath> <giveaway> <identifier> [<limit>]');
  process.exit(1);
}

main(args[0], args[1], args[2], args[3] ? Number.parseInt(args[3]) : undefined);
