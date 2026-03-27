import { skillList } from "../skilllist";
import { BiTerminal } from 'react-icons/bi';
import { GiSwissArmyKnife } from 'react-icons/gi';
import { LiaBezierCurveSolid } from 'react-icons/lia';
import { LuTextCursorInput } from 'react-icons/lu';
import { MdOutlineInventory2 } from 'react-icons/md';
import { TbTopologyComplex } from 'react-icons/tb';
import type { RoleDetails, TechDetails } from './types';

const roles = [
    { name: 'End-to-end', icon: <GiSwissArmyKnife /> },
    { name: 'Developer', icon: <BiTerminal /> },
    { name: 'UI Designer', icon: <LiaBezierCurveSolid /> },
    { name: 'Writer', icon: <LuTextCursorInput /> },
    { name: 'Product Engineer', icon: <MdOutlineInventory2 /> },
    { name: 'System Designer', icon: <TbTopologyComplex /> },
    { name: 'Publisher', icon: <LuTextCursorInput /> },
];

export function getRoleDetails(roleNames: string[]): RoleDetails[] {
    return roleNames.map((role) => {
        const found = roles.find((item) => item.name === role);
        return found || { name: role, icon: null };
    });
}

export function getTechDetails(techNames: string[]): TechDetails[] {
    return techNames.map((tech) => {
        const found = Object.values(skillList).flat().find((item) => item.name === tech);
        return found || { name: tech, icon: null };
    });
}
