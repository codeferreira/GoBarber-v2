import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {Form, Input} from '@rocketseat/unform';
import * as Yup from 'yup';

import {signInRequest} from '~/store/modules/auth/actions';

import logo from '~/assets/logo.svg';

const schema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid e-mail')
    .required('E-mail is required'),
  password: Yup.string().required('Password is required'),
});

export default function SignIn() {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.loading);

  function handleSubmit({email, password}) {
    dispatch(signInRequest(email, password));
  }

  return (
    <>
      <img src={logo} alt="Gobarber" />

      <Form schema={schema} onSubmit={handleSubmit}>
        <Input type="email" name="email" placeholder="Your e-mail" />
        <Input type="password" name="password" placeholder="Your password" />

        <button type="submit">{loading ? 'Loading...' : 'Sign In'}</button>
        <Link to="/register">SignUp for Free</Link>
      </Form>
    </>
  );
}
