import "server-only"

import {
  appendRow,
  deleteRow,
  readRange,
  updateRow,
} from "@/lib/sheets"

export type ElementStatus = "curing" | "due" | "overdue" | "passed" | "failed"
export type NotifyChannel = "web" | "email" | "both"

export type ConcreteElement = {
  id: string
  /** Cấu kiện */
  name: string
  /** Ngày đổ (ISO date) */
  pourDate: string
  /** NCC — nhà cung cấp / trạm trộn */
  supplier: string
  /** Hạng mục */
  category: string
  /** Khối lượng (m³) */
  volume: number
  /** Số tổ mẫu */
  sampleSets: number
  /** Số ngày bảo dưỡng theo biện pháp */
  curingDays: number
  /** Nhắc hẹn bảo dưỡng — số lần/ngày */
  curingRemindersPerDay: number
  /** Kênh thông báo: web / email / cả hai */
  notifyChannel: NotifyChannel
  /** Nhắc hẹn nén mẫu — số ngày sau ngày đổ (mặc định 28) */
  testDueDays: number
  /** Ảnh hiện trường */
  photoUrls: string[]
  /** Ảnh kết quả nén mẫu */
  testPhotoUrls: string[]
  /** Ngày nén mẫu (ISO date) */
  testDate: string | null
  /** Kết quả nén (MPa) */
  testResult: number | null
  status: ElementStatus
  /** Tòa nhà / block the element belongs to (see lib/projects.ts) */
  buildingId: string
}

const ELEMENT_RANGE = "A2:Q"

const num = (v: string | undefined) => (v ? Number(v) : 0)
const arr = (v: string | undefined): string[] => {
  try {
    return v ? (JSON.parse(v) as string[]) : []
  } catch {
    return []
  }
}
const str = (v: string | undefined) => (v ? v : null)

function rowToElement(row: string[]): ConcreteElement {
  const [
    id,
    name,
    pourDate,
    supplier,
    category,
    volume,
    sampleSets,
    curingDays,
    curingRemindersPerDay,
    notifyChannel,
    testDueDays,
    photoUrls,
    testPhotoUrls,
    testDate,
    testResult,
    status,
    buildingId,
  ] = row
  return {
    id,
    name,
    pourDate,
    supplier,
    category,
    volume: num(volume),
    sampleSets: num(sampleSets),
    curingDays: num(curingDays),
    curingRemindersPerDay: num(curingRemindersPerDay),
    notifyChannel: (notifyChannel as NotifyChannel) || "web",
    testDueDays: num(testDueDays) || 28,
    photoUrls: arr(photoUrls),
    testPhotoUrls: arr(testPhotoUrls),
    testDate: str(testDate),
    testResult: testResult ? Number(testResult) : null,
    status: (status as ElementStatus) || "curing",
    buildingId: buildingId ?? "",
  }
}

function elementToRow(el: ConcreteElement): (string | number)[] {
  return [
    el.id,
    el.name,
    el.pourDate,
    el.supplier,
    el.category,
    el.volume,
    el.sampleSets,
    el.curingDays,
    el.curingRemindersPerDay,
    el.notifyChannel,
    el.testDueDays,
    JSON.stringify(el.photoUrls),
    JSON.stringify(el.testPhotoUrls),
    el.testDate ?? "",
    el.testResult ?? "",
    el.status,
    el.buildingId,
  ]
}

export async function getElements(
  buildingIds?: string[]
): Promise<ConcreteElement[]> {
  const rows = await readRange("elements", ELEMENT_RANGE)
  const all = rows.filter((r) => r[0]).map(rowToElement)
  if (!buildingIds) return all
  const wanted = new Set(buildingIds)
  return all.filter((el) => wanted.has(el.buildingId))
}

async function getRowById(
  id: string
): Promise<{ rowNumber: number; el: ConcreteElement } | null> {
  const rows = await readRange("elements", ELEMENT_RANGE)
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === id) {
      return { rowNumber: i + 2, el: rowToElement(rows[i]) }
    }
  }
  return null
}

/** Fields a user edits on an element; the building is fixed at creation. */
export type ElementInput = Omit<
  ConcreteElement,
  | "id"
  | "sampleSets"
  | "photoUrls"
  | "testPhotoUrls"
  | "testDate"
  | "testResult"
  | "status"
  | "notifyChannel"
  | "testDueDays"
  | "buildingId"
>

export type NewElement = ElementInput & { buildingId: string }

// 1 tổ mẫu per 20 m³ — anything ≤ 20 m³ is still 1 set.
function computeSampleSets(volume: number) {
  return Math.max(1, Math.ceil(volume / 20))
}

function computeStatus(pourDate: string, testDueDays: number): ElementStatus {
  const due = new Date(pourDate)
  due.setDate(due.getDate() + testDueDays)
  return new Date() > due ? "overdue" : "curing"
}

export async function addElement(
  data: NewElement
): Promise<ConcreteElement> {
  const element: ConcreteElement = {
    ...data,
    id: crypto.randomUUID(),
    sampleSets: computeSampleSets(data.volume),
    notifyChannel: "web",
    testDueDays: 28,
    photoUrls: [],
    testPhotoUrls: [],
    testDate: null,
    testResult: null,
    status: computeStatus(data.pourDate, 28),
  }
  await appendRow("elements", elementToRow(element))
  return element
}

export async function updateElement(id: string, data: ElementInput) {
  const found = await getRowById(id)
  if (!found) return
  const prev = found.el
  const status =
    prev.status === "passed" || prev.status === "failed"
      ? prev.status
      : computeStatus(data.pourDate, prev.testDueDays)
  const next: ConcreteElement = {
    ...prev,
    ...data,
    sampleSets: computeSampleSets(data.volume),
    status,
  }
  await updateRow("elements", found.rowNumber, elementToRow(next))
}

export async function removeElement(id: string) {
  const found = await getRowById(id)
  if (found) await deleteRow("elements", found.rowNumber)
}

export async function setElementStatus(id: string, status: ElementStatus) {
  const found = await getRowById(id)
  if (!found) return
  await updateRow("elements", found.rowNumber, elementToRow({ ...found.el, status }))
}

export async function addElementPhoto(
  id: string,
  photoUrl: string,
  kind: "pour" | "test"
) {
  const found = await getRowById(id)
  if (!found) return
  const el = found.el
  if (kind === "test") el.testPhotoUrls.push(photoUrl)
  else el.photoUrls.push(photoUrl)
  await updateRow("elements", found.rowNumber, elementToRow(el))
}
