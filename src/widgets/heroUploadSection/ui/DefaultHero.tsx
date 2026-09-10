"use client";

import { useState, type FC } from "react";

import { Title } from "@/shared/ui/title";
import { UploadArea, type IUploadAreaProps } from "@/shared/ui/upload-area";
import { UploadButton } from "@/shared/ui/upload-button";
import { CloudImportButtons, CloudImportModal, type CloudProvider, type MockCloudFile } from "@/features/cloudImport";

export interface IDefaultHeroProps extends IUploadAreaProps {
  readonly title: string;
  readonly subtitle: string;
}

export const DefaultHero: FC<IDefaultHeroProps> = ({
  title,
  subtitle,
  buttonLabel,
  supportedFormatsText,
  maxSizeText,
  dropText,
  acceptedFormats,
  onFileUpload,
  validationError,
  setValidationError,
  multiple,
  showUnlockIllustration,
}) => {
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>("google-drive");

  const handleOpenCloudModal = (provider: CloudProvider) => {
    setCloudProvider(provider);
    setIsCloudModalOpen(true);
  };

  const handleSelectCloudFile = (mockFile: MockCloudFile) => {
    if (onFileUpload) {
      const file = new File(["%PDF-1.4 Mock Document Content"], mockFile.name, {
        type: "application/pdf",
        lastModified: Date.now(),
      });
      try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        onFileUpload(dataTransfer.files);
      } catch {
        onFileUpload([file] as unknown as FileList);
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-[1140px] flex-col items-center gap-6 md:flex-row md:items-stretch">
      <div className="flex flex-col gap-1 text-center md:flex-1 md:justify-center md:gap-4 md:text-start">
        <Title
          level="h1"
          variant="desktop-title-1"
          align="center"
          className="text-black/87 md:text-start"
        >
          {title}
        </Title>

        <p className="text-subtitle font-medium text-black/60 md:text-xl md:leading-[1.2]">
          {subtitle}
        </p>

        <CloudImportButtons
          onOpenModal={handleOpenCloudModal}
          className="hidden md:flex justify-start pt-2"
        />
      </div>

      <div className="w-full md:hidden flex flex-col gap-3">
        <UploadButton
          label={buttonLabel}
          onFileUpload={onFileUpload}
          acceptedFormats={acceptedFormats}
          multiple={multiple}
          showGlow={false}
          showIcon
          className="w-full"
          buttonClassName="w-full"
        />

        <CloudImportButtons
          onOpenModal={handleOpenCloudModal}
          className="w-full"
        />
      </div>

      <div className="hidden md:block md:flex-1">
        <UploadArea
          buttonLabel={buttonLabel}
          supportedFormatsText={supportedFormatsText}
          maxSizeText={maxSizeText}
          dropText={dropText}
          acceptedFormats={acceptedFormats}
          onFileUpload={onFileUpload}
          validationError={validationError}
          setValidationError={setValidationError}
          multiple={multiple}
          showUnlockIllustration={showUnlockIllustration}
        />
      </div>

      <CloudImportModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        initialProvider={cloudProvider}
        onSelectFile={handleSelectCloudFile}
      />
    </div>
  );
};

