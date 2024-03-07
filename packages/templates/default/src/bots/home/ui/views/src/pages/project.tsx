import React from 'react';
import SideMenu from '$home-components/sideMenu';
import BotControlPanel from '$home-components/botControlPanel';
import { useParams } from 'react-router';

interface Props {}
export default function Project(props: Props) {
  const { name } = useParams<{ name: 'jobboards' | 'home' }>();
  if (!name) {
    return <div>Please provide a valid project name</div>;
  }
  const style = {
    container: {
      display: 'flex',
      paddingInline: '2rem',
    },
  };

  return (
    <div style={style.container}>
      <BotControlPanel name={name} />
      <SideMenu projectName={name} />
    </div>
  );
}
