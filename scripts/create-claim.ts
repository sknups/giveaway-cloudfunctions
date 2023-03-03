const droplinks = import('@sknups/drop-links');

async function main(key: string, giveaway: string, identifier: number, limit?: number) {

  const lib = await droplinks;

  if (limit) {
    const dropLink = lib.DropLinks.createLimitedDropLink(key, giveaway, identifier, limit);
    console.log(dropLink.claim);
  } else {
    const dropLink = lib.DropLinks.createUnrestrictedDropLink(key, giveaway, identifier);
    console.log(dropLink.claim);
  }

}

const args = process.argv.slice(2);

if (args.length < 3 || args.length > 4) {
  console.error('Usage: create-claim.ts <key> <giveaway> <identifier> [<limit>]');
  process.exit(1);
}

main(args[0], args[1], Number.parseInt(args[2]), args[3] ? Number.parseInt(args[3]) : undefined);
