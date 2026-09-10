import { useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";

interface SmartFormSectionPanelProps {
  store: StoreType;
}

const BILL_OF_SALE_PRESETS = [
  {
    name: "🚗 Автомобіль Tesla Model Y",
    seller: "Олександр Коваленко (Паспорт: КМ123456)",
    buyer: "Марія Петренко (Паспорт: АА987654)",
    dateLocation: "10 вересня 2026 р., м. Київ, Україна",
    itemDetails:
      "2024 Tesla Model Y (Black, VIN: 5YJ3E1EA1KF123456, Держ. номер: KA7777BP)",
    price: "$25,000.00 USD (Двадцять п'ять тисяч доларів США)",
  },
  {
    name: "🏎️ Автомобіль BMW X5",
    seller: "ТОВ «Авто Гарант» (ЄДРПОУ 39482019)",
    buyer: "Іван Дмитренко (Паспорт: ВВ456789)",
    dateLocation: "15 серпня 2026 р., м. Львів",
    itemDetails:
      "2023 BMW X5 xDrive40i (VIN: WBAKR010900L98765, Держ. номер: BC1234AB)",
    price: "$48,500.00 USD (Сорок вісім тисяч п'ятсот доларів США)",
  },
  {
    name: "💻 Ноутбук MacBook Pro M3",
    seller: "Сергій Бондаренко",
    buyer: "Олена Ткаченко",
    dateLocation: "01 вересня 2026 р., м. Одеса",
    itemDetails:
      'Apple MacBook Pro 16" M3 Max 36GB RAM / 1TB SSD (S/N: C02X1234MD6R)',
    price: "$2,800.00 USD (Дві тисячі вісімсот доларів США)",
  },
];

interface PolotnoElement {
  id: string;
  type: string;
  name?: string;
  text?: string;
  placeholder?: string;
  set: (props: Record<string, unknown>) => void;
}

export const SmartFormSectionPanel: FC<SmartFormSectionPanelProps> = observer(
  ({ store }) => {
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSavedPro, setIsSavedPro] = useState(false);

    // Extract all text elements across pages in the Polotno store
    const textElements = store.pages.flatMap((page) =>
      page.children.filter((el) => el.type === "text")
    ) as unknown as PolotnoElement[];

    const handleTextChange = (element: PolotnoElement, newText: string) => {
      element.set({ text: newText });
    };

    const handleElementFocus = (element: PolotnoElement) => {
      store.selectElements([element.id]);
    };

    const handleApplyPreset = (preset: (typeof BILL_OF_SALE_PRESETS)[0]) => {
      setIsAiLoading(true);
      setSelectedPreset(preset.name);

      setTimeout(() => {
        setIsAiLoading(false);
        // Find elements by id or position in defaultTemplate
        const sellerEl =
          textElements.find((el) => el.id === "seller-name") ||
          textElements[2];
        const buyerEl =
          textElements.find((el) => el.id === "buyer-name") ||
          textElements[4];
        const dateEl =
          textElements.find((el) => el.id === "date-location-val") ||
          textElements[6];
        const itemEl =
          textElements.find((el) => el.id === "item-details") ||
          textElements[8];
        const priceEl =
          textElements.find((el) => el.id === "price-val") ||
          textElements[10];

        if (sellerEl) sellerEl.set({ text: preset.seller });

        if (buyerEl) buyerEl.set({ text: preset.buyer });

        if (dateEl) dateEl.set({ text: preset.dateLocation });

        if (itemEl) itemEl.set({ text: preset.itemDetails });

        if (priceEl) priceEl.set({ text: preset.price });
      }, 500);
    };

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <SidePanelSectionLabel label="Smart Form" type="header" />
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase">
              Bill of Sale
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Швидке заповнення полів договору купівлі-продажу. Зміни показуються
            на документі наживо!
          </p>
        </div>

        {/* AI Presets Quick Fill */}
        <div className="space-y-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <span>⚡</span> Готові зразки угоди
            </span>
            {isAiLoading && (
              <span className="animate-spin text-xs text-blue-600">🌀</span>
            )}
          </div>
          <p className="text-[11px] leading-snug text-blue-800/80">
            Оберіть об'єкт продажу для миттєвого підтягування всіх реквізитів:
          </p>
          <div className="flex flex-col gap-1.5">
            {BILL_OF_SALE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className={`w-full rounded-lg px-3 py-1.5 text-left text-xs font-semibold shadow-2xs transition-all ${
                  selectedPreset === preset.name
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-blue-200 bg-white text-blue-800 hover:bg-blue-100/80"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editable Text Fields Form */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">
              Поля договору ({textElements.length})
            </span>
            <span className="text-[10px] text-gray-400">
              Клікніть для виділення
            </span>
          </div>

          {textElements.map((el, index) => {
            const currentText = el.text || "";
            const label =
              el.name ||
              `Поле ${index + 1} (${currentText.slice(0, 18)}${
                currentText.length > 18 ? "..." : ""
              })`;

            return (
              <div
                key={el.id || index}
                className="flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-3 shadow-2xs transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
              >
                <div className="flex items-center justify-between">
                  <label className="truncate text-[11px] font-semibold text-gray-600">
                    {label}
                  </label>
                  <span className="font-mono text-[9px] text-gray-400">
                    #{index + 1}
                  </span>
                </div>
                <textarea
                  rows={currentText.length > 40 ? 2 : 1}
                  value={currentText}
                  onFocus={() => handleElementFocus(el)}
                  onChange={(e) => handleTextChange(el, e.target.value)}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs font-medium text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            );
          })}
        </div>

        {/* Pro Retention Feature: Save Profile Preset */}
        <div className="mt-2 space-y-2 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <span>⭐</span> Зберегти реквізити для купчої (PRO)
            </span>
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase">
              PRO
            </span>
          </div>
          <p className="text-[11px] leading-snug text-amber-800/90">
            Збережіть реквізити продавця або компанії для автоматичного
            заповнення договорів у 1 клік.
          </p>
          <button
            onClick={() => setIsSavedPro(!isSavedPro)}
            className={`w-full rounded-lg py-1.5 text-xs font-semibold shadow-2xs transition-all ${
              isSavedPro
                ? "bg-green-600 text-white"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            {isSavedPro
              ? "✓ Паспортні дані та реквізити збережено"
              : "💾 Зберегти профіль реквізитів"}
          </button>
        </div>
      </div>
    );
  }
);
