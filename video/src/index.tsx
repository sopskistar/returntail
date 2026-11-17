import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Preview } from './preview';
function Root() {
  return (
    <Composition
      id="ReturnTailPreview"
      component={Preview}
      durationInFrames={1350}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
registerRoot(Root);
