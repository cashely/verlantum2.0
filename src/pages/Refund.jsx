import React, { Component } from 'react';
import { Popover, Layout, Pagination, Table, Button, Icon, Popconfirm, message } from 'antd';
import { Link } from 'react-router-dom';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';

export default class Refund extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refunds: [],
      total: 0,
      id: null,
      page: 1,
      pageSize: 20,
      visible: {
        good: false
      }
    }
  }

  refundAction(id) {
    $.put(`/refund/${id}`, { success: 1 }).then(res => {
      if (res.code === 0) {
        message.success('操作成功');
        this.listAction();
        this.countAction();
      } else {
        message.error(res.data);
      }
    })
  }

  listAction() {
    const { page, pageSize } = this.state;
    $.get('/refund/list', { page, pageSize }).then(res => {
      if(res.code === 0) {
        this.setState({
          refunds: res.data,
        })
      }
    })
  }

  countAction() {
    $.get('/refund/count').then(res => {
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
    this.countAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '商品名称',
        dataIndex: 'goodNumber',
        render: d => d.title,
      },
      {
        title: '订单编号',
        dataIndex: 'orderId',
        render: d => d._id
      },
      {
        title: '联系人',
        dataIndex: 'orderId',
        render: d => d.username
      },
      {
        title: '联系方式',
        dataIndex: 'orderId',
        render: d => d.phone
      },
      {
        title: '是否处理',
        dataIndex: 'success',
        render: d => d === 1 ? '是' : '否',
      },
      {
        title: '申请时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD hh:mm')
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            {
              !row.success && (
                <Popconfirm
                  title="您确定要退款?"
                  onConfirm={this.refundAction.bind(this, row._id)}
                  okText="是"
                  cancelText="否"
                >
                  <Button type="primary" size="small">处理</Button>
                </Popconfirm>
              )
            }
          </React.Fragment>
        )
      }
    ];
    const { history } = this.props;
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          {/* <Button type="primary" onClick={() => history.push('/index/good/create')}><Icon type="plus"/>新增商品</Button> */}
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.refunds} size="middle" bordered pagination={false}/>
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.pageSize} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
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
