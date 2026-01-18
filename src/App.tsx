import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TacticalField from './components/TacticalField';
import HeroStorage from './components/HeroStorage';
import { useSquadManager } from './hooks/useSquadManager';
import ConfirmationModal from './hooks/ConfirmationModal';
import HeroSelectionModal from './components/HeroSelectionModal';
import BaseStatsModal from './components/BaseStatsModal';

function App() {
  const { 
    db, 
    currentSquad, 
    updateGlobalStat, 
    switchSquad, 
    updateHeroSlot, 
    updateSkill,
    assignHero, 
    removeHero,
    metaStatus,
    calculateDR,
    modalConfig,
    closeModal,
    selectionModalConfig,
    openSelectionModal,
    closeSelectionModal,
    selectHeroForSlot,
  } = useSquadManager();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="bg-black text-white h-screen flex flex-col overflow-hidden font-sans">
      <Header 
        currentSquadIdx={db.currentSquadIdx} 
        switchSquad={switchSquad} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          globalStats={db.globalBaseStats} 
          updateGlobalStat={updateGlobalStat} 
        />

        <main 
          className="flex flex-1 flex-col items-center justify-center p-4 md:p-20 overflow-hidden bg-black relative"
          style={{ background: 'radial-gradient(circle at center, #111827 0%, #030712 50%, #000000 100%)' }}
        >
          <TacticalField 
            squad={currentSquad}
            onDrop={assignHero}
            onRemove={removeHero}
            onUpdateEx={(slotIdx, val) => updateHeroSlot(slotIdx, { ex_lvl: parseInt(val) || 0 })}
            onUpdateSkill={updateSkill}
            calculateDR={calculateDR}
            metaStatus={metaStatus}
            onSlotClick={openSelectionModal}
          />
        </main>

        <HeroStorage showNerzi={metaStatus.showNerzi} />
      </div>

       <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />

      <HeroSelectionModal 
        isOpen={selectionModalConfig.isOpen}
        onSelect={selectHeroForSlot}
        onClose={closeSelectionModal}
      />

      <BaseStatsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        globalStats={db.globalBaseStats}
        updateGlobalStat={updateGlobalStat}
      />
    </div>
  );
}

export default App;
