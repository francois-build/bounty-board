
import React from 'react';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from '../ui/navigation-menu';

const DiscoveryShell = () => (
    <div className="sticky top-0 bg-white shadow-md">
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Startups</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="grid w-[400px] p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            <a href="/startups/featured">Featured</a>
                            <a href="/startups/new">New</a>
                            <a href="/startups/trending">Trending</a>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Scouts</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="grid w-[400px] p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            <a href="/scouts/top">Top Scouts</a>
                            <a href="/scouts/leaderboard">Leaderboard</a>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    </div>
);

export default DiscoveryShell;
