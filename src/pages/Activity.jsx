import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload, Popconfirm, message } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';

export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      total: 0,
      page: 1,
      limit: 20,
    }
  }

  listAction() {
    $.get('/form/users', { page: this.state.page, limit: this.state.limit }).then(res => {
      if(res.code === 0) {
        this.setState({
          users: res.data
        })
        this.countAction()
      }
    })
  }

  changePage(page) {
    this.setState({
      page
    }, () => {
      this.listAction()
    })
  }

  countAction() {
    $.get('/form/count').then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '姓名',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        key: 'phone'
      },
      {
        title: '所属单位',
        dataIndex: 'company',
        key: 'company'
      },
      {
        title: '活动编号',
        dataIndex: 'num',
        key: 'num'
      },
      {
        title: '状态',
        dataIndex: 'winItem',
        render: d => d ? <Tag color="green">中奖</Tag> : <Tag color="red">未中奖</Tag>
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.users} size="middle" bordered pagination={false}/>
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.limit} onChange={this.changePage.bind(this)} />
        </Footer>
      </Layout>
    )
  }
}
