import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import './App.css';

import ManualVerify from './components/ManualVerify';
import Impersonate from './components/Impersonate';
import ForceEscrowFunded from './components/ForceEscrowFunded';
import BulkLeadImporter from './components/BulkLeadImporter';

function App() {
    const [open, setOpen] = useState(false);
    const [activeComponent, setActiveComponent] = useState<string | null>(null);

    // Toggle the command menu with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && e.metaKey) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleSelect = (componentName: string) => {
        setActiveComponent(componentName);
        setOpen(false);
    }

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'ManualVerify':
                return <ManualVerify />;
            case 'Impersonate':
                return <Impersonate />;
            case 'ForceEscrowFunded':
                return <ForceEscrowFunded />;
            case 'BulkLeadImporter':
                return <BulkLeadImporter />;
            default:
                return <div className="placeholder">Select a command to start. (Press Cmd+K)</div>;
        }
    };

    return (
        <div>
            <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu">
                <Command.Input />
                <Command.List>
                    <Command.Empty>No results found.</Command.Empty>

                    <Command.Group heading="Admin Actions">
                        <Command.Item onSelect={() => handleSelect('ManualVerify')}>Manual Verify</Command.Item>
                        <Command.Item onSelect={() => handleSelect('Impersonate')}>Impersonate User</Command.Item>
                        <Command.Item onSelect={() => handleSelect('ForceEscrowFunded')}>Force Escrow Funded</Command.Item>
                        <Command.Item onSelect={() => handleSelect('BulkLeadImporter')}>Bulk Lead Importer</Command.Item>
                    </Command.Group>
                </Command.List>
            </Command.Dialog>

            <main>
                {renderActiveComponent()}
            </main>
        </div>
    );
}

export default App;
