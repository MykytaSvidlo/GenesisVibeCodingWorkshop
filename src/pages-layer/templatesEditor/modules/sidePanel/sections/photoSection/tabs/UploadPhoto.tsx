import { useCallback, useState, type FC } from "react";
import type { StoreType } from "polotno/model/store";

import { useTranslation } from "@/shared/lib/translations";
import {
  CloudImportButtons,
  CloudImportModal,
  type CloudProvider,
  type MockCloudFile,
} from "@/features/cloudImport";

import UploadList from "../../../../../components/uploadList/UploadList";
import type { UploadListImage } from "../../../../../model/element-types";
import { useAddElements } from "../../../../../helpers/addElements";
import { useTemplatesEditorStore } from "../../../../../model/store/templates-editor-store";
import { UploadTab as BaseUploadTab } from "../../common/tabs/upload/Upload";

interface UploadPhotoTabProps {
  store: StoreType;
  from?: "upload";
}

export const UploadPhotoTab: FC<UploadPhotoTabProps> = ({ store, from }) => {
  const { t } = useTranslation();
  const photos = useTemplatesEditorStore.use.uploadedPhotos();
  const addUploadedPhotos = useTemplatesEditorStore.use.addUploadedPhotos();
  const removeUploadedPhotos =
    useTemplatesEditorStore.use.removeUploadedPhotos();
  const showToast = useTemplatesEditorStore.use.showToast();

  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>("google-drive");

  const { addImageToCanvas } = useAddElements({ store, type: "image" });

  const handleRemovePhoto = useCallback(
    (images: UploadListImage[]) => {
      const ids = images.map((image) => image.id);
      showToast({
        id: "delete-photo",
        header: t(
          "templatesEditor.toasts.delete_confirmation_header"
        ) as string,
        content: t("templatesEditor.toasts.delete_files_content") as string,
        variant: "warning",
        button: {
          label: t("templatesEditor.common.delete") as string,
          onClick: () => removeUploadedPhotos(ids),
        },
      });
    },
    [showToast, removeUploadedPhotos, t]
  );

  const handlePhotoUpload = useCallback(
    (files: File[]) => {
      const photos = files.map((file) => ({
        id: crypto.randomUUID(),
        src: URL.createObjectURL(file),
      }));
      addUploadedPhotos(photos);
      addImageToCanvas(photos[0]);
    },
    [addUploadedPhotos, addImageToCanvas]
  );

  const handleOpenCloudModal = (provider: CloudProvider) => {
    setCloudProvider(provider);
    setIsCloudModalOpen(true);
  };

  const handleSelectCloudFile = (mockFile: MockCloudFile) => {
    const cloudPhoto = {
      id: crypto.randomUUID(),
      src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    };
    addUploadedPhotos([cloudPhoto]);
    showToast({
      id: "cloud-import-success",
      header: "Cloud Document Imported",
      content: `Imported "${mockFile.name}" from ${mockFile.provider === "google-drive" ? "Google Drive" : "Dropbox"}.`,
      variant: "success",
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <BaseUploadTab
        tool="photo"
        from={from}
        maxSize={50}
        formats="jpg, jpeg, png, bmp, webp, heic, jfif, pdf"
        onFileUpload={handlePhotoUpload}
        count={photos.length}
        UploadList={
          <UploadList
            store={store}
            images={photos.map((photo) => ({ id: photo.id, src: photo.src }))}
            onDelete={handleRemovePhoto}
            type="image"
          />
        }
      />

      <div className="px-5 pb-5">
        <CloudImportButtons
          onOpenModal={handleOpenCloudModal}
          className="pt-1 flex-wrap justify-start"
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
