import React from 'react';
import { type BotsControllers } from 'scrapeyard';

interface Props {
  name: keyof BotsControllers;
}
function BotControlPanel({ name }: Props) {
  return (
    <section style={{ flexGrow: '1' }}>
      <h1>{name}'s control panel</h1>
    </section>
  );
}

export default BotControlPanel;
