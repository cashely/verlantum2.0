import React, {Component} from 'react';
import {
  DatePicker,
  Layout,
  Pagination,
  Table,
  Tag,
  Progress,
  Button,
  Icon,
  Popconfirm
} from 'antd';
import moment from 'moment';
import $ from '../ajax';
import UserModal from '../components/UserModal';
export default class User extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userVisiable: false,
      users: [],
      uid: null,
      total: 0,
      page: 1,
      limit: 20,
      // caseAble: false
    }
    // this.userDeleteAction = this.userDeleteAction.bind(this)
  }
  userCancelAction() {
    this.setState({userVisiable: false})
  }

  userShowAction() {
    this.setState({userVisiable: true})
  }

  usersAction() {
    $.get('/users', { page: this.state.page, limit: this.state.limit }).then(res => {
      this.countListAction();
      this.setState({users: res.data})
    })
  }

  countListAction() {
    $.get('/users/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  pageChangeAction(page, pageSize) {
    this.setState({
      page
    }, this.usersAction);
  }

  userDeleteAction(uid) {
    $.delete(`/user/${uid}`).then(res => {
      if(res.data === 'ok') {
        this.usersAction();
      }
    })
  }
  checkUserDetailAction(uid) {
    this.setState({
      uid,
      userVisiable: true
    })
  }
  addUserAction(user) {
    let promise = this.state.uid ? $.put(`/user/${this.state.uid}`, user) : $.post('/user', user);
    promise.then(res => {
      if (res.data === 'ok') {
        this.setState({
          uid: null
        })
        this.userCancelAction();
        this.usersAction();
      }
    })
  }

  componentWillMount() {
    this.usersAction()
  }
  render() {
    const columns = [
      {
        title: '账号',
        dataIndex: 'acount'
      }, {
        title: '角色',
        dataIndex: 'role',
        render: d => <Tag>{
              (() => {
                let u;
                switch (d) {
                  case 0 :
                    u = '普通角色';
                    break;
                  case 1 :
                    u = '测试角色';
                    break;
                  case 2 :
                    u = '开发角色';
                    break;
                  case 3 :
                    u = '超级管理员';
                    break;
                  default :
                    u = '错误状态';
                }
                return u;
              })()
            }</Tag>
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => moment(d).format('YYYY-MM-DD HH:mm:ss')
      }, {
        title: '状态',
        dataIndex: 'statu',
        render: d => <Tag color="green">{
              d === 1
                ? '正常'
                : '异常'
            }</Tag>
      }, {
        title: '操作',
        key: '_id',
        align: 'center',
        render: row => (<React.Fragment>
          <Button type="primary" size="small" onClick={this.checkUserDetailAction.bind(this, row._id)}><Icon type="edit"/></Button>
          <Popconfirm title="您确定要删除吗？" onConfirm={this.userDeleteAction.bind(this, row._id)} onCancel={() => {}}>
            <Button type="danger" size="small"><Icon type="delete"/></Button>
          </Popconfirm>
        </React.Fragment>)
      }
    ];
    const {Content, Footer, Header} = Layout;
    return (<Layout style={{
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex'
      }}>
      <Header style={{
          backgroundColor: '#fff',
          padding: 10,
          height: 'auto',
          lineHeight: 1
        }}>
        <Button type="primary" onClick={this.userShowAction.bind(this)}><Icon type="plus"/>
          添加用户</Button>
      </Header>
      <Content style={{
          overflow: 'auto'
        }}>
        <Table rowKey="id" columns={columns} dataSource={this.state.users} size="middle" bordered pagination={false}/>
        {
          this.state.userVisiable ? <UserModal uid={this.state.uid} visible={this.state.userVisiable} onOk={this.addUserAction.bind(this)} onCancel={this.userCancelAction.bind(this)}/> : null
        }
      </Content>
      <Footer style={{
          padding: 5,
          backgroundColor: '#fff'
        }}>
        <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
      </Footer>
    </Layout>)
  }
}

let dataSources = []

for (var a = 0; a < 20; a++) {
  dataSources.push({
    id: a,
    acount: `用户${a + 1}`,
    statu: 1,
    role: 0,
    created: '2013-01-02',
    updated: '2013-01-03'
  })
}
