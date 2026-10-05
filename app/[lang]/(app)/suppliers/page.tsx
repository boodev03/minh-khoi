import { notFound } from "next/navigation"
import { getDictionary } from "../../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { OptionsTablePage } from "@/components/options-table"

export default async function SuppliersPage({
  params,
}: PageProps<"/[lang]/suppliers">) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <div className="p-6">
      <OptionsTablePage kind="suppliers" dict={dict.dashboard} />
    </div>
  )
}
