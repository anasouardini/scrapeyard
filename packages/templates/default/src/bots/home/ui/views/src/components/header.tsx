import React from 'react';
// import yup from 'yup';
import CustomForm from './customForm';

interface Props {}
function Header(props: Props) {
  //   const schema = yup.object().shape({ name: yup.string().required().max(100) });
  const refs = React.useRef({
    fields: { name: '' },
  });

  return (
    <header className='flex gap-4'>
      <button>Home</button>
      <CustomForm fields={refs.current.fields} schema={{}} />
    </header>
  );
}

export default Header;
