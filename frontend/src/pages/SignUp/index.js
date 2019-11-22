import React from 'react';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {Form, Input} from '@rocketseat/unform';
import * as Yup from 'yup';

import {signUpRequest} from '~/store/modules/auth/actions';

import logo from '~/assets/logo.svg';

const schema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid e-mail')
    .required('E-mail is required'),
  password: Yup.string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
});

export default function SignUp() {
  const dispatch = useDispatch();

  function handleSubmit({name, email, password}) {
    dispatch(signUpRequest(name, email, password));
  }

  return (
    <>
      <img src={logo} alt="Gobarber" />

      <Form schema={schema} onSubmit={handleSubmit}>
        <Input name="name" placeholder="Your full name" />
        <Input type="email" name="email" placeholder="Your e-mail" />
        <Input type="password" name="password" placeholder="Your password" />

        <button type="submit">Sign Up</button>
        <Link to="/">Already have an account</Link>
      </Form>
    </>
  );
}
