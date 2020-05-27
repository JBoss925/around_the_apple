import * as ata_server from './ata_server';

export namespace ATA {

  // Define the settings
  export interface Settings {
    // Domain settings
    restrictDomain: boolean;
    allowedDomains?: string[];
    domainIsCaseSensitive?: boolean;
    // Field names
    emailFieldName?: string;
  }
  // Define the settings
  export interface ResolvedSettings {
    // Domain settings
    restrictDomain: boolean;
    allowedDomains: string[];
    domainIsCaseSensitive: boolean;
    // Field names
    emailFieldName: string;
  }

  // Express server
  export const express = ata_server.expressInstance;
  export const getExpressApp = () => {
    ata_server.assertServerStarted();
    return ata_server.expressApp;
  };
  export let startServer = ata_server.startServer;

}