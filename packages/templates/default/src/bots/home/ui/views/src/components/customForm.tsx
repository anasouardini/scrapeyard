import React from 'react';
import { Form, Formik, Field } from 'formik';
import { type Schema } from 'yup';

interface Props {
  fields: Record<string, any>;
  schema: Schema;
}
function CustomForm(props: Props) {
  return (
    <Formik
      initialValues={props.fields}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
      validationSchema={props.schema}
    >
      <Form>
        <Field type='text' name='name' placeholder='Name' />
        <button type='submit'>Submit</button>
      </Form>
    </Formik>
  );
}

export default CustomForm;
