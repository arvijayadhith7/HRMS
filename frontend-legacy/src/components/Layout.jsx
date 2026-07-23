import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import AIAssistant from './AIAssistant';

export default function Layout({ children }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Toggle handlers
  const handleOpenCommand = () => setIsCommandOpen(true);
  const handleCloseCommand = () => setIsCommandOpen(false);
  
  const handleToggleAI = () => setIsAIOpen(!isAIOpen);
  const handleCloseAI = () => setIsAIOpen(false);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-[260px] relative h-screen min-w-0">
        <Topbar onOpenCommandPalette={handleOpenCommand} onToggleAIAssistant={handleToggleAI} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background relative z-0">
          <div className="p-8 pb-24 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals/Widgets */}
      <CommandPalette isOpen={isCommandOpen} onClose={handleCloseCommand} />
      <AIAssistant isOpen={isAIOpen} onClose={handleCloseAI} />
    </div>
  );
}
