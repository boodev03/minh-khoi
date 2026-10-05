import "server-only"

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
}

// --- In-memory store ------------------------------------------------------
// TODO: replace with real DB tables once persistence is added.

const elements: ConcreteElement[] = []

export function getElements(): ConcreteElement[] {
  return elements
}

export type NewElement = Omit<
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
>

// 1 tổ mẫu per 20 m³ — anything ≤ 20 m³ is still 1 set.
function computeSampleSets(volume: number) {
  return Math.max(1, Math.ceil(volume / 20))
}

function computeStatus(pourDate: string, testDueDays: number): ElementStatus {
  const due = new Date(pourDate)
  due.setDate(due.getDate() + testDueDays)
  return new Date() > due ? "overdue" : "curing"
}

export function addElement(data: NewElement): ConcreteElement {
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
  elements.push(element)
  return element
}

export function updateElement(id: string, data: NewElement) {
  const i = elements.findIndex((e) => e.id === id)
  if (i === -1) return
  const prev = elements[i]
  const status =
    prev.status === "passed" || prev.status === "failed"
      ? prev.status
      : computeStatus(data.pourDate, prev.testDueDays)
  elements[i] = {
    ...prev,
    ...data,
    sampleSets: computeSampleSets(data.volume),
    status,
  }
}

export function removeElement(id: string) {
  const i = elements.findIndex((e) => e.id === id)
  if (i !== -1) elements.splice(i, 1)
}

export function setElementStatus(id: string, status: ElementStatus) {
  const el = elements.find((e) => e.id === id)
  if (el) el.status = status
}

export function addElementPhoto(
  id: string,
  photoUrl: string,
  kind: "pour" | "test"
) {
  const el = elements.find((e) => e.id === id)
  if (!el) return
  if (kind === "test") el.testPhotoUrls.push(photoUrl)
  else el.photoUrls.push(photoUrl)
}


