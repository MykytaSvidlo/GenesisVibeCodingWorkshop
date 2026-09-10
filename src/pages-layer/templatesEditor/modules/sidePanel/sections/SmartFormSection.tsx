import { useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";

interface SmartFormSectionPanelProps {
  store: StoreType;
}

interface FieldHint {
  label: string;
  hint: string;
}

const FIELD_HINTS_MAP: Record<string, FieldHint> = {
  "seller-name": {
    label: "Seller Full Name",
    hint: "💡 Enter seller's full legal name as shown on official photo ID / Driver's License.",
  },
  "seller-address": {
    label: "Seller Street Address",
    hint: "💡 Official street address, city, state, and ZIP code of seller.",
  },
  "buyer-name": {
    label: "Buyer Full Name",
    hint: "💡 Legal name of the purchaser acquiring ownership.",
  },
  "buyer-address": {
    label: "Buyer Street Address",
    hint: "💡 Purchaser's residence or billing address for registration.",
  },
  "vehicle-details": {
    label: "Year, Make & Model",
    hint: "💡 Specify model year, manufacturer, model name, trim, and color.",
  },
  "vin-number": {
    label: "Vehicle Identification Number (VIN)",
    hint: "💡 17-character unique VIN found on vehicle title or windshield base.",
  },
  "odometer-reading": {
    label: "Odometer Mileage",
    hint: "💡 Current mileage reading shown on dashboard cluster.",
  },
  "purchase-price": {
    label: "Purchase Price ($ USD)",
    hint: "💡 Total agreed sale amount in US Dollars.",
  },
  "warranty-terms": {
    label: "Warranty & Title Terms",
    hint: "💡 Specify AS-IS condition or limited title guarantee.",
  },
};

const ENGLISH_PRESETS = [
  {
    name: "🚗 2024 Tesla Model Y",
    sellerName: "Johnathan Vance",
    sellerAddress: "742 Evergreen Terrace, Springfield, IL 62704",
    buyerName: "Eleanor Rigby",
    buyerAddress: "104 Abbey Road, Seattle, WA 98101",
    vehicleDetails: "2024 Tesla Model Y Long Range (SUV, Solid Black)",
    vinNumber: "5YJ3E1EA1KF123456",
    odometer: "12,450 Miles (Actual Mileage Certified)",
    price: "$28,500.00 USD (Twenty-Eight Thousand Five Hundred Dollars)",
  },
  {
    name: "🏎️ 2023 BMW 530i Sedan",
    sellerName: "Premier Auto Group LLC",
    sellerAddress: "1200 Automotive Way, Austin, TX 78701",
    buyerName: "Marcus Vance",
    buyerAddress: "550 Ocean Drive, Miami, FL 33139",
    vehicleDetails: "2023 BMW 530i xDrive Sedan (Alpine White, M Sport)",
    vinNumber: "WBA53BJ04PCL98765",
    odometer: "18,200 Miles (Single Owner)",
    price: "$42,000.00 USD (Forty-Two Thousand Dollars)",
  },
  {
    name: "🚚 2022 Ford F-150 Lariat",
    sellerName: "Cascade Commercial Fleet Inc.",
    sellerAddress: "88 Industrial Pkwy, Denver, CO 80202",
    buyerName: "David Miller",
    buyerAddress: "404 Aspen Way, Boulder, CO 80301",
    vehicleDetails: "2022 Ford F-150 Lariat SuperCrew 4x4 (Agate Black)",
    vinNumber: "1FTFW1ED5NFC54321",
    odometer: "24,800 Miles (Clean Title)",
    price: "$36,900.00 USD (Thirty-Six Thousand Nine Hundred Dollars)",
  },
];

interface PolotnoElement {
  id: string;
  type: string;
  name?: string;
  text?: string;
  set: (props: Record<string, unknown>) => void;
}

export const SmartFormSectionPanel: FC<SmartFormSectionPanelProps> = observer(
  ({ store }) => {
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [activeHint, setActiveHint] = useState<string | null>(null);
    const [isSavedPro, setIsSavedPro] = useState(false);

    // Extract all text elements across pages in the Polotno store
    const textElements = store.pages.flatMap((page) =>
      page.children.filter((el) => el.type === "text")
    ) as unknown as PolotnoElement[];

    // Filter editable text fields (excluding headers and fixed title labels)
    const editableFields = textElements.filter(
      (el) =>
        el.id !== "doc-title" &&
        el.id !== "doc-subtitle" &&
        el.id !== "sec1-title" &&
        el.id !== "sec2-title" &&
        el.id !== "sec3-title" &&
        el.id !== "sec4-title" &&
        !el.id?.endsWith("-label")
    );

    const handleTextChange = (element: PolotnoElement, newText: string) => {
      element.set({ text: newText });
    };

    const handleElementFocus = (element: PolotnoElement) => {
      store.selectElements([element.id]);
      if (FIELD_HINTS_MAP[element.id]) {
        setActiveHint(FIELD_HINTS_MAP[element.id].hint);
      } else {
        setActiveHint(null);
      }
    };

    const handleApplyPreset = (preset: typeof ENGLISH_PRESETS[0]) => {
      setIsAiLoading(true);
      setSelectedPreset(preset.name);

      setTimeout(() => {
        setIsAiLoading(false);

        const sellerEl = textElements.find((el) => el.id === "seller-name");
        const sellerAddrEl = textElements.find((el) => el.id === "seller-address");
        const buyerEl = textElements.find((el) => el.id === "buyer-name");
        const buyerAddrEl = textElements.find((el) => el.id === "buyer-address");
        const vehicleEl = textElements.find((el) => el.id === "vehicle-details");
        const vinEl = textElements.find((el) => el.id === "vin-number");
        const odometerEl = textElements.find((el) => el.id === "odometer-reading");
        const priceEl = textElements.find((el) => el.id === "purchase-price");

        if (sellerEl) sellerEl.set({ text: preset.sellerName });
        if (sellerAddrEl) sellerAddrEl.set({ text: preset.sellerAddress });
        if (buyerEl) buyerEl.set({ text: preset.buyerName });
        if (buyerAddrEl) buyerAddrEl.set({ text: preset.buyerAddress });
        if (vehicleEl) vehicleEl.set({ text: preset.vehicleDetails });
        if (vinEl) vinEl.set({ text: preset.vinNumber });
        if (odometerEl) odometerEl.set({ text: preset.odometer });
        if (priceEl) priceEl.set({ text: preset.price });
      }, 400);
    };

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <SidePanelSectionLabel label="Smart Form" type="header" />
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Bill of Sale
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Fill out form fields with live guidance hints. Changes update on canvas instantly!
          </p>
        </div>

        {/* AI Presets Quick Fill */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <span>⚡</span> Sample Presets
            </span>
            {isAiLoading && (
              <span className="animate-spin text-xs text-blue-600">🌀</span>
            )}
          </div>
          <p className="text-[11px] text-blue-800/80 leading-snug">
            Select a sample vehicle transaction to auto-fill all form fields:
          </p>
          <div className="flex flex-col gap-1.5">
            {ENGLISH_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className={`w-full text-left rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
                  selectedPreset === preset.name
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-blue-800 hover:bg-blue-100/80 border border-blue-200"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Fill Hint Tooltip Banner */}
        {activeHint && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 shadow-xs animate-in fade-in duration-150">
            <p className="text-xs font-medium text-indigo-900">{activeHint}</p>
          </div>
        )}

        {/* Editable Form Fields */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">
              Form Fields ({editableFields.length})
            </span>
            <span className="text-[10px] text-gray-400">Click field to highlight</span>
          </div>

          {editableFields.map((el, index) => {
            const currentText = el.text || "";
            const hintConfig = FIELD_HINTS_MAP[el.id];
            const fieldLabel =
              hintConfig?.label ||
              el.name ||
              `Field ${index + 1}`;

            return (
              <div
                key={el.id || index}
                className="flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-3 shadow-2xs transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-700 truncate">
                    {fieldLabel}
                  </label>
                  {hintConfig && (
                    <span className="text-[10px] font-medium text-blue-600 cursor-help" title={hintConfig.hint}>
                      ⓘ Hint
                    </span>
                  )}
                </div>
                <textarea
                  rows={currentText.length > 35 ? 2 : 1}
                  value={currentText}
                  onFocus={() => handleElementFocus(el)}
                  onChange={(e) => handleTextChange(el, e.target.value)}
                  placeholder={`Enter ${fieldLabel.toLowerCase()}...`}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs font-medium text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-hidden"
                />
                {hintConfig && (
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {hintConfig.hint}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Pro Retention Feature: Save Profile Preset */}
        <div className="mt-2 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>⭐</span> Save Party Profile (PRO)
            </span>
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-snug">
            Save your seller/dealer details to automatically populate future legal forms in 1 click.
          </p>
          <button
            onClick={() => setIsSavedPro(!isSavedPro)}
            className={`w-full rounded-lg py-1.5 text-xs font-semibold transition-all shadow-2xs ${
              isSavedPro
                ? "bg-green-600 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            {isSavedPro ? "✓ Party Details Saved to Profile" : "💾 Save Profile Details"}
          </button>
        </div>
      </div>
    );
  }
);
