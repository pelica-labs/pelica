import React, { useState } from "react";

import { MenuSection } from "~/components/editor/menus/MenuSection";
import { NavigationModal } from "~/components/editor/NavigationModal";
import { Button } from "~/components/ui/Button";
import { CrosshairQuestionIcon, InformationIcon, PencilIcon, PinIcon, TextIcon } from "~/components/ui/Icon";
import { app } from "~/core/app";

export const MoveMenu: React.FC = () => {
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  return (
    <MenuSection>
      <NavigationModal
        isOpen={showNavigationModal}
        onRequestClose={() => {
          setShowNavigationModal(false);
        }}
      />

      <div className="flex items-start text-sm md:text-xs">
        <InformationIcon className="w-4 h-4 md:hidden mr-3 md:mr-0 mt-1" />
        <div className="flex flex-col md:space-y-4">
          <span>Move around the map. When drawing, you can still move by using 2 fingers.</span>
          <span>Whenever you're ready, start drawing!</span>

          <Button
            className="text-center space-x-2"
            onClick={() => {
              setShowNavigationModal(true);
            }}
          >
            <CrosshairQuestionIcon className="w-4 h-4" />
            <span className="flex-1 text-center">Help me navigate the map</span>
          </Button>

          <div className="flex md:flex-col md:space-x-0 md:space-y-1 space-x-2 border-t border-gray-200 mt-5 pt-5 md:mt-2 md:pt-3">
            <Button
              className="text-center space-x-2"
              onClick={() => {
                app.editor.setEditorMode("route");
              }}
            >
              <PencilIcon className="w-4 h-4" />
              <span className="flex-1 text-center">Draw a route</span>
            </Button>
            <Button
              className="text-center space-x-2"
              onClick={() => {
                app.editor.setEditorMode("pin");
              }}
            >
              <PinIcon className="w-4 h-4" />
              <span className="flex-1 text-center">Add a pin</span>
            </Button>
            <Button
              className="text-center space-x-2"
              onClick={() => {
                app.editor.setEditorMode("text");
              }}
            >
              <TextIcon className="w-4 h-4" />
              <span className="flex-1 text-center">Add text</span>
            </Button>
          </div>
        </div>
      </div>
    </MenuSection>
  );
};
