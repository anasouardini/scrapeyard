import React from 'react';
import SideMenu from '$home-components/sideMenu';
import BotControlPanel from '$home-components/botControlPanel';

interface Props {}
export default function Project(props: Props) {
  return (
    <>
      <SideMenu />
      <BotControlPanel name='jobboards' />
    </>
  );
}
