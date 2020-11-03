import React, { useEffect, useState } from "react";

import { app, useStore } from "~/core/app";

export const MapTitleInput: React.FC = () => {
  const initialTitle = useStore((store) => store.sync.name ?? "");
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  return (
    <div>
      <input
        className="py-1 px-2 truncate w-full font-medium placeholder-gray-700 focus:placeholder-gray-400 border border-gray-50 hover:border-gray-300"
        placeholder="Untitled Map"
        value={title}
        onBlur={() => {
          app.sync.updateName(title);
        }}
        onChange={(event) => {
          setTitle(event.target.value);
        }}
      />
    </div>
  );
};
