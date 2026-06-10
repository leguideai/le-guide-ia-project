import { NextResponse } from "next/server";
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
    // Try reading service_account.json in project root as a fallback
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
      // ignore and fall through to error
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

let cachedKeyImport: Promise<CryptoKey> | null = null;

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

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

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
      },
    },
  };
}

export async function GET() {
  try {
    const sheets = getSheetsClient();

    // Read the Statut global column (V) starting row 5
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!V5:V`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    // Read the Pays column (E) starting row 5 to compute distinct countries
    const countriesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!E5:E`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const rows = res.data.values || [];
    let count = 0;
    for (const row of rows) {
      const val = (row[0] || "").toString().trim().toLowerCase();
      if (val === "inscrit") count += 1;
    }

    const countryRows = countriesRes.data.values || [];
    const countrySet = new Set<string>();
    for (const r of countryRows) {
      const c = (r[0] || "").toString().trim();
      if (c) countrySet.add(c.toLowerCase());
    }

    return NextResponse.json({ count, countriesCount: countrySet.size });
  } catch (err: unknown) {
    console.error("KPI inscrits error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
