import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const SPREADSHEET_ID = "1lGRCyx9i5eAiEsj78YKBb6pk3yqf-kFQ_EE2pd3D2Ho";
const SHEET_NAME = "Registre des Inscrits";

const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;
let cachedKeyImport: Promise<CryptoKey> | null = null;

function getServiceAccountCredentials(): ServiceAccountCredentials {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    const parsed = JSON.parse(rawJson) as Partial<ServiceAccountCredentials>;
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("MISSING_CREDENTIALS");
    }
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    };
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    try {
      const filePath = path.join(process.cwd(), "service_account.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw) as Partial<ServiceAccountCredentials>;
        if (parsed.client_email && parsed.private_key) {
          return {
            client_email: parsed.client_email,
            private_key: parsed.private_key,
          };
        }
      }
    } catch (e) {
      // ignore
    }
    throw new Error("MISSING_CREDENTIALS");
  }

  return {
    client_email: clientEmail,
    private_key: privateKey.replace(/\\n/g, "\n"),
  };
}

function base64UrlEncode(value: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);

  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToKeyBytes(pem: string): Uint8Array<ArrayBuffer> {
  const normalized = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

async function getSigningKey(credentials: ServiceAccountCredentials): Promise<CryptoKey> {
  if (!cachedKeyImport) {
    cachedKeyImport = crypto.subtle.importKey(
      "pkcs8",
      pemToKeyBytes(credentials.private_key),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }
  return cachedKeyImport;
}

async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now) {
    return cachedAccessToken.token;
  }

  const iat = Math.floor(now / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: credentials.client_email,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat,
    exp: iat + 3600,
  };

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signatureBuffer = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    await getSigningKey(credentials),
    new TextEncoder().encode(signingInput)
  );

  const assertion = `${signingInput}.${base64UrlEncode(signatureBuffer)}`;
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string; expires_in?: number };
  if (!tokenData.access_token) {
    throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  }

  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: now + Math.max((tokenData.expires_in ?? 3600) - 60, 60) * 1000,
  };

  return tokenData.access_token;
}

async function sheetsApiRequest<T>(
  credentials: ServiceAccountCredentials,
  spreadsheetId: string,
  method: string,
  path: string,
  options?: { query?: Record<string, string>; body?: unknown }
): Promise<T> {
  const accessToken = await getAccessToken(credentials);
  const url = new URL(`${GOOGLE_SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}${path}`);

  for (const [key, value] of Object.entries(options?.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`GOOGLE_SHEETS_REQUEST_FAILED_${response.status}`);
  }

  return (await response.json()) as T;
}

function getSheetsClient() {
  const credentials = getServiceAccountCredentials();
  return {
    spreadsheets: {
      values: {
        get: ({ spreadsheetId, range, valueRenderOption }: { spreadsheetId: string; range: string; valueRenderOption?: string }) =>
          sheetsApiRequest<{ values?: unknown[][] }>(
            credentials,
            spreadsheetId,
            "GET",
            `/values/${encodeURIComponent(range)}`,
            valueRenderOption ? { query: { valueRenderOption } } : undefined
          ).then((data) => ({ data })),
        append: ({ spreadsheetId, range, valueInputOption, requestBody }: { spreadsheetId: string; range: string; valueInputOption: string; requestBody: { values: unknown[][] } }) =>
          sheetsApiRequest(
            credentials,
            spreadsheetId,
            "POST",
            `/values/${encodeURIComponent(range)}:append`,
            { query: { valueInputOption, insertDataOption: "INSERT_ROWS" }, body: requestBody }
          ),
        update: ({ spreadsheetId, range, valueInputOption, requestBody }: { spreadsheetId: string; range: string; valueInputOption: string; requestBody: { values: unknown[][] } }) =>
          sheetsApiRequest(
            credentials,
            spreadsheetId,
            "PUT",
            `/values/${encodeURIComponent(range)}`,
            { query: { valueInputOption }, body: requestBody }
          ),
      },
    },
  };
}

/** Format a phone number like importateur does: "+225 07 04 86 55" */
function formatPhone(dial: string, national: string): string {
  const digits = national.replace(/\D/g, "");
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 2) {
    parts.push(digits.substring(i, i + 2));
  }
  return `${dial} ${parts.join(" ")}`;
}

/** Normalize a dial code to a +prefix string without spaces */
function normalizeDial(dial: string): string {
  const digits = dial.replace(/\D/g, "");
  if (!digits) return "";
  return dial.startsWith("+") ? `+${digits}` : `+${digits}`;
}

