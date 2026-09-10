export type CloudProvider = "google-drive" | "dropbox";

export interface MockCloudFile {
  id: string;
  name: string;
  size: string;
  updatedAt: string;
  type: "pdf" | "doc";
  provider: CloudProvider;
  icon?: string;
}

export interface CloudImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile?: (file: MockCloudFile) => void;
  initialProvider?: CloudProvider;
}

export interface CloudImportButtonsProps {
  onOpenModal: (provider: CloudProvider) => void;
  className?: string;
}
