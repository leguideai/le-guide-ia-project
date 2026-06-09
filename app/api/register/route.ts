import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// ---------------------------------------------------------------------------
// Constants — same as importateur/server.js
// ---------------------------------------------------------------------------

const SPREADSHEET_ID = "1lGRCyx9i5eAiEsj78YKBb6pk3yqf-kFQ_EE2pd3D2Ho";
const SHEET_NAME = "Registre des Inscrits";

const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

type SheetsValuesResponse = {
  data: {
    values?: unknown[][];
  };
};

type SheetsClient = {
  spreadsheets: {
    values: {
      get: (params: {
        spreadsheetId: string;
        range: string;
        valueRenderOption?: string;
      }) => Promise<SheetsValuesResponse>;
      append: (params: {
        spreadsheetId: string;
        range: string;
        valueInputOption: string;
        requestBody: { values: unknown[][] };
      }) => Promise<unknown>;
      update: (params: {
        spreadsheetId: string;
        range: string;
        valueInputOption: string;
        requestBody: { values: unknown[][] };
      }) => Promise<unknown>;
    };
  };
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;
let cachedKeyImport: Promise<CryptoKey> | null = null;

// ---------------------------------------------------------------------------
// Global phone directory (mirrors importateur)
// ---------------------------------------------------------------------------

const globalPhoneDirectory: Record<string, { name: string; continent: string }> = {
  // Africa
  "211": { name: "Soudan du Sud", continent: "Afrique" },
  "212": { name: "Maroc", continent: "Afrique" },
  "213": { name: "Algérie", continent: "Afrique" },
  "216": { name: "Tunisie", continent: "Afrique" },
  "218": { name: "Libye", continent: "Afrique" },
  "220": { name: "Gambie", continent: "Afrique" },
  "221": { name: "Sénégal", continent: "Afrique" },
  "222": { name: "Mauritanie", continent: "Afrique" },
  "223": { name: "Mali", continent: "Afrique" },
  "224": { name: "Guinée", continent: "Afrique" },
  "225": { name: "Côte d'Ivoire", continent: "Afrique" },
  "226": { name: "Burkina Faso", continent: "Afrique" },
  "227": { name: "Niger", continent: "Afrique" },
  "228": { name: "Togo", continent: "Afrique" },
  "229": { name: "Bénin", continent: "Afrique" },
  "230": { name: "Maurice", continent: "Afrique" },
  "231": { name: "Liberia", continent: "Afrique" },
  "232": { name: "Sierra Leone", continent: "Afrique" },
  "233": { name: "Ghana", continent: "Afrique" },
  "234": { name: "Nigéria", continent: "Afrique" },
  "235": { name: "Tchad", continent: "Afrique" },
  "236": { name: "République Centrafricaine", continent: "Afrique" },
  "237": { name: "Cameroun", continent: "Afrique" },
  "238": { name: "Cap-Vert", continent: "Afrique" },
  "239": { name: "Sao Tomé-et-Principe", continent: "Afrique" },
  "240": { name: "Guinée Équatoriale", continent: "Afrique" },
  "241": { name: "Gabon", continent: "Afrique" },
  "242": { name: "République du Congo", continent: "Afrique" },
  "243": { name: "République Démocratique du Congo", continent: "Afrique" },
  "244": { name: "Angola", continent: "Afrique" },
  "245": { name: "Guinée-Bissau", continent: "Afrique" },
  "248": { name: "Seychelles", continent: "Afrique" },
  "249": { name: "Soudan", continent: "Afrique" },
  "250": { name: "Rwanda", continent: "Afrique" },
  "251": { name: "Éthiopie", continent: "Afrique" },
  "252": { name: "Somalie", continent: "Afrique" },
  "253": { name: "Djibouti", continent: "Afrique" },
  "254": { name: "Kenya", continent: "Afrique" },
  "255": { name: "Tanzanie", continent: "Afrique" },
  "256": { name: "Ouganda", continent: "Afrique" },
  "257": { name: "Burundi", continent: "Afrique" },
  "258": { name: "Mozambique", continent: "Afrique" },
  "260": { name: "Zambie", continent: "Afrique" },
  "261": { name: "Madagascar", continent: "Afrique" },
  "262": { name: "La Réunion / Mayotte", continent: "Afrique" },
  "263": { name: "Zimbabwe", continent: "Afrique" },
  "264": { name: "Namibie", continent: "Afrique" },
  "265": { name: "Malawi", continent: "Afrique" },
  "266": { name: "Lesotho", continent: "Afrique" },
  "267": { name: "Botswana", continent: "Afrique" },
  "268": { name: "Eswatini", continent: "Afrique" },
  "269": { name: "Comores", continent: "Afrique" },
  "27": { name: "Afrique du Sud", continent: "Afrique" },
  "291": { name: "Érythrée", continent: "Afrique" },
  // Europe
  "30": { name: "Grèce", continent: "Europe" },
  "31": { name: "Pays-Bas", continent: "Europe" },
  "32": { name: "Belgique", continent: "Europe" },
  "33": { name: "France", continent: "Europe" },
  "34": { name: "Espagne", continent: "Europe" },
  "36": { name: "Hongrie", continent: "Europe" },
  "39": { name: "Italie", continent: "Europe" },
  "40": { name: "Roumanie", continent: "Europe" },
  "41": { name: "Suisse", continent: "Europe" },
  "43": { name: "Autriche", continent: "Europe" },
  "44": { name: "Royaume-Uni", continent: "Europe" },
  "45": { name: "Danemark", continent: "Europe" },
  "46": { name: "Suède", continent: "Europe" },
  "47": { name: "Norvège", continent: "Europe" },
  "48": { name: "Pologne", continent: "Europe" },
  "49": { name: "Allemagne", continent: "Europe" },
  "350": { name: "Gibraltar", continent: "Europe" },
  "351": { name: "Portugal", continent: "Europe" },
  "352": { name: "Luxembourg", continent: "Europe" },
  "353": { name: "Irlande", continent: "Europe" },
  "354": { name: "Islande", continent: "Europe" },
  "355": { name: "Albanie", continent: "Europe" },
  "356": { name: "Malte", continent: "Europe" },
  "357": { name: "Chypre", continent: "Europe" },
  "358": { name: "Finlande", continent: "Europe" },
  "359": { name: "Bulgarie", continent: "Europe" },
  "370": { name: "Lituanie", continent: "Europe" },
  "371": { name: "Lettonie", continent: "Europe" },
  "372": { name: "Estonie", continent: "Europe" },
  "373": { name: "Moldavie", continent: "Europe" },
  "374": { name: "Arménie", continent: "Europe" },
  "375": { name: "Biélorussie", continent: "Europe" },
  "376": { name: "Andorre", continent: "Europe" },
  "377": { name: "Monaco", continent: "Europe" },
  "378": { name: "Saint-Marin", continent: "Europe" },
  "380": { name: "Ukraine", continent: "Europe" },
  "381": { name: "Serbie", continent: "Europe" },
  "382": { name: "Monténégro", continent: "Europe" },
  "383": { name: "Kosovo", continent: "Europe" },
  "385": { name: "Croatie", continent: "Europe" },
  "386": { name: "Slovénie", continent: "Europe" },
  "387": { name: "Bosnie-Herzégovine", continent: "Europe" },
  "389": { name: "Macédoine du Nord", continent: "Europe" },
  "420": { name: "République Tchèque", continent: "Europe" },
  "421": { name: "Slovaquie", continent: "Europe" },
  "423": { name: "Liechtenstein", continent: "Europe" },
  // America
  "1": { name: "USA / Canada", continent: "Amérique du Nord" },
  "51": { name: "Pérou", continent: "Amérique du Sud" },
  "52": { name: "Mexique", continent: "Amérique du Nord" },
  "53": { name: "Cuba", continent: "Amérique Centrale" },
  "54": { name: "Argentine", continent: "Amérique du Sud" },
  "55": { name: "Brésil", continent: "Amérique du Sud" },
  "56": { name: "Chili", continent: "Amérique du Sud" },
  "57": { name: "Colombie", continent: "Amérique du Sud" },
  "58": { name: "Venezuela", continent: "Amérique du Sud" },
  "501": { name: "Belize", continent: "Amérique Centrale" },
  "502": { name: "Guatemala", continent: "Amérique Centrale" },
  "503": { name: "El Salvador", continent: "Amérique Centrale" },
  "504": { name: "Honduras", continent: "Amérique Centrale" },
  "505": { name: "Nicaragua", continent: "Amérique Centrale" },
  "506": { name: "Costa Rica", continent: "Amérique Centrale" },
  "507": { name: "Panama", continent: "Amérique Centrale" },
  "509": { name: "Haïti", continent: "Amérique Centrale" },
  // Asia / Oceania
  "7": { name: "Russie / Kazakhstan", continent: "Asie & Océanie" },
  "20": { name: "Égypte", continent: "Afrique" },
  "60": { name: "Malaisie", continent: "Asie & Océanie" },
  "61": { name: "Australie", continent: "Asie & Océanie" },
  "62": { name: "Indonésie", continent: "Asie & Océanie" },
  "63": { name: "Philippines", continent: "Asie & Océanie" },
  "64": { name: "Nouvelle-Zélande", continent: "Asie & Océanie" },
  "65": { name: "Singapour", continent: "Asie & Océanie" },
  "66": { name: "Thaïlande", continent: "Asie & Océanie" },
  "81": { name: "Japon", continent: "Asie & Océanie" },
  "82": { name: "Corée du Sud", continent: "Asie & Océanie" },
  "84": { name: "Vietnam", continent: "Asie & Océanie" },
  "86": { name: "Chine", continent: "Asie & Océanie" },
  "90": { name: "Turquie", continent: "Asie & Océanie" },
  "91": { name: "Inde", continent: "Asie & Océanie" },
  "92": { name: "Pakistan", continent: "Asie & Océanie" },
  "93": { name: "Afghanistan", continent: "Asie & Océanie" },
  "94": { name: "Sri Lanka", continent: "Asie & Océanie" },
  "95": { name: "Birmanie", continent: "Asie & Océanie" },
  "98": { name: "Iran", continent: "Asie & Océanie" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const normalized = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function getSigningKey(credentials: ServiceAccountCredentials): Promise<CryptoKey> {
  if (!cachedKeyImport) {
    cachedKeyImport = crypto.subtle.importKey(
      "pkcs8",
      pemToArrayBuffer(credentials.private_key),
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
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    expires_in?: number;
  };

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
  options?: {
    query?: Record<string, string>;
    body?: unknown;
  }
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

function getSheetsClient(): SheetsClient {
  const credentials = getServiceAccountCredentials();

  return {
    spreadsheets: {
      values: {
        get: ({ spreadsheetId, range, valueRenderOption }) =>
          sheetsApiRequest<{ values?: unknown[][] }>(
            credentials,
            spreadsheetId,
            "GET",
            `/values/${encodeURIComponent(range)}`,
            valueRenderOption ? { query: { valueRenderOption } } : undefined
          ).then((data) => ({ data })),
        append: ({ spreadsheetId, range, valueInputOption, requestBody }) =>
          sheetsApiRequest(
            credentials,
            spreadsheetId,
            "POST",
            `/values/${encodeURIComponent(range)}:append`,
            {
              query: {
                valueInputOption,
                insertDataOption: "INSERT_ROWS",
              },
              body: requestBody,
            }
          ),
        update: ({ spreadsheetId, range, valueInputOption, requestBody }) =>
          sheetsApiRequest(
            credentials,
            spreadsheetId,
            "PUT",
            `/values/${encodeURIComponent(range)}`,
            {
              query: {
                valueInputOption,
              },
              body: requestBody,
            }
          ),
      },
    },
  };
}

/** Format a phone number like importateur does: "+225 07 04 86 55" */
function formatPhone(dial: string, national: string): string {
  // dial already has "+" prefix, e.g. "+225"
  // national is digits only, e.g. "0704865558"
  const digits = national.replace(/\D/g, "");
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 2) {
    parts.push(digits.substring(i, i + 2));
  }
  return `${dial} ${parts.join(" ")}`;
}

/** Resolve the base prefix digits for an indicatif (without +) */
function resolveDialDigits(dial: string): { prefix: string; name: string } | null {
  // dial comes as "+225" → digits = "225"
  const digits = dial.startsWith("+") ? dial.substring(1) : dial;

  // Try 3-digit, 2-digit, 1-digit lookups (same cascade as importateur)
  if (digits.length >= 3) {
    const d3 = digits.substring(0, 3);
    if (globalPhoneDirectory[d3]) return { prefix: "+" + d3, name: globalPhoneDirectory[d3].name };
  }
  if (digits.length >= 2) {
    const d2 = digits.substring(0, 2);
    if (globalPhoneDirectory[d2]) return { prefix: "+" + d2, name: globalPhoneDirectory[d2].name };
  }
  if (digits.length >= 1) {
    const d1 = digits.substring(0, 1);
    if (globalPhoneDirectory[d1]) return { prefix: "+" + d1, name: globalPhoneDirectory[d1].name };
  }
  return null;
}

/** Check if a dial code is present in the referentiel map (cascade check) */
function isDialInReferentiel(dial: string, refMap: Record<string, string>): boolean {
  const digits = dial.startsWith("+") ? dial.substring(1) : dial;

  // For +1 (USA/Canada) check exact
  if (dial.startsWith("+1")) {
    return !!refMap[dial];
  }

  // Cascade: 3-digit, 2-digit, 1-digit
  if (digits.length >= 3 && refMap["+" + digits.substring(0, 3)]) return true;
  if (digits.length >= 2 && refMap["+" + digits.substring(0, 2)]) return true;
  if (digits.length >= 1 && refMap["+" + digits.substring(0, 1)]) return true;
  return false;
}

// ---------------------------------------------------------------------------
// POST /api/register
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, dial, whatsapp, country, profil } = body as {
      name: string;
      email: string;
      dial: string;
      whatsapp: string;
      country: string;
      profil: string;
    };

    // ---- Basic validation ----
    if (!name?.trim() || !email?.trim() || !dial || !whatsapp?.trim() || !profil) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const formattedPhone = formatPhone(dial, whatsapp);
    const phoneNoSpaces = formattedPhone.replace(/\s/g, "");

    // ---- Connect to Google Sheets ----
    const sheets = getSheetsClient();

    // ---- Read existing data + referentiel in parallel ----
    const [dataRes, refRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A5:X`,
        valueRenderOption: "UNFORMATTED_VALUE",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Référentiel!A2:B",
      }),
    ]);

    const rows = dataRes.data.values || [];

    // ---- Check duplicates (email in col D=index 3, phone in col C=index 2) ----
    for (const row of rows) {
      const existingEmail = (row[3] || "").toString().trim().toLowerCase();
      const existingPhone = (row[2] || "").toString().replace(/[\s']/g, "");

      if (existingEmail && existingEmail === trimmedEmail) {
        return NextResponse.json(
          { error: "Cette adresse email est déjà inscrite au Challenge IA.", field: "email" },
          { status: 409 }
        );
      }
      if (existingPhone && existingPhone === phoneNoSpaces) {
        return NextResponse.json(
          { error: "Ce numéro WhatsApp est déjà inscrit au Challenge IA.", field: "whatsapp" },
          { status: 409 }
        );
      }
    }

    // ---- Manage Référentiel (add missing dial code if needed) ----
    const refRows = refRes.data.values || [];
    const referentielMap: Record<string, string> = {};
    refRows.forEach((row) => {
      let indicatif = (row[0] || "").toString().trim();
      const countryName = (row[1] || "").toString().trim();
      if (indicatif && countryName) {
        if (!indicatif.startsWith("+")) indicatif = "+" + indicatif;
        referentielMap[indicatif] = countryName;
      }
    });

    if (!isDialInReferentiel(dial, referentielMap)) {
      const resolved = resolveDialDigits(dial);
      if (resolved) {
        // Add the base prefix to the Référentiel sheet
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: "Référentiel!A:B",
          valueInputOption: "RAW",
          requestBody: {
            values: [[resolved.prefix, resolved.name]],
          },
        });
      }
    }

    // ---- Find empty slot (same logic as importateur) ----
    const maxTemplateRows = 500; // rows 5 to 504
    let targetRowIndex = -1;
    let foundSlot = false;

    for (let i = 0; i < maxTemplateRows; i++) {
      const row = rows[i] || [];
      const nameVal = row[1];
      const emailVal = row[3];
      if (!nameVal && !emailVal) {
        targetRowIndex = 5 + i;
        foundSlot = true;
        break;
      }
    }

    // ---- Build the row values (B through X) ----
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (foundSlot) {
      // Insert into existing template slot (B:X)
      const range = `${SHEET_NAME}!B${targetRowIndex}:X${targetRowIndex}`;
      const rowValues = [
        name.trim(),                     // B: Nom & Prenom
        `'${formattedPhone}`,            // C: WhatsApp (prefixed with ' for text format)
        trimmedEmail,                    // D: Email
        `=IF(C${targetRowIndex}="";"";IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");4);Référentiel!A:B;2;FALSE);IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");3);Référentiel!A:B;2;FALSE);IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");2);Référentiel!A:B;2;FALSE);"Autre"))))`, // E: Pays
        "",                              // F: Ville
        profil,                          // G: Profil
        "Le Guide AI",                   // H: Source d'inscription
        "",                              // I: CV pret
        "",                              // J: LinkedIn pret
        "",                              // K: Interet session
        "", "", "", "", "",              // L-P: J1-J5
        "",                              // Q: Attestation demandee
        "",                              // R: Paiement
        "",                              // S: Code transaction
        "",                              // T: Interet Bootcamp
        "",                              // U: Derniere relance
        "Inscrit",                       // V: Statut global
        "",                              // W: Commentaires
        dateStr,                         // X: Date d'inscription
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValues],
        },
      });
    } else {
      // Append beyond template rows (A:X) — include the N° column
      targetRowIndex = 5 + rows.length;
      const newN = targetRowIndex - 4;
      const range = `${SHEET_NAME}!A${targetRowIndex}:X${targetRowIndex}`;
      const rowValues = [
        newN,                            // A: N°
        name.trim(),                     // B: Nom & Prenom
        `'${formattedPhone}`,            // C: WhatsApp
        trimmedEmail,                    // D: Email
        `=IF(C${targetRowIndex}="";"";IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");4);Référentiel!A:B;2;FALSE);IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");3);Référentiel!A:B;2;FALSE);IFERROR(VLOOKUP(LEFT(SUBSTITUTE(C${targetRowIndex};" ";"");2);Référentiel!A:B;2;FALSE);"Autre"))))`, // E: Pays
        "",                              // F: Ville
        profil,                          // G: Profil
        "Le Guide AI",                   // H: Source d'inscription
        "",                              // I
        "",                              // J
        "",                              // K
        "", "", "", "", "",              // L-P
        "",                              // Q
        "",                              // R
        "",                              // S
        "",                              // T
        "",                              // U
        "Inscrit",                       // V: Statut global
        "",                              // W
        dateStr,                         // X: Date d'inscription
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValues],
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Inscription enregistrée avec succès.",
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Return a useful message for Cloudflare/Google setup issues.
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const message =
      errorMessage === "MISSING_CREDENTIALS"
        ? "Variables d'environnement Google manquantes ou invalides."
        : errorMessage === "GOOGLE_TOKEN_EXCHANGE_FAILED"
          ? "Impossible d'obtenir un jeton Google. Vérifie le client email et la private key."
          : errorMessage.startsWith("GOOGLE_SHEETS_REQUEST_FAILED_")
            ? "Google Sheets refuse la requête. Vérifie que le service account a accès au spreadsheet."
            : `Une erreur est survenue lors de l'inscription (${errorMessage}).`;

    return NextResponse.json({ error: message, code: errorMessage }, { status: 500 });
  }
}
