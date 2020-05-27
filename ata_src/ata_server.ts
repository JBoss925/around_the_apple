import express from 'express';
import { Request, Response } from 'express';
import { ATA } from './ata';
import { isUndefined, isNullOrUndefined } from 'util';
import { AssertionError } from 'assert';
import * as EmailValidator from 'email-validator';

export const expressInstance = express;
export let expressApp: express.Application;

let currentSettings: ATA.ResolvedSettings;
let serverStarted: boolean = false;

function resolveSettings(settings?: ATA.Settings) {
  if (settings == undefined) {
    console.log("[ATA] No settings provided, using default settings. \n"
      + "\trestrictDomain: false\n" + "\temailFieldName: \'email\'");
    currentSettings = {
      domainIsCaseSensitive: false,
      allowedDomains: [],
      restrictDomain: false,
      emailFieldName: 'email'
    };
    return;
  }
  if (isNullOrUndefined(settings.domainIsCaseSensitive)) {
    settings.domainIsCaseSensitive = false;
    console.log("[ATA] Domain case sensitivity not set, using default: false");
  }
  if (isNullOrUndefined(settings.emailFieldName)) {
    settings.emailFieldName = 'email'
    console.log("[ATA] No email field name provided, using default: \'email\'");
  }
  if (settings.restrictDomain) {
    if (isNullOrUndefined(settings.allowedDomains)) {
      settings.allowedDomains = [];
      console.log("[ATA] WARNING: Domain restriction enabled but no domains "
        + "provided!");
    }
  }
  if (isNullOrUndefined(settings.allowedDomains)) {
    settings.allowedDomains = [];
  }
  currentSettings = {
    restrictDomain: settings.restrictDomain,
    allowedDomains: settings.allowedDomains,
    domainIsCaseSensitive: settings.domainIsCaseSensitive,
    emailFieldName: settings.emailFieldName
  };
  return;
}

export function assertServerStarted() {
  if (!serverStarted) {
    throw new AssertionError({
      message: "[ATA] Attempted to use server before calling ATA.startServer()!"
    });
  }
}

function doDomainCheck(email: string) {
  let domainSplits = email.split("@");
  let domain = domainSplits[domainSplits.length - 1];
  if (!currentSettings.domainIsCaseSensitive) {
    return currentSettings.allowedDomains.map(
      (val) => val.toLowerCase()).includes(domain.toLowerCase());
  } else {
    return currentSettings.allowedDomains.includes(domain);
  }
}

let domainCheck: express.RequestHandler = (req, res, next) => {
  let email = req.body[currentSettings.emailFieldName];
  if (isNullOrUndefined(email)) {
    res.status(403).json({
      error: "Email not found in request body."
    });
    return;
  }
  if (typeof email != "string") {
    res.status(403).json({
      error: "Email given was not a string."
    });
    return;
  }
  if (!EmailValidator.validate(email)) {
    res.status(403).json({
      error: "Email given in invalid format."
    });
    return;
  }
  if (!doDomainCheck(email)) {
    res.status(403).json({
      error: "Email domain not allowed."
    });
    return;
  }
  next();
}

let authUser = (req: Request, res: Response) => {

}

export function startServer(port: number, settings?: ATA.Settings) {

  resolveSettings(settings);

  const app = express();
  expressApp = app;

  app.use(domainCheck);

  app.get("/", authUser);

  app.listen(port, () => {
    console.log(`[ATA] ata server started at http://localhost:${port}`);
  });

  serverStarted = true;
}