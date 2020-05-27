import { ATA } from "./ata_src/ata";

function main() {

  let settings: ATA.Settings = {
    restrictDomain: true,
    allowedDomains: ['cornell.edu'],
    domainIsCaseSensitive: false
  };
  ATA.startServer(8080, settings);

}

main();