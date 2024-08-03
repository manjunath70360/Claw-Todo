import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './index.css';
import Cookies from "js-cookie";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

class LoginForm extends Component {
  state = {
    username: '',
    password: '',
    confirmPassword: '',
    showSubmitError: false,
    errorMsg: '',
    activeTab: 'login',
  }

  onChangeUsername = event => {
    this.setState({ username: event.target.value });
  }

  onChangePassword = event => {
    this.setState({ password: event.target.value });
  }

  onChangeConfirmPassword = event => {
    this.setState({ confirmPassword: event.target.value });
  }

  onSubmitSuccess = token => {
   
    Cookies.set("token", token);
    const { history } = this.props;
   
    history.push('/home');
  }

  onSubmitFailure = errorMsg => {
    this.setState({ showSubmitError: true, errorMsg });
  }

  onChangeTab = id => {
    this.setState({ activeTab: id, showSubmitError: false, errorMsg: '' });
  }

  submitForm = async event => {
    event.preventDefault();
    const { username, password } = this.state;
    const userDetails = { username, password };

    const url = this.state.activeTab === 'login'
      ? 'https://claw-todo.onrender.com/api/users/signin'
      : 'https://claw-todo.onrender.com/api/users/signup';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
   
      if (response.ok) {
        this.onSubmitSuccess(data.token);
      } else {
        this.onSubmitFailure(data.error);
      }
    } catch (error) {
      this.onSubmitFailure('Failed to fetch');
    }
  }

  renderPasswordField = () => {
    const { password } = this.state;

    return (
      <input
        type="password"
        id="password"
        className="password-input-field"
        value={password}
        onChange={this.onChangePassword}
        placeholder="Password"
        required
      />
    );
  }

  renderUsernameField = () => {
    const { username } = this.state;

    return (
      <input
        type="text"
        id="username"
        className="username-input-field"
        value={username}
        onChange={this.onChangeUsername}
        placeholder="Email"
        required
      />
    );
  }

  renderConfirmPasswordField = () => {
    const { confirmPassword } = this.state;

    return (
      <input
        type="password"
        id="confirm-password"
        className="password-input-field"
        value={confirmPassword}
        onChange={this.onChangeConfirmPassword}
        placeholder="Confirm Password"
        required
      />
    );
  }

  render() {
    const { showSubmitError, errorMsg, activeTab, password, confirmPassword } = this.state;
    const isLoginTab = activeTab === 'login';
    const samePasswordError = password !== confirmPassword;

    return (
      <div className="login-form-container">
        <form className="form-container" onSubmit={this.submitForm}>
          <h1 className='header'>{isLoginTab ? `Login` : `Signup`}</h1>
          <div className="input-container">{this.renderUsernameField()}</div>
          <div className="input-container">{this.renderPasswordField()}</div>
          {!isLoginTab && (
            <>
              <div className="input-container">{this.renderConfirmPasswordField()}</div>
              {samePasswordError && <p className="error-message">*password must match</p>}
            </>
          )}
          <p className='para-forgot'>Forgot password?</p>
          <button type="submit" className="login-button">
            {isLoginTab ? 'Login' : 'Signup'}
          </button>
          {showSubmitError && <p className="error-message">*{errorMsg}</p>}
          {isLoginTab ? <p className='para-text'>Don't have an account? <span className='span' onClick={() => this.onChangeTab('signup')}>Signup</span></p> : <p className='para-text'>Already have an account? <span className='span' onClick={() => this.onChangeTab('login')}>Login</span></p>}
          <div className='or-section'>
            <hr className='hr' />
            <p className='or'>Or</p>
            <hr className='hr' />
          </div>
          <button type="button" className="login-button-fb">
            <FaFacebook className='social-icon' /> <p className='btn-text'>Login with Facebook</p>
          </button>
          <button type="button" className="login-button-google">
            <FcGoogle className='social-icon' /><p className='btn-text'>Login with Google</p>
          </button>
        </form>
      </div>
    );
  }
}

export default withRouter(LoginForm);
