import React from 'react';
import * as yup from 'yup';
import CustomForm from './customForm';
import { Outlet } from 'react-router';
import { NavLink } from 'react-router-dom';

interface Props {}
function Header(props: Props) {
  const schema = yup.object().shape({ name: yup.string().required().max(100) });
  const refs = React.useRef({
    fields: { name: '' },
  });

  const style = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 2rem',
      background: 'var(--clr-bg3)',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    navItem: {
      fontWeight: 'bold',
      fontSize: '1.2rem',
    },
  };

  return (
    <>
      <header style={style.header}>
        <NavLink
          to='/'
          style={style.navItem}
          className={({ isActive }) => (isActive ? 'activeNavLink' : '')}
        >
          Projects
        </NavLink>
        {/* <CustomForm fields={refs.current.fields} schema={schema} /> */}
      </header>
      <main style={{ paddingTop: '2rem', background: 'var(--clr-bg2)' }}>
        <Outlet />
      </main>
    </>
  );
}

export default Header;
