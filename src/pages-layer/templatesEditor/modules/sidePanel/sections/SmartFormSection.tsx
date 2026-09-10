import { useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { StoreType } from "polotno/model/store";

import { SidePanelSectionLabel } from "../../../ui/SidePanelSectionLabel";

interface SmartFormSectionPanelProps {
  store: StoreType;
}



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
    const [showGuidanceInfo, setShowGuidanceInfo] = useState(true);
    const [isSavedPro, setIsSavedPro] = useState(false);

    // Extract all text elements on the active page
    const activePage = store.activePage || store.pages[0];
    const textElements = (activePage
      ? activePage.children.filter((el) => el.type === "text")
      : []) as unknown as PolotnoElement[];

    // Extract the exact 11 fields marked in RED in the user's document layout
    const fieldConfigs: {
      element: PolotnoElement;
      prefix: string;
      label: string;
      hint: string;
      location: string;
      example: string;
    }[] = [];

    // Track element IDs assigned to form fields so elements are never duplicated
    const usedElementIds = new Set<string>();

    // Find right-hand value element next to a label element (green box in screenshot)
    const findRightHandValueElement = (
      labelEl: PolotnoElement,
      fallbackPrefix: string = ""
    ): { element: PolotnoElement; prefix: string } => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const labelX = (labelEl as any).x || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const labelY = (labelEl as any).y || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const labelHeight = (labelEl as any).height || 30;

      const candidates = textElements.filter((el) => {
        if (el === labelEl || usedElementIds.has(el.id)) return false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const elX = (el as any).x || 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const elY = (el as any).y || 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const elHeight = (el as any).height || 30;

        const yCenterLabel = labelY + labelHeight / 2;
        const yCenterEl = elY + elHeight / 2;
        const yDiff = Math.abs(yCenterEl - yCenterLabel);

        return elX > labelX + 5 && yDiff < 45;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      candidates.sort((a: any, b: any) => (a.x || 0) - (b.x || 0));

      if (candidates.length > 0) {
        const valEl = candidates[0];
        usedElementIds.add(valEl.id);
        return { element: valEl, prefix: "" };
      }

      // Check if labelEl itself contains underscores
      const text = labelEl.text || "";
      if (text.includes("_____") || text.includes(".....")) {
        usedElementIds.add(labelEl.id);
        return { element: labelEl, prefix: fallbackPrefix };
      }

      usedElementIds.add(labelEl.id);
      return { element: labelEl, prefix: fallbackPrefix };
    };

    // Helper spatial/content matcher
    const findEl = (
      predicate: (text: string, lower: string, el: PolotnoElement) => boolean
    ) => {
      return textElements.find((el) => {
        const text = el.text || "";
        const lower = text.toLowerCase();
        return predicate(text, lower, el);
      });
    };

    // 1. Date (Top Header area, left)
    const dateLabelEl = findEl(
      (_, lower, el) => lower.includes("date") && !lower.includes("candidate") && ((el as unknown as { y?: number }).y || 0) < 320
    );
    if (dateLabelEl) {
      const bound = findRightHandValueElement(dateLabelEl, "Date:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Date",
        hint: "💡 Transaction execution date (e.g. October 15, 2026).",
        location: "Header",
        example: "e.g. October 15, 2026",
      });
    }

    // 2. State (Top Header area, right)
    const stateLabelEl = findEl(
      (_, lower, el) => lower.includes("state") && ((el as unknown as { y?: number }).y || 0) < 320
    );
    if (stateLabelEl) {
      const bound = findRightHandValueElement(stateLabelEl, "State:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "State",
        hint: "💡 Jurisdiction state governing this Bill of Sale (e.g. California).",
        location: "Header",
        example: "e.g. California",
      });
    }

    // Filter Seller column (left, x < 600) vs Buyer column (right, x >= 600)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sellerElements = textElements.filter((el: any) => (el.x || 0) < 600 && (el.y || 0) >= 200 && (el.y || 0) < 750);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buyerElements = textElements.filter((el: any) => (el.x || 0) >= 600 && (el.y || 0) >= 200 && (el.y || 0) < 750);

    // 3. Seller Name
    const sellerNameLabelEl = sellerElements.find((el) => (el.text || "").toLowerCase().includes("name")) || sellerElements[0];
    if (sellerNameLabelEl) {
      const bound = findRightHandValueElement(sellerNameLabelEl, "Name:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Seller Name",
        hint: "💡 Seller's full legal name as shown on official government ID.",
        location: "The Seller",
        example: "e.g. Johnathan Vance",
      });
    }

    // 4. Seller Phone
    const sellerPhoneLabelEl = sellerElements.find((el) => (el.text || "").toLowerCase().includes("phone")) || sellerElements[1];
    if (sellerPhoneLabelEl && sellerPhoneLabelEl !== sellerNameLabelEl) {
      const bound = findRightHandValueElement(sellerPhoneLabelEl, "Phone No:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Seller Phone",
        hint: "💡 Contact phone number of the seller.",
        location: "The Seller",
        example: "e.g. (555) 234-5678",
      });
    }

    // 5. Seller Email
    const sellerEmailLabelEl = sellerElements.find((el) => (el.text || "").toLowerCase().includes("email")) || sellerElements[2];
    if (sellerEmailLabelEl && sellerEmailLabelEl !== sellerNameLabelEl && sellerEmailLabelEl !== sellerPhoneLabelEl) {
      const bound = findRightHandValueElement(sellerEmailLabelEl, "Email Address:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Seller Email",
        hint: "💡 Primary email address of the seller.",
        location: "The Seller",
        example: "e.g. seller@example.com",
      });
    }

    // 6. Seller Address
    const sellerAddrLabelEl = sellerElements.find((el) => (el.text || "").toLowerCase().includes("address")) || sellerElements[3];
    if (sellerAddrLabelEl && !fieldConfigs.some((c) => c.element === sellerAddrLabelEl)) {
      const bound = findRightHandValueElement(sellerAddrLabelEl, "Address:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Seller Address",
        hint: "💡 Residence address including street, city, state, ZIP.",
        location: "The Seller",
        example: "e.g. 742 Evergreen Terrace, Springfield, IL 62704",
      });
    }

    // 7. Buyer Name
    const buyerNameLabelEl = buyerElements.find((el) => (el.text || "").toLowerCase().includes("name")) || buyerElements[0];
    if (buyerNameLabelEl) {
      const bound = findRightHandValueElement(buyerNameLabelEl, "Name:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Buyer Name",
        hint: "💡 Buyer's full legal name for title registration.",
        location: "The Buyer",
        example: "e.g. Eleanor Rigby",
      });
    }

    // 8. Buyer Phone
    const buyerPhoneLabelEl = buyerElements.find((el) => (el.text || "").toLowerCase().includes("phone")) || buyerElements[1];
    if (buyerPhoneLabelEl && buyerPhoneLabelEl !== buyerNameLabelEl) {
      const bound = findRightHandValueElement(buyerPhoneLabelEl, "Phone No.:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Buyer Phone",
        hint: "💡 Contact phone number of the purchaser.",
        location: "The Buyer",
        example: "e.g. (555) 987-6543",
      });
    }

    // 9. Buyer Email
    const buyerEmailLabelEl = buyerElements.find((el) => (el.text || "").toLowerCase().includes("email")) || buyerElements[2];
    if (buyerEmailLabelEl && buyerEmailLabelEl !== buyerNameLabelEl && buyerEmailLabelEl !== buyerPhoneLabelEl) {
      const bound = findRightHandValueElement(buyerEmailLabelEl, "Email Address:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Buyer Email",
        hint: "💡 Primary email address of the purchaser.",
        location: "The Buyer",
        example: "e.g. buyer@example.com",
      });
    }

    // 10. Buyer Address
    const buyerAddrLabelEl = buyerElements.find((el) => (el.text || "").toLowerCase().includes("address")) || buyerElements[3];
    if (buyerAddrLabelEl && !fieldConfigs.some((c) => c.element === buyerAddrLabelEl)) {
      const bound = findRightHandValueElement(buyerAddrLabelEl, "Address:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Buyer Address",
        hint: "💡 Residence address of the purchaser.",
        location: "The Buyer",
        example: "e.g. 104 Abbey Road, Seattle, WA 98101",
      });
    }

    // 11. Item / Property Description
    const itemDescLabelEl = textElements.find((el) => {
      const text = (el.text || "").toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const y = (el as any).y || 0;
      return (
        (text.includes("item") || text.includes("property") || text.includes("details") || y > 650) &&
        !fieldConfigs.some((c) => c.element === el)
      );
    });
    if (itemDescLabelEl) {
      const bound = findRightHandValueElement(itemDescLabelEl, "Description:");
      fieldConfigs.push({
        element: bound.element,
        prefix: bound.prefix,
        label: "Item / Property Description",
        hint: "💡 Detailed description of the item or property being sold (make, model, serial #, condition).",
        location: "Section III",
        example: "e.g. 2024 Tesla Model Y (VIN: 5YJ3E1EA1KF123456, Solid Black)",
      });
    }

    const getCleanInputValue = (fullText: string, prefix: string = ""): string => {
      if (!fullText) return "";
      let text = fullText;
      if (prefix && text.startsWith(prefix)) {
        text = text.slice(prefix.length).trimStart();
      }
      if (text.includes("_____") || text.includes("......")) return "";
      return text;
    };

    const handleTextChange = (element: PolotnoElement, prefix: string, newText: string) => {
      store.history.transaction(() => {
        if (prefix) {
          const val = newText ? `${prefix} ${newText}` : `${prefix} _______________________`;
          element.set({ text: val });
        } else {
          element.set({ text: newText || "_______________________" });
        }
      });
    };

    const handleElementFocus = (element: PolotnoElement, hintText?: string) => {
      store.selectElements([element.id]);
      if (hintText) {
        setActiveHint(hintText);
      } else {
        setActiveHint(null);
      }
    };

    const handleApplyPreset = (preset: typeof ENGLISH_PRESETS[0]) => {
      setIsAiLoading(true);
      setSelectedPreset(preset.name);

      setTimeout(() => {
        setIsAiLoading(false);

        store.history.transaction(() => {
          fieldConfigs.forEach((cfg) => {
            let val = "";
            if (cfg.label === "Date") val = "October 15, 2026";
            if (cfg.label === "State") val = "California";
            if (cfg.label === "Seller Name") val = preset.sellerName;
            if (cfg.label === "Seller Phone") val = "(555) 234-5678";
            if (cfg.label === "Seller Email") val = "seller@example.com";
            if (cfg.label === "Seller Address") val = preset.sellerAddress;
            if (cfg.label === "Buyer Name") val = preset.buyerName;
            if (cfg.label === "Buyer Phone") val = "(555) 987-6543";
            if (cfg.label === "Buyer Email") val = "buyer@example.com";
            if (cfg.label === "Buyer Address") val = preset.buyerAddress;
            if (cfg.label === "Item / Property Description") val = preset.vehicleDetails;

            if (val) {
              if (cfg.prefix) {
                cfg.element.set({ text: `${cfg.prefix} ${val}` });
              } else {
                cfg.element.set({ text: val });
              }
            }
          });
        });
      }, 300);
    };

    return (
      <div className="box-border flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <SidePanelSectionLabel label="Smart Form" type="header" />
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Fill Guidance Active
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Fill out form fields below. Hover or click any field for legal fill hints!
          </p>
        </div>

        {/* Legal Fill Guidance Banner */}
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <span>💡</span> General Bill of Sale Guidance Tips
            </span>
            <button
              onClick={() => setShowGuidanceInfo(!showGuidanceInfo)}
              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {showGuidanceInfo ? "Hide" : "Show Tips"}
            </button>
          </div>
          {showGuidanceInfo && (
            <div className="text-[11px] text-indigo-800 space-y-1 leading-snug">
              <p>• <strong>The Parties:</strong> Enter full legal names and addresses for Seller & Buyer.</p>
              <p>• <strong>Item Description:</strong> Include full details of property/vehicle sold.</p>
              <p>• <strong>Live Canvas Update:</strong> Editing any input below updates the value box right next to the label on top of the line.</p>
            </div>
          )}
        </div>

        {/* AI Presets Quick Fill */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <span>⚡</span> 1-Click Sample Presets
            </span>
            {isAiLoading && (
              <span className="animate-spin text-xs text-blue-600">🌀</span>
            )}
          </div>
          <p className="text-[11px] text-blue-800/80 leading-snug">
            Auto-fill form fields with sample vehicle transactions:
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
          <div className="rounded-xl border border-blue-300 bg-blue-100/80 p-3 shadow-xs animate-in fade-in duration-150">
            <p className="text-xs font-semibold text-blue-950">{activeHint}</p>
          </div>
        )}

        {/* Editable Form Fields with Guidance Tooltips */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">
              Form Fields ({fieldConfigs.length})
            </span>
            <span className="text-[10px] text-gray-400">Click field to highlight on canvas</span>
          </div>

          {fieldConfigs.map((cfg, index) => {
            const rawCanvasText = cfg.element.text || "";
            const currentInputValue = getCleanInputValue(rawCanvasText, cfg.prefix);

            return (
              <div
                key={cfg.element.id || index}
                className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 hover:border-blue-300"
              >
                {/* Field Header */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 truncate">
                    {cfg.label}
                  </label>
                  {cfg.location && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 border border-blue-200">
                      {cfg.location}
                    </span>
                  )}
                </div>

                {/* Fill Guidance Callout Box */}
                {cfg.hint && (
                  <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-2 text-[11px] text-indigo-900 leading-snug">
                    <p className="font-medium">{cfg.hint}</p>
                    {cfg.example && (
                      <p className="text-[10px] text-indigo-600 mt-0.5 font-mono">{cfg.example}</p>
                    )}
                  </div>
                )}

                {/* Input Textarea */}
                <textarea
                  rows={currentInputValue.length > 40 ? 2 : 1}
                  value={currentInputValue}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onFocus={() => handleElementFocus(cfg.element, cfg.hint)}
                  onChange={(e) => handleTextChange(cfg.element, cfg.prefix, e.target.value)}
                  placeholder={`Enter ${cfg.label.toLowerCase()}...`}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white p-2.5 text-xs font-medium text-gray-900 transition-all focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
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
