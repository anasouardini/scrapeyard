import React from 'react';
import { Form, Formik, Field } from 'formik';
import * as yup from 'yup';
import { type Schema } from 'yup';

interface Props {
  fields: Record<string, any>;
  // schema: Schema;
  schema: Record<string, any>;
}
function CustomForm(props: Props) {
  // const sch = yup.object().shape({ k: yup.string() });
  return (
    <Formik
      initialValues={props.fields}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
      // validationSchema={props.schema}
    >
      <Form>
        <Field type='text' name='name' placeholder='Name' />
        <button type='submit'>Submit</button>
      </Form>
    </Formik>
  );
}

export default CustomForm;
