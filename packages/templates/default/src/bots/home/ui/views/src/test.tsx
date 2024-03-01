import React from 'react';
import ReactDOM from 'react-dom/client';
import { Form, Formik, Field } from 'formik';

function Component() {
  return (
    <Formik
      initialValues={{ name: '' }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Form>
        <Field type='text' name='name' placeholder='Name' />
        <button type='submit'>Submit</button>
      </Form>
    </Formik>
  );
}

ReactDOM.createRoot(document.querySelector('body')).render(Component());
