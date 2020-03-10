import React, { Component } from 'react';
import { Layout, Table, Icon, Button } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import AuthModal from '../components/models/AuthModal';

export default class Arg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auths: [],
      id: null,
      visible: {
        auth: false
      },
      conditions: {
      }
    }
  }

  cancelModelAction(modelName) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = false;
    this.setState({
      visible,
      id: null
    })
  }

  openModelAction(modelName, id = null) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = true;
    this.setState({
      visible,
      id
    })
  }

  okCostDetailModalAction() {
    this.cancelModelAction('auth');
    this.listAction();
  }

  listAction() {
    $.get('/auth/list', {...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.setState({
          auths: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/auth/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  conditionsChangeAction(e, field, type) {
    let value;
    switch(type) {
      default: value = e;
    }
    this.setState({
      conditions: Object.assign({}, this.state.conditions, {[field]: value})
    });
  }

  searchAction() {
    this.setState({
      page: 1
    }, this.listAction);
  }

  pageChangeAction(page, pageSize) {
    this.setState({
      page
    }, this.listAction);
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '接口名称',
        dataIndex: 'title'
      },
      {
        title: '权限地址',
        dataIndex: 'path'
      },
      {
        title: '接口方法',
        dataIndex: 'method'
      },
      {
        title: '角色',
        dataIndex: 'role',
        render:d => {
          switch(d) {
            case 0 : return '普通角色'; break;
            case 3 : return '超级管理员'; break;
            default: return '';
          }
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('auth', row._id)}} size="small"><Icon type="edit"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Button type="primary" onClick={this.openModelAction.bind(this, 'auth', null)}><Icon type="plus"/>新增权限</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.auths} size="middle" bordered pagination={false}/>
            {
              this.state.visible.auth && <AuthModal id={this.state.id} visible={this.state.visible.auth} onOk={this.okCostDetailModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'auth')}/>
            }
        </Content>
      </Layout>
    )
  }
}
