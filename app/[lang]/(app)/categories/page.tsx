import { notFound } from "next/navigation"
import { getDictionary } from "../../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { getOptions } from "@/lib/options"
import { OptionsTablePage } from "@/components/options-table"

export const dynamic = "force-dynamic"

export default async function CategoriesPage({
  params,
}: PageProps<"/[lang]/categories">) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const items = await getOptions("categories")

  return (
    <div className="p-6">
      <OptionsTablePage
        kind="categories"
        dict={dict.dashboard}
        lang={lang}
        items={items}
      />
    </div>
  )
}
