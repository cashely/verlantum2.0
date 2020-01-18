import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import PusherModal from '../components/models/PusherModal';

export default class Outer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pushers: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        pusher: false
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

  okPusherModalAction() {
    this.cancelModelAction('pusher');
    this.listAction();
  }

  listAction() {
    $.get('/pushers', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          pushers: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/pullers/total', this.state.conditions).then(res => {
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
    }, this.listAction);
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '送货方名称',
        dataIndex: 'title',
      },
      {
        title: '联系人',
        dataIndex: 'contact',
      },
      {
        title: '联系地址',
        dataIndex: 'address',
      },
      {
        title: '联系方式',
        dataIndex: 'tel',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'created',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('pusher', row._id)}} size="small"><Icon type="edit"/></Button>
            // <Button style={{marginLeft: 10}} type="danger" size="small"><Icon type="delete"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Button type="primary" onClick={this.openModelAction.bind(this, 'pusher', null)}><Icon type="plus"/>新增送货方</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.pushers} size="middle" bordered pagination={false}/>
            {
              this.state.visible.pusher && <PusherModal id={this.state.id} visible={this.state.visible.pusher} onOk={this.okPusherModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'pusher')}/>
            }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
        </Footer>
      </Layout>
    )
  }
}

let dataSources = []

for(var a = 0; a < 20; a++) {
  dataSources.push({
    id: a,
    title: `测试用例${a+1}`,
    total: 50,
    successed: 20,
    failed: 20,
    undo: 10,
    creater: '张三',
    runtime: '2013-01-01',
    created: '2013-01-02'
  })
}
