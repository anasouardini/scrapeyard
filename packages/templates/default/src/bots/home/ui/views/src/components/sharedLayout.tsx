import React from 'react';
import * as yup from 'yup';
import CustomForm from './customForm';

interface Props {
  children: string | JSX.Element | JSX.Element[];
}
function Header(props: Props) {
  const schema = yup.object().shape({ name: yup.string().required().max(100) });
  const refs = React.useRef({
    fields: { name: '' },
  });

  return (
    <>
      <header className='flex flex-col gap-4 w-full'>
        <button>Home</button>
        <CustomForm fields={refs.current.fields} schema={schema} />
      </header>
      <main>{props.children}</main>
    </>
  );
}

export default Header;
