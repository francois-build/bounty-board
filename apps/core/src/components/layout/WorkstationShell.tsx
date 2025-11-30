
import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { ChevronDown } from 'lucide-react';

const WorkstationShell = () => (
    <div className="flex h-screen">
        <div className="w-64 bg-gray-100 p-4">
            <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <span>Menu</span>
                    <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <ul className="mt-4">
                        <li>Dashboard</li>
                        <li>Analytics</li>
                        <li>Settings</li>
                    </ul>
                </CollapsibleContent>
            </Collapsible>
        </div>
        <div className="flex-1 p-4">
            <h1>Workstation Shell</h1>
        </div>
    </div>
);

export default WorkstationShell;
