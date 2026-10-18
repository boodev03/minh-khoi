import "server-only"

import { google, type sheets_v4 } from "googleapis"

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

const TABS = {
  elements: "Elements",
  suppliers: "Suppliers",
  categories: "Categories",
  projects: "Projects",
  buildings: "Buildings",
} as const

export type SheetTab = keyof typeof TABS

export const ELEMENT_HEADERS = [
  "id",
  "name",
  "pourDate",
  "supplier",
  "category",
  "volume",
  "sampleSets",
  "curingDays",
  "curingRemindersPerDay",
  "notifyChannel",
  "testDueDays",
  "photoUrls",
  "testPhotoUrls",
  "testDate",
  "testResult",
  "status",
  "buildingId",
] as const

const PROJECT_HEADERS = ["id", "name"]
const BUILDING_HEADERS = ["id", "projectId", "name"]
const BUILDING_ID_COL = ELEMENT_HEADERS.indexOf("buildingId")

function client(): sheets_v4.Sheets {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  if (!SPREADSHEET_ID || !email || !key) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY."
    )
  }
  const auth = new google.auth.JWT({ email, key, scopes: SCOPES })
  return google.sheets({ version: "v4", auth })
}

const tabIds = new Map<string, number>()
let setupPromise: Promise<void> | null = null

async function fetchTabIds() {
  const res = await client().spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: "sheets.properties",
  })
  for (const s of res.data.sheets ?? []) {
    const { title, sheetId } = s.properties ?? {}
    if (title && sheetId != null) tabIds.set(title, sheetId)
  }
}

async function doSetup() {
  const sheets = client()
  await fetchTabIds()

  const missing = Object.values(TABS).filter((t) => !tabIds.has(t))
  if (missing.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: missing.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    })
    await fetchTabIds()
  }

  const elHeader = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.elements}!A1:Z1`,
  })
  // Also upgrades sheets created before a column was added.
  if ((elHeader.data.values?.[0]?.length ?? 0) < ELEMENT_HEADERS.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TABS.elements}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [ELEMENT_HEADERS as unknown as string[]] },
    })
  }

  const simpleTabs: [string, string[]][] = [
    [TABS.suppliers, ["Name"]],
    [TABS.categories, ["Name"]],
    [TABS.projects, PROJECT_HEADERS],
    [TABS.buildings, BUILDING_HEADERS],
  ]
  for (const [tab, headers] of simpleTabs) {
    const head = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!A1`,
    })
    if (!head.data.values?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tab}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      })
    }
  }

  await attachOrphanElements()
}

// Elements created before projects/buildings existed have no buildingId.
// Park them in an auto-created default project + building so nothing is lost.
async function attachOrphanElements() {
  const sheets = client()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.elements}!A2:Z`,
  })
  const rows = (res.data.values as string[][] | undefined) ?? []
  const hasOrphans = rows.some((r) => r[0] && !r[BUILDING_ID_COL])
  if (!hasOrphans) return

  const projectId = crypto.randomUUID()
  const buildingId = crypto.randomUUID()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.projects}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[projectId, "Default project"]] },
  })
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.buildings}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[buildingId, projectId, "Default building"]] },
  })

  const col = String.fromCharCode(65 + BUILDING_ID_COL)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.elements}!${col}2:${col}${rows.length + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: rows.map((r) => [r[0] ? r[BUILDING_ID_COL] || buildingId : ""]),
    },
  })
}

export function ensureSetup() {
  return (setupPromise ??= doSetup())
}

export async function readRange(
  tab: SheetTab,
  range: string
): Promise<string[][]> {
  await ensureSetup()
  const res = await client().spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS[tab]}!${range}`,
  })
  return (res.data.values as string[][] | undefined) ?? []
}

export async function appendRow(tab: SheetTab, values: (string | number)[]) {
  await ensureSetup()
  await client().spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS[tab]}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  })
}

export async function updateRow(
  tab: SheetTab,
  rowNumber: number,
  values: (string | number)[]
) {
  await ensureSetup()
  await client().spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS[tab]}!A${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  })
}

export async function deleteRow(tab: SheetTab, rowNumber: number) {
  await ensureSetup()
  const sheetId = tabIds.get(TABS[tab])
  if (sheetId === undefined) {
    throw new Error(`Sheet tab "${TABS[tab]}" not found`)
  }
  await client().spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  })
}
