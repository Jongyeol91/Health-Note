import React, { useState, useContext, useEffect } from 'react';
import { Input, Icon, Button, Row, Col, Checkbox } from 'antd';
import { withRouter } from 'react-router-dom';
import { showConfirm } from '../../../components/context/atoms/ComfirmModal';
import { AlertContext } from '../../../contexts/alert.context';
import { AuthContext } from '../../../contexts/auth.context';
import useToggle from '../../../hooks/useToggle';

function Register(props) {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  
  const { setAlert } = alertContext;
  const { register, error, clearErrors, isAuthenticated } = authContext;
  
  useEffect(() => {
    if (isAuthenticated) {
      // 로그인이 되어있으면 홈으로 보냄
      props.history.push('/');
    }
    if (error) {
      setAlert(error, "error");
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated]);
  
  const [agreement, toggle] = useToggle();
  const [user, setUser] = useState({
    nickname: '',
    email: '',
    password: '',
    password2: '',
  });

  const { nickname, email, password, password2 } = user;

  const onChange = e =>
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });

  const onSubmit = e => {
    e.preventDefault();
    if (nickname === '' || email === '' || password === '') {
      setAlert('모든 항목을 채우세요', 'error');
    } else if (password !== password2) {
      setAlert('비밀번호가 일치하지 않습니다.', 'error');
    } else if (!agreement) {
      setAlert('회원약관에 동의하지 않았습니다.')
    } else  {
      register({ nickname, email, password });
    } 
  };

  return (
    <div>
      <Row type="flex" justify="center">
        <Col>
          <h1>
            계정 <span>등록</span>
          </h1>
        </Col>
      </Row>
      <Row type="flex" justify="center">
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="nickname">닉네임</label>
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              name="nickname"
              value={nickname}
              placeholder="닉네임"
              required
              onChange={onChange}
            />
          </div>
          <div>
            <label htmlFor="email">이메일</label>
            <Input
              type="email"
              name="email"
              value={email}
              placeholder="이메일"
              required
              onChange={onChange}
            />
          </div>
          <div>
            <label htmlFor="password">비밀번호</label>
            <Input
              type="password"
              name="password"
              value={password}
              placeholder="비밀번호"
              required
              minLength={6}
              onChange={onChange}
            />
          </div>
          <div>
            <label htmlFor="password2">비밀번호 확인</label>
            <Input
              type="password"
              name="password2"
              value={password2}
              placeholder="비밀번호 확인"
              required
              minLength={6}
              onChange={onChange}
            />
          </div>
          <Row type="flex" justify="end" style={{marginTop: "10px"}}>
            <Col>
              <Checkbox value={agreement} onChange={toggle}> </Checkbox>
              <Button  onClick={()=> showConfirm({title: "hello", content: "동의하시죠?"})} > 회원약관보기 </Button>
            </Col>
          </Row>
          <Button
            htmlType="submit"
            type="primary"
            block
            style={{ marginTop: '15px' }}
          >
            가입
          </Button>
        </form>
      </Row>
    </div>
  );
}

export default withRouter(Register);
