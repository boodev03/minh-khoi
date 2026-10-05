import path from "path"
import { readFile } from "fs/promises"
import ExcelJS from "exceljs"
import { getDictionary } from "../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { getElements } from "@/lib/concrete"

// exceljs only embeds jpeg/png/gif — webp uploads are skipped.
const IMAGE_TYPES: Record<string, "jpeg" | "png" | "gif"> = {
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".png": "png",
  ".gif": "gif",
}

async function loadImage(url: string) {
  const extension = IMAGE_TYPES[path.extname(url).toLowerCase()]
  if (!extension) return null
  try {
    const buffer = await readFile(
      path.join(process.cwd(), "public", url)
    )
    return { buffer, extension }
  } catch {
    return null
  }
}

const IMG_SIZE = 60 // px
const IMG_GAP = 8 // px
const COL_PX = 7 // approx px per excel column width unit
const MAX_PHOTOS = 3

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  if (!hasLocale(lang)) {
    return new Response("Not found", { status: 404 })
  }

  const dict = await getDictionary(lang)
  const t = dict.dashboard.table
  const elements = getElements()

  const dateFmt = new Intl.DateTimeFormat(
    lang === "vi" ? "vi-VN" : "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  )
  const fmtDate = (iso: string) => dateFmt.format(new Date(iso))

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(t.title)

  const photoColWidth =
    Math.ceil((MAX_PHOTOS * (IMG_SIZE + IMG_GAP)) / COL_PX) + 1

  sheet.columns = [
    { key: "name", width: 36 },
    { key: "pourDate", width: 14 },
    { key: "supplier", width: 26 },
    { key: "category", width: 18 },
    { key: "volume", width: 14 },
    { key: "sampleSets", width: 10 },
    { key: "curing", width: 18 },
    { key: "pourPhoto", width: photoColWidth },
    { key: "test", width: 22 },
    { key: "testPhoto", width: photoColWidth },
    { key: "status", width: 20 },
  ]
  sheet.getRow(1).values = [
    t.element,
    t.pourDate,
    dict.dashboard.form.supplier,
    dict.dashboard.form.category,
    t.volume,
    t.sampleSets,
    t.curing,
    t.photo,
    t.test,
    t.testPhoto,
    t.status,
  ]
  sheet.getRow(1).font = { bold: true }

  const embedPhotos = async (
    urls: string[],
    col: number,
    row: number
  ) => {
    for (let i = 0; i < Math.min(urls.length, MAX_PHOTOS); i++) {
      const img = await loadImage(urls[i])
      if (!img) continue
      const imageId = workbook.addImage(
        img as unknown as ExcelJS.Image
      )
      sheet.addImage(imageId, {
        tl: {
          col: col + (i * (IMG_SIZE + IMG_GAP)) / COL_PX,
          row: row + 0.06,
        },
        ext: { width: IMG_SIZE, height: IMG_SIZE },
        editAs: "oneCell",
      })
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    const row = sheet.addRow({
      name: el.name,
      pourDate: fmtDate(el.pourDate),
      supplier: el.supplier,
      category: el.category,
      volume: el.volume,
      sampleSets: el.sampleSets,
      curing: t.curingDays.replace("{days}", String(el.curingDays)),
      test: el.testDate
        ? `${fmtDate(el.testDate)} — ${el.testResult} ${t.mpa}`
        : t.notTested,
      status: t.statuses[el.status],
    })
    row.alignment = { vertical: "middle" }

    // 0-based row index for image anchoring (header = 0)
    await embedPhotos(el.photoUrls, 7, i + 1)
    await embedPhotos(el.testPhotoUrls, 9, i + 1)
    if (el.photoUrls.length || el.testPhotoUrls.length) {
      row.height = IMG_SIZE * 0.8 // px -> points
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="concrete-elements.xlsx"`,
    },
  })
}
