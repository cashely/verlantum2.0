import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import loadable from '@loadable/component';
import './index.css';
import 'antd/dist/antd.css';
import App from './App';
// import Home from './pages/Home';
// import Add from './pages/Add';
// import DetailList from './pages/DetailList';
// import User from './pages/User';
// import Outer from './pages/Outer';
// import Inner from './pages/Inner';
// import Pushers from './pages/Pushers';
// import Pullers from './pages/Pullers';
// import Fruits from './pages/Fruits';
// // import Login from './pages/Login';
// import Arg from './pages/Arg';
// import Apis from './pages/Apis';
// import Auth from './pages/Auth';
import { Auth, Apis, Arg, Fruits, Pullers, Pushers, Inner, Outer, User, DetailList, Add, Home, Good} from './route';
import $ from './ajax';
import * as serviceWorker from './serviceWorker';
import zhCN from 'antd/es/locale/zh_CN';

import {Layout, Menu, Icon, ConfigProvider, Avatar, Dropdown, message} from 'antd';
import {Switch, HashRouter as Router, Route, Link, useRouteMatch, useLocation} from 'react-router-dom';
import {createHashHistory} from 'history';
import {withRouter} from 'react-router';



function Index(props) {
  const ro = useRouteMatch();
  const lo = useLocation();
  const {Header, Sider, Content, Footer} = Layout;
  const {SubMenu, Item} = Menu;

  function logOutAction() {
    $.post('/logout').then(res => {
      if(res.code === 0) {
        message.success('注销成功');
        props.history.push('/');
      }else {
        message.error('注销失败');
      }
    })
  }

  const [user, setUser] = useState({});

  useEffect(() => {
    $.get('/me').then(res => {
      if(res.code === 0) {
        setUser(res.data)
      }else {
        props.history.push('/');
      }
    })
  }, [])

  return (
    <Router>
      <Layout style={{
          display: 'flex',
          height: '100vh'
        }}>
        <Header style={{color: '#fff', padding: '15px 10px', height: 'auto', lineHeight: 1, fontSize: 20, display: 'flex', alignItems: 'center'}}>
          <div style={{color: '#000', backgroundColor: '#fff', fontSize: 24, borderRadius: 5, width: 120, height: 26, fontWeight: 600, lineHeight: 1, textAlign: 'center', marginRight: 5}}>Verlantum</div>云量科技后台管理系统
          <div style={{marginLeft: 'auto'}}>
            <Dropdown overlay={
                  <Menu>
                    <Item onClick={logOutAction}>注销</Item>
                  </Menu>
            }>
              <Avatar style={{backgroundColor: '#ffbf00'}} shape="square">{user.acount && user.acount.slice(-1).toUpperCase()}</Avatar>
            </Dropdown>
          </div>
        </Header>
        <Layout style={{
            flex: 1
          }}>
          <Sider width={200} style={{
              backgroundColor: '#fff'
            }}>
            <Menu mode="inline" defaultSelectedKeys={[lo.pathname]} defaultOpenKeys={['sub1']} style={{
                borderRight: 0,
                height: '100%'
              }}>
              <SubMenu key="sub1" title={<span> < Icon type = "tool" /> 销售管理</span>}>
                <Item key="/index">
                  <Link to="/index"><Icon type="book"/> 主页看板</Link>
                </Item>
                <Item key="/index/inner">
                  <Link to="/index/inner"><Icon type="user"/> 订单管理</Link>
                </Item>
                <Item key="/index/good">
                  <Link to="/index/good"><Icon type="box"/> 商品管理</Link>
                </Item>
              </SubMenu>
              <Item key="/index/users">
                <Link to="/index/users"><Icon type="setting"/> 设置</Link>
              </Item>
              <Item key="/index/pullers">
                <Link to="/index/pullers"><Icon type="setting"/> 代理商管理</Link>
              </Item>
              <Item key="/index/Args">
                <Link to="/index/Args"><Icon type="setting"/> 系统变量</Link>
              </Item>
              <Item key="/index/apis">
                <Link to="/index/apis"><Icon type="setting"/> 接口列表</Link>
              </Item>
              <Item key="/index/auths">
                <Link to="/index/auths"><Icon type="setting"/> 权限管理</Link>
              </Item>
            </Menu>
          </Sider>
          <Layout>
            <Content style={{padding: 10}}>
              <Routes/>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  )
}

function Routes(props) {
  return (
      <Switch>
        <Route exact path="/index" component={Home}>
        </Route>
        <Route exact path="/index/add" component={Add}>
        </Route>
        <Route exact path="/index/detail-list/:id" component={DetailList}>
        </Route>
        <Route exact path="/index/users" component={User}>
        </Route>
        <Route exact path="/index/outer" component={Outer} />
        <Route exact path="/index/inner" component={Inner} />
        <Route exact path="/index/pushers" component={Pushers} />
        <Route exact path="/index/pullers" component={Pullers} />
        <Route exact path="/index/fruits" component={Fruits} />
        <Route exact path="/index/args" component={Arg} />
        <Route exact path="/index/apis" component={Apis} />
        <Route exact path="/index/auths" component={Auth} />
        <Route exact path="/index/good" component={Good} />
      </Switch>
  )
}


function Global(props) {
  const {Header, Sider, Content, Footer} = Layout;
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout style={{
            display: 'flex',
            height: '100vh'
          }}>
          <Content>
            <Switch>
              <Route component={Index} path="/index" />
              <Route exact path="/" component={loadable(() => import('./pages/Login'))} />
            </Switch>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  )
}

ReactDOM.render(<Global/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
