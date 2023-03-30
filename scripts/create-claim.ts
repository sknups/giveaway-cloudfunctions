import { createLimitedDropLink, createUnrestrictedDropLink } from '../src/helpers/drop-links';

async function main(key: string, giveaway: string, identifier: number, limit?: number) {

  if (limit) {
    const claim = await createLimitedDropLink(key, giveaway, identifier, limit);
    console.log(claim);
  } else {
    const claim = await createUnrestrictedDropLink(key, giveaway, identifier);
    console.log(claim);
  }

}

const args = process.argv.slice(2);

if (args.length < 3 || args.length > 4) {
  console.error('Usage: create-claim.ts <key> <giveaway> <identifier> [<limit>]');
  process.exit(1);
}

main(args[0], args[1], Number.parseInt(args[2]), args[3] ? Number.parseInt(args[3]) : undefined);
