import React from "react";
import { type ProjectName } from "../../../../../projects/projectsControlPannels";

interface HeaderProps {
  setProject: (projectName: ProjectName) => void;
  controlPanels: Record<ProjectName, React.ReactNode>[];
}
export default function Header({ setProject, controlPanels }: HeaderProps) {
  return (
    <header className="bg-gray-900 flex justify-center">
      <select className="select"></select>
    </header>
  );
}
