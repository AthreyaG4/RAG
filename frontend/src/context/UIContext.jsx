import { createContext, useState } from "react";

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isViewKnowledgeBaseOpen, setIsViewKnowledgeBaseOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <UIContext.Provider
      value={{
        isUploadModalOpen,
        setIsUploadModalOpen,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        isViewKnowledgeBaseOpen,
        setIsViewKnowledgeBaseOpen,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
