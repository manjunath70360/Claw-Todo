import "../home/index.css";
import Cookies from 'js-cookie'; 
import { useHistory } from 'react-router-dom';

const NavBar = () => {
  const history = useHistory();

  const onClickTodoList = () => {
    history.push('/notes');
  };

  const onClickLogout = () => {
    Cookies.remove('token');
    history.push('/');
  };

  const onClickHome = () => {
    history.push('/home');
  };

  return (
    <div className='nav-container'>
      <h1 className='nav-logo'>Todos</h1>
      <div className='nav-item'>
        <h3 className='nav-heading' onClick={onClickHome}>Home</h3>
        <h3 className='nav-heading' onClick={onClickTodoList}>TodosList</h3>
        <h3 className='nav-heading' onClick={onClickLogout}>Logout</h3>
      </div>
    </div>
  );
};

export default NavBar;