/** Check if a dial code is present in the referentiel map */
function isDialInReferentiel(dial: string, refMap: Record<string, string>): boolean {
  const normalized = normalizeDial(dial);
  return !!refMap[normalized];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, dial, whatsapp, country, method } = body as {
      name: string;
      email: string;
      dial: string;
      whatsapp: string;
      country: string;
      method: string;
    };

    if (!name?.trim() || !email?.trim() || !dial || !whatsapp?.trim() || !country || !method) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    const sheets = getSheetsClient();
    
    // Connect and read sheet data + referentiel
    const [dataRes, refRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A5:X`,
        valueRenderOption: "UNFORMATTED_VALUE"
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Référentiel!A2:B",
      })
    ]);

    const rows = dataRes.data.values || [];
    const trimmedEmail = email.trim().toLowerCase();
    
    const formattedPhone = formatPhone(dial, whatsapp);
    const phoneNoSpaces = formattedPhone.replace(/\s/g, "");

    // 1. Search for existing user
    let foundIndex = -1;
    let rowIndex = 0;
    
    for (const row of rows) {
      const existingEmail = (row[3] || "").toString().trim().toLowerCase();
      const existingPhone = (row[2] || "").toString().replace(/[\s']/g, "");
      
      if ((existingEmail && existingEmail === trimmedEmail) || (existingPhone && existingPhone === phoneNoSpaces)) {
        foundIndex = rowIndex;
        break;
      }
      rowIndex++;
    }

    // 2. Manage Référentiel for missing dial codes
    const refRows = refRes.data.values || [];
    const referentielMap: Record<string, string> = {};
    refRows.forEach((row) => {
      let code = (row[0] || "").toString().trim();
      const nameVal = (row[1] || "").toString().trim();
      if (code && nameVal) {
        if (!code.startsWith("+")) code = "+" + code;
        referentielMap[code] = nameVal;
      }
    });

    if (!isDialInReferentiel(dial, referentielMap)) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Référentiel!A:B",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[normalizeDial(dial), country.trim()]],
        },
      });
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (foundIndex !== -1) {
      // User found: update columns S (index 18: Transaction Code), T (index 19: Payment Method), U (index 20: Bootcamp Interest), W (index 22: Statut Global)
      const targetRow = 5 + foundIndex;

      // Update Transaction Code (Column S)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!S${targetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[""]] },
      });

      // Update Payment Method (Column T)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!T${targetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[method]] },
      });

      // Update Bootcamp Interest (Column U)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!U${targetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Chaud"]] },
      });

      // Update Status (Column W)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!W${targetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Chaud Bootcamp"]] },
      });

      return NextResponse.json({ success: true, message: "Paiement enregistré pour vérification." });
    } else {
      // User not found: find an empty slot or create a new row
      let targetRowIndex = -1;
      let foundSlot = false;

      for (let i = 0; i < 500; i++) {
        const row = rows[i] || [];
        const nameVal = row[1];
        const emailVal = row[3];
        if (!nameVal && !emailVal) {
          targetRowIndex = 5 + i;
          foundSlot = true;
          break;
        }
      }

      if (!foundSlot) {
        targetRowIndex = 5 + rows.length;
      }

      const newN = targetRowIndex - 4;
      const range = `${SHEET_NAME}!A${targetRowIndex}:Y${targetRowIndex}`;
      
      const rowValues = [
        newN,                            // A: N°
        name.trim(),                     // B: Nom & Prenom
        `'${formattedPhone}`,            // C: WhatsApp
        trimmedEmail,                    // D: Email
        `=IF(C${targetRowIndex}="";"";IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");4);Référentiel!A:B;2;FALSE);IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");3);Référentiel!A:B;2;FALSE);IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");2);Référentiel!A:B;2;FALSE);"Autre"))))`, // E: Pays
        "",                              // F: Ville
        "",                              // G: Profil (blank to avoid warnings)
        "Le Guide AI",                   // H: Source d'inscription (valid value)
        "", "", "",                      // I-K
        "", "", "", "", "",              // L-P (Presence challenge)
        "",                              // Q: Attestation demandee
        "",                              // R: Paiement attestation
        "",                              // S: Code transaction (non requis)
        method,                          // T: Méthode de paiement (valid values: Orange Money, Wave, Zelle, Virement Bancaire)
        "Chaud",                         // U: Interet Bootcamp PRO 2 (valid value: Froid, Tiede, Chaud)
        "",                              // V: Derniere relance
        "Chaud Bootcamp",                // W: Statut global (valid value: Inscrit, Actif, A relancer, Chaud Bootcamp, Attestation demandee, Inactif)
        "",                              // X: Commentaires / Observations
        dateStr,                         // Y: Date d'inscription
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowValues] },
      });

      return NextResponse.json({ success: true, message: "Nouvel inscrit et paiement enregistrés." });
    }
  } catch (error: any) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
