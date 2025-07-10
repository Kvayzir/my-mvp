import { useState } from 'react';

const useNotebook = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleCheck = () => {
    alert("Reviewing notebook...");
  };

  const handleSubmit = () => {
    alert("Notebook saved!");
  };

  return {
    activeTab,
    handleTabChange,
    handleCheck,
    handleSubmit
  };
};

export default useNotebook;